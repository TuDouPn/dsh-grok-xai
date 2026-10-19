/**
 * Grok (xAI subscription) — Host half.
 *
 * The Harness already ships the hard parts: `dsh-llm-pi-ai` registers pi-ai's
 * xAI catalog provider and a device-code OAuth flow keyed by the
 * `llm-pi-ai/xai` credential record, and the model picker reads the resulting
 * route. What it does not ship is a browser surface that can start that flow,
 * because the generic authorization seam is not exposed over Typert Remote.
 *
 * This half closes that gap with same-origin JSON routes under `/grok-auth/`.
 * The Client half renders a card on Settings → Models and calls them with plain
 * `fetch`. The flow itself, the credential record, and its refresh remain owned
 * by `ctx.authorization`; this plugin never logs or returns a token.
 *
 * Beyond sign-in, the card reports two live observations:
 * - SuperGrok subscription usage from Grok's own billing payload
 *   (`cli-chat-proxy.grok.com/v1/billing?format=credits`), the same figure the
 *   Grok CLI shows.
 * - The model list from `api.x.ai/v1/models`, which can be written into the
 *   `llm-pi-ai` route so the picker follows the provider instead of the
 *   installed pi-ai catalog.
 */

const CREDENTIAL_KEY = 'llm-pi-ai/xai'
const PROVIDER_ID = 'xai'
const PI_AI_ENTRY_ID = 'llm-pi-ai'
const BILLING_URL = 'https://cli-chat-proxy.grok.com/v1/billing?format=credits'
const SETTINGS_URL = 'https://cli-chat-proxy.grok.com/v1/settings'
const MODELS_URL = 'https://api.x.ai/v1/models'
const TOKEN_URL = 'https://auth.x.ai/oauth2/token'
const CLIENT_ID = 'b1a00492-073a-47ea-816f-4c329264a828'
const OBSERVABILITY_TTL_MS = 60_000
const REFRESH_SKEW_MS = 2 * 60 * 1000

export const inject = ['webServer', 'authorization', 'credentials']

class GrokAuthError extends Error {
  constructor(code, message) {
    super(message ?? code)
    this.name = 'GrokAuthError'
    this.code = code
  }
}

/** @param {any} ctx */
export function apply(ctx) {
  /** @type {undefined | {status: string, notices: any[], error: string | null, providerAddError: string | null, addingProvider: boolean, syncedModels?: number, controller: AbortController}} */
  let attempt
  /** @type {undefined | {at: number, data: any}} */
  let observabilityCache

  const providerConfigured = () => {
    const editor = ctx.get('configEditor')
    if (editor === undefined) return false
    const entry = editor.entries().find((candidate) => candidate.options.id === PI_AI_ENTRY_ID)
    const providers = entry?.options?.config?.providers
    return providers !== null && typeof providers === 'object' && Object.hasOwn(providers, PROVIDER_ID)
  }

  const providerModelsConfigured = () => {
    const editor = ctx.get('configEditor')
    if (editor === undefined) return false
    const entry = editor.entries().find((candidate) => candidate.options.id === PI_AI_ENTRY_ID)
    const models = entry?.options?.config?.providers?.[PROVIDER_ID]?.models
    return Array.isArray(models) && models.length > 0
  }

  const readOauthPayload = async () => {
    const record = await ctx.credentials.readRecord(CREDENTIAL_KEY)
    if (record === undefined || record.kind !== 'grant') return undefined
    const payload = record.payload
    if (payload === null || typeof payload !== 'object' || payload.type !== 'oauth') return undefined
    return payload
  }

  /**
   * Return a usable access token, refreshing the stored OAuth record first
   * when it is at or near expiry. Refresh happens inside the credential
   * store's `modifyRecord` lock, so a concurrent pi-ai refresh cannot be
   * overwritten by a staler token.
   */
  const accessToken = async () => {
    const payload = await readOauthPayload()
    if (payload === undefined) throw new GrokAuthError('SIGN_IN_REQUIRED', 'no xAI OAuth record')
    if (typeof payload.access === 'string' && payload.access.length > 0) {
      const expires = Number(payload.expires)
      if (!Number.isFinite(expires) || expires > Date.now() + REFRESH_SKEW_MS) return payload.access
    }
    if (typeof payload.refresh !== 'string' || payload.refresh.length === 0) {
      throw new GrokAuthError('SIGN_IN_REQUIRED', 'no xAI refresh token')
    }
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: payload.refresh,
    })
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) {
      throw new GrokAuthError(
        response.status === 401 || response.status === 403 ? 'SIGN_IN_REQUIRED' : 'TOKEN_REFRESH_FAILED',
        `xAI token refresh HTTP ${response.status}`,
      )
    }
    const fresh = await response.json()
    if (typeof fresh.access_token !== 'string' || fresh.access_token.length === 0) {
      throw new GrokAuthError('TOKEN_REFRESH_FAILED', 'xAI token refresh returned no access token')
    }
    const next = {
      type: 'oauth',
      access: fresh.access_token,
      refresh: typeof fresh.refresh_token === 'string' ? fresh.refresh_token : payload.refresh,
      expires:
        Date.now() +
        (typeof fresh.expires_in === 'number' && fresh.expires_in > 0 ? fresh.expires_in : 3600) * 1000 -
        5 * 60 * 1000,
    }
    const saved = await ctx.credentials.modifyRecord(CREDENTIAL_KEY, async (current) => {
      const currentPayload = current?.kind === 'grant' ? current.payload : undefined
      if (
        currentPayload !== null &&
        typeof currentPayload === 'object' &&
        currentPayload.type === 'oauth' &&
        Number(currentPayload.expires) > Date.now() + REFRESH_SKEW_MS
      ) {
        return current
      }
      return { kind: 'grant', payload: next }
    })
    const savedPayload = saved?.kind === 'grant' ? saved.payload : undefined
    if (savedPayload !== null && typeof savedPayload === 'object' && typeof savedPayload.access === 'string') {
      return savedPayload.access
    }
    return next.access
  }

  const requestJson = async (url, token, headers = {}) => {
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new GrokAuthError('SIGN_IN_REQUIRED', `xAI HTTP ${response.status}`)
      }
      throw new Error(`xAI HTTP ${response.status}`)
    }
    return response.json()
  }

  const parseBilling = (payload) => {
    const config = payload?.config
    if (config === null || typeof config !== 'object') throw new Error('billing payload has no config')
    const current = config.currentPeriod ?? config.current_period ?? {}
    const rawPercent = config.creditUsagePercent ?? config.credit_usage_percent
    let percent = 0
    if (rawPercent !== undefined && rawPercent !== null && Number.isFinite(Number(rawPercent))) {
      percent = Math.round(Math.max(0, Math.min(100, Number(rawPercent))))
    } else {
      const used = config.used !== null && typeof config.used === 'object' ? Number(config.used.val) : undefined
      const limit =
        config.monthlyLimit !== null && typeof config.monthlyLimit === 'object'
          ? Number(config.monthlyLimit.val)
          : undefined
      if (Number.isFinite(used) && Number.isFinite(limit) && limit > 0) {
        percent = Math.round(Math.max(0, Math.min(100, (used / limit) * 100)))
      }
    }
    const products = Array.isArray(config.productUsage)
      ? config.productUsage
          .map((item) => ({
            product: typeof item?.product === 'string' ? item.product : '',
            percent: Number.isFinite(Number(item?.usagePercent)) ? Math.round(Number(item.usagePercent)) : 0,
          }))
          .filter((item) => item.product.length > 0)
      : []
    const periodRaw = typeof current.type === 'string' ? current.type : ''
    const period = periodRaw.endsWith('WEEKLY') ? 'weekly' : periodRaw.endsWith('MONTHLY') ? 'monthly' : 'unknown'
    const resetRaw = current.end ?? config.billingPeriodEnd ?? config.billing_period_end
    let resetAt
    if (typeof resetRaw === 'string') {
      const parsed = Date.parse(resetRaw)
      if (Number.isFinite(parsed)) resetAt = new Date(parsed).toISOString()
    }
    const prepaidRaw = config.prepaidBalance ?? config.prepaid_balance
    const prepaidValue = prepaidRaw !== null && typeof prepaidRaw === 'object' ? Number(prepaidRaw.val) : undefined
    const prepaidBalance =
      prepaidValue !== undefined && Number.isFinite(prepaidValue) ? prepaidValue / 100 : undefined
    const planRaw = payload.subscription_tier ?? payload.subscriptionTier
    const plan = typeof planRaw === 'string' && planRaw.trim().length > 0 ? planRaw.trim() : 'SuperGrok'
    return { plan, percent, period, resetAt, products, prepaidBalance }
  }

  const displayName = (id) => {
    const known = {
      'grok-4.3': 'Grok 4.3',
      'grok-4.5': 'Grok 4.5',
      'grok-4.6': 'Grok 4.6',
      'grok-4.7': 'Grok 4.7',
      'grok-4.20-0309-reasoning': 'Grok 4.20 (Reasoning)',
      'grok-4.20-0309-non-reasoning': 'Grok 4.20 (Non-reasoning)',
      'grok-4.20-multi-agent-0309': 'Grok 4.20 Multi-Agent',
      'grok-build-0.1': 'Grok Build 0.1',
    }
    if (known[id] !== undefined) return known[id]
    let rest = id
    if (rest.startsWith('grok-')) rest = rest.slice(5)
    rest = rest.replace(/-\d{4}(?=-|$)/g, '')
    rest = rest.replace(/-non-reasoning$/, ' (Non-reasoning)')
    rest = rest.replace(/-reasoning$/, ' (Reasoning)')
    rest = rest.replace(/-multi-agent$/, ' Multi-Agent')
    rest = rest.replace(/-/g, ' ')
    rest = rest.replace(/(^|\s)([a-z])/g, (_match, space, letter) => space + letter.toUpperCase())
    return ('Grok ' + rest).trim()
  }

  const pricePerMillion = (value) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric >= 0 ? numeric / 10000 : undefined
  }

  const parseModels = (payload) => {
    const data = Array.isArray(payload?.data) ? payload.data : []
    return data
      .filter((model) => model !== null && typeof model === 'object' && typeof model.id === 'string')
      .filter((model) => Number.isFinite(Number(model.completion_text_token_price)))
      .filter((model) => !/imagine|image|video|embed|tts|whisper/i.test(model.id))
      .map((model) => ({
        id: model.id,
        name: displayName(model.id),
        contextWindow: Number.isFinite(Number(model.context_length)) ? Number(model.context_length) : undefined,
        input: Number(model.prompt_image_token_price) > 0 ? ['text', 'image'] : ['text'],
        pricing: {
          input: pricePerMillion(model.prompt_text_token_price),
          output: pricePerMillion(model.completion_text_token_price),
          cachedInput: pricePerMillion(model.cached_prompt_text_token_price),
          longContextInput: pricePerMillion(model.prompt_text_token_price_long_context),
          longContextOutput: pricePerMillion(model.completion_text_token_price_long_context),
          longContextThreshold: Number.isFinite(Number(model.long_context_threshold))
            ? Number(model.long_context_threshold)
            : undefined,
        },
        createdAt: Number.isFinite(Number(model.created)) ? Number(model.created) : undefined,
      }))
  }

  /**
   * Read one model's declared capabilities. The list endpoint describes only
   * identity and price; `/v1/models/{id}` is the authority for which reasoning
   * efforts a model actually accepts. Models whose detail carries no
   * `capabilities.reasoning_effort` get no effort control, which is the safe
   * shape: `grok-4.20-0309-reasoning` and `grok-build-0.1` reject the
   * reasoning-effort parameter, and `grok-4.20-multi-agent-0309` publishes no
   * effort options even though it accepts the field.
   */
  const fetchModelDetails = async (token, models) =>
    Promise.all(
      models.map(async (model) => {
        try {
          const payload = await requestJson(`${MODELS_URL}/${encodeURIComponent(model.id)}`, token)
          const capabilities = payload?.capabilities
          const efforts = Array.isArray(capabilities?.reasoning_effort)
            ? capabilities.reasoning_effort.filter((value) => typeof value === 'string')
            : undefined
          const defaultEffort =
            typeof capabilities?.default_reasoning_effort === 'string'
              ? capabilities.default_reasoning_effort
              : undefined
          return { ...model, efforts, defaultEffort }
        } catch (error) {
          ctx.logger.warn('grok-xai: could not read model detail for "%s"', model.id)
          ctx.logger.warn(error)
          return model
        }
      }),
    )

  const reasoningEffortsFor = (model) => {
    if (!Array.isArray(model.efforts) || model.efforts.length === 0) return false
    const efforts = {}
    for (const value of model.efforts) {
      if (value === 'none') efforts.off = 'none'
      else if (['minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(value)) efforts[value] = value
    }
    return Object.keys(efforts).length > 0 ? efforts : false
  }

  const parseSettings = (payload) => ({
    plan:
      typeof payload?.subscription_tier_display === 'string' && payload.subscription_tier_display.trim().length > 0
        ? payload.subscription_tier_display.trim()
        : undefined,
    defaultModel: typeof payload?.default_model === 'string' ? payload.default_model : undefined,
    features: {
      imageGeneration: payload?.image_gen_enabled === true,
      videoGeneration: payload?.video_gen_enabled === true,
      webFetch: payload?.web_fetch_enabled === true,
      memory: payload?.memory_enabled === true,
      voice: payload?.voice_mode_enabled === true,
    },
  })

  const fetchBilling = async (token) =>
    parseBilling(
      await requestJson(BILLING_URL, token, {
        'x-xai-token-auth': 'xai-grok-cli',
        'x-grok-client-mode': 'cli',
        'x-grok-client-version': '1.0.4',
      }),
    )

  const fetchSettings = async (token) =>
    parseSettings(
      await requestJson(SETTINGS_URL, token, {
        'x-xai-token-auth': 'xai-grok-cli',
        'x-grok-client-mode': 'cli',
        'x-grok-client-version': '1.0.4',
      }),
    )

  const fetchModels = async (token) => parseModels(await requestJson(MODELS_URL, token))

  const errorCode = (error) => {
    if (error instanceof GrokAuthError) return error.code
    const message = error instanceof Error ? error.message : String(error)
    if (/HTTP 401|HTTP 403/.test(message)) return 'SIGN_IN_REQUIRED'
    return message
  }

  const configuredModels = () => {
    const editor = ctx.get('configEditor')
    if (editor === undefined) return []
    const entry = editor.entries().find((candidate) => candidate.options.id === PI_AI_ENTRY_ID)
    const models = entry?.options?.config?.providers?.[PROVIDER_ID]?.models
    return Array.isArray(models) ? models : []
  }

  const observability = async (force = false) => {
    if (!force && observabilityCache !== undefined && Date.now() - observabilityCache.at < OBSERVABILITY_TTL_MS) {
      return observabilityCache.data
    }
    let token
    try {
      token = await accessToken()
    } catch (error) {
      const data = {
        signedIn: false,
        plan: undefined,
        billing: null,
        models: null,
        features: undefined,
        error: errorCode(error),
        fetchedAt: Date.now(),
      }
      observabilityCache = { at: Date.now(), data }
      return data
    }
    const [billing, models, settings] = await Promise.allSettled([
      fetchBilling(token),
      fetchModels(token),
      fetchSettings(token),
    ])
    const failures = [billing, models].filter((result) => result.status === 'rejected')
    const settingsValue = settings.status === 'fulfilled' ? settings.value : undefined
    const configured = new Map(configuredModels().map((model) => [model.id, model]))
    const llm = ctx.get('llm')
    const liveModels =
      models.status === 'fulfilled'
        ? await Promise.all(
            models.value.map(async (model) => {
              const base = {
                ...model,
                reasoningEfforts: configured.get(model.id)?.reasoningEfforts,
              }
              if (llm === undefined) return base
              try {
                const info = await llm.resolveModelInfo(PROVIDER_ID, model.id)
                return { ...base, resolvedReasoning: info?.reasoning ?? null }
              } catch {
                return { ...base, resolvedReasoning: null }
              }
            }),
          )
        : null
    const billingValue = billing.status === 'fulfilled' ? billing.value : null
    if (billingValue !== null && settingsValue?.plan !== undefined) billingValue.plan = settingsValue.plan
    const data = {
      signedIn: true,
      plan: settingsValue?.plan,
      defaultModel: settingsValue?.defaultModel,
      features: settingsValue?.features,
      billing: billingValue,
      models: liveModels,
      error: failures.length === 0 ? null : errorCode(failures[0].reason),
      fetchedAt: Date.now(),
    }
    observabilityCache = { at: Date.now(), data }
    return data
  }

  /**
   * Add or replace the xAI profile's model list with the provider's live list.
   * Known catalog ids keep their installed metadata because the adapter fills
   * unset fields from the catalog entry of the same id.
   */
  const syncModels = async (models) => {
    const editor = ctx.get('configEditor')
    if (editor === undefined) return { changed: false, reason: 'config-editor-unavailable' }
    const entry = editor.entries().find((candidate) => candidate.options.id === PI_AI_ENTRY_ID)
    if (entry === undefined) return { changed: false, reason: 'entry-unavailable' }
    const rows = models.map((model) => ({
      id: model.id,
      name: model.name,
      ...(model.contextWindow === undefined ? {} : { contextWindow: model.contextWindow }),
      ...(model.input === undefined ? {} : { input: model.input }),
      reasoningEfforts: reasoningEffortsFor(model),
    }))
    await editor.edit(entry, (current) => {
      const providers = { ...(current.providers ?? {}) }
      const existing = providers[PROVIDER_ID] ?? {}
      providers[PROVIDER_ID] = {
        ...existing,
        displayName: existing.displayName ?? 'xAI (Grok)',
        models: rows,
      }
      return { ...current, providers }
    })
    observabilityCache = undefined
    return { changed: true, reason: 'synced', count: rows.length }
  }

  const ensureProvider = async () => {
    const editor = ctx.get('configEditor')
    if (editor === undefined) return { changed: false, reason: 'config-editor-unavailable' }
    const entry = editor.entries().find((candidate) => candidate.options.id === PI_AI_ENTRY_ID)
    if (entry === undefined) return { changed: false, reason: 'entry-unavailable' }
    if (providerConfigured()) return { changed: false, reason: 'already-configured' }
    await editor.edit(entry, (current) => {
      const providers = { ...(current.providers ?? {}) }
      providers[PROVIDER_ID] = {
        ...(providers[PROVIDER_ID] ?? {}),
        displayName: providers[PROVIDER_ID]?.displayName ?? 'xAI (Grok)',
      }
      return { ...current, providers }
    })
    observabilityCache = undefined
    return { changed: true, reason: 'added' }
  }

  const snapshot = async () => {
    let configured = false
    try {
      const record = await ctx.credentials.describeRecord(CREDENTIAL_KEY)
      configured = record?.configured === true
    } catch (error) {
      ctx.logger.warn('grok-xai: failed to describe the xAI credential record')
      ctx.logger.warn(error)
    }
    let auth
    try {
      auth = ctx.authorization.describe(CREDENTIAL_KEY)
    } catch (error) {
      ctx.logger.warn('grok-xai: failed to describe the xAI authorization flow')
      ctx.logger.warn(error)
    }
    const current = attempt
    const oauthMethod = auth?.methods?.find((method) => method.id === 'oauth')
    return {
      configured,
      authAvailable: auth !== undefined,
      methodLabel: oauthMethod?.label ?? null,
      inFlight: auth?.inFlight === true,
      status: current?.status ?? 'idle',
      notices: current?.notices ?? [],
      error: current?.error ?? null,
      addingProvider: current?.addingProvider === true,
      syncedModels: current?.syncedModels,
      providerConfigured: providerConfigured(),
      providerModelsConfigured: providerModelsConfigured(),
      canAddProvider: ctx.get('configEditor') !== undefined,
      providerAddError: current?.providerAddError ?? null,
    }
  }

  const startAttempt = () => {
    if (attempt?.status === 'pending') return
    const next = {
      status: 'pending',
      notices: [],
      error: null,
      providerAddError: null,
      addingProvider: false,
      syncedModels: undefined,
      controller: new AbortController(),
    }
    attempt = next
    ctx.authorization
      .begin({
        key: CREDENTIAL_KEY,
        method: 'oauth',
        signal: next.controller.signal,
        interaction: {
          notify(notice) {
            next.notices.push({
              message: typeof notice?.message === 'string' ? notice.message : '',
              ...(typeof notice?.url === 'string' ? { url: notice.url } : {}),
              ...(typeof notice?.code === 'string' ? { code: notice.code } : {}),
            })
            if (next.notices.length > 20) next.notices.splice(0, next.notices.length - 20)
          },
          prompt() {
            return Promise.reject(new Error('The Grok device sign-in does not expect a manual prompt.'))
          },
        },
      })
      .then(async (outcome) => {
        if (outcome.status !== 'authorized') {
          next.status = outcome.status
          return
        }
        next.status = 'authorized'
        observabilityCache = undefined
        next.addingProvider = true
        try {
          const token = await accessToken()
          const models = await fetchModels(token)
          const detailed = await fetchModelDetails(token, models)
          const result = await syncModels(detailed)
          if (result.changed) next.syncedModels = result.count
          else if (result.reason !== 'already-configured') next.providerAddError = result.reason
        } catch (error) {
          next.providerAddError = errorCode(error)
          ctx.logger.warn('grok-xai: signed in but could not sync the live model list')
          ctx.logger.warn(error)
          try {
            const result = await ensureProvider()
            if (result.reason !== 'added' && result.reason !== 'already-configured') {
              next.providerAddError = result.reason
            }
          } catch (addError) {
            next.providerAddError = errorCode(addError)
            ctx.logger.warn('grok-xai: could not add the xAI provider profile')
            ctx.logger.warn(addError)
          }
        } finally {
          next.addingProvider = false
        }
      })
      .catch((error) => {
        next.status = 'failed'
        next.error = error instanceof Error ? error.message : String(error)
      })
  }

  const signOut = async () => {
    try {
      if (attempt?.status === 'pending') ctx.authorization.cancel(CREDENTIAL_KEY)
    } catch (error) {
      ctx.logger.warn('grok-xai: failed to cancel the sign-in before sign-out')
      ctx.logger.warn(error)
    }
    attempt = undefined
    observabilityCache = undefined
    try {
      await ctx.credentials.deleteRecord(CREDENTIAL_KEY)
    } catch (error) {
      ctx.logger.warn('grok-xai: failed to delete the xAI credential record')
      ctx.logger.warn(error)
    }
  }

  const originAllowed = (req) => {
    const origin = req.headers.origin
    if (typeof origin !== 'string' || origin.length === 0) return true
    const host = req.headers.host
    if (typeof host !== 'string' || host.length === 0) return false
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  const sendJson = (res, status, body) => {
    const payload = JSON.stringify(body)
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(payload),
      'cache-control': 'no-store',
    })
    res.end(payload)
  }

  const route = (path, handler) => {
    const wrapped = async (req, res) => {
      try {
        if (!originAllowed(req)) {
          sendJson(res, 403, { ok: false, error: 'forbidden origin' })
          return
        }
        if ((req.method ?? 'GET').toUpperCase() !== handler.method) {
          sendJson(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        sendJson(res, 200, { ok: true, ...(await handler.run(req)) })
      } catch (error) {
        ctx.logger.warn('grok-xai: request handler failed')
        ctx.logger.warn(error)
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    }
    return ctx.webServer.register({ kind: 'exact', path, handler: wrapped })
  }

  ctx.effect(() => {
    const disposers = [
      route('/grok-auth/state', { method: 'GET', run: snapshot }),
      route('/grok-auth/sign-in', {
        method: 'POST',
        run: async () => {
          startAttempt()
          return snapshot()
        },
      }),
      route('/grok-auth/cancel', {
        method: 'POST',
        run: async () => {
          try {
            ctx.authorization.cancel(CREDENTIAL_KEY)
          } catch (error) {
            ctx.logger.warn('grok-xai: failed to cancel the xAI sign-in')
            ctx.logger.warn(error)
          }
          return snapshot()
        },
      }),
      route('/grok-auth/sign-out', {
        method: 'POST',
        run: async () => {
          await signOut()
          return snapshot()
        },
      }),
      route('/grok-auth/add-provider', {
        method: 'POST',
        run: async () => {
          let result
          try {
            result = await ensureProvider()
          } catch (error) {
            if (attempt !== undefined) attempt.providerAddError = errorCode(error)
          }
          const value = await snapshot()
          return { ...value, providerResult: result?.reason ?? 'error' }
        },
      }),
      route('/grok-auth/observability', {
        method: 'GET',
        run: async (req) => {
          const url = new URL(req.url ?? '/', 'http://x')
          const data = await observability(url.searchParams.get('refresh') === '1')
          return { ...(await snapshot()), observability: data }
        },
      }),
      route('/grok-auth/sync-models', {
        method: 'POST',
        run: async () => {
          let result
          try {
            const token = await accessToken()
            const models = await fetchModels(token)
            const detailed = await fetchModelDetails(token, models)
            result = await syncModels(detailed)
          } catch (error) {
            result = { changed: false, reason: errorCode(error) }
          }
          const data = await observability(true)
          const value = await snapshot()
          return { ...value, observability: data, syncResult: result }
        },
      }),
    ]
    return () => {
      for (const dispose of disposers) dispose()
      try {
        attempt?.controller.abort()
      } catch {
        /* already settled */
      }
    }
  }, 'grok-xai: host routes')
}
