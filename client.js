window.__ModuleLoader__.load({
  id: '@local/dsh-grok-xai',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'grokXai'

    const zh = {
      title: 'Grok（xAI 订阅）',
      description: '使用 SuperGrok 或 X Premium 订阅登录 xAI。登录成功后自动添加 xAI 提供商，并同步 xAI 实时返回的模型列表。',
      signedIn: '已登录',
      notSignedIn: '未登录',
      pending: '等待登录',
      failed: '登录失败',
      signIn: '登录 SuperGrok / X Premium',
      signOut: '退出登录',
      cancel: '取消登录',
      addProvider: '添加 xAI 提供商',
      addProviderRetry: '重试添加提供商',
      openPage: '打开 xAI 登录页',
      copyCode: '复制代码',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择代码。',
      starting: '正在向 xAI 申请登录代码…',
      deviceHint: '在打开的 xAI 页面中输入下面的代码，然后回到这里等待状态更新。',
      providerHint: '已登录，但自动添加 xAI 提供商没有完成。请重试，或在“添加模型提供商”中选择 xAI（API Key 留空）。',
      configUnavailable: '当前部署没有可写的配置编辑器，请到“添加模型提供商”中选择 xAI，API Key 留空。',
      entryUnavailable: '找不到 llm-pi-ai 配置项，请到“添加模型提供商”中选择 xAI。',
      modelHint: '模型列表已同步到 xAI 提供商。在输入框的模型菜单中选择 Grok 模型即可。',
      hostUnreachable: '无法连接到插件后台，请刷新页面后重试。',
      checking: '正在检查登录状态…',
      refresh: '刷新状态',
      usageLoading: '正在读取订阅用量…',
      usageSignIn: '登录后显示 SuperGrok 订阅用量。',
      usageRefreshFailed: '订阅凭证已过期，请重新登录。',
      usageUnavailable: '暂时无法读取订阅用量。',
      weeklyUsage: '本周订阅用量',
      monthlyUsage: '本月订阅用量',
      usageReset: '重置于 {time}',
      usageUpdated: '更新于 {time}',
      prepaid: '预付余额 ${amount}',
      liveModels: '实时模型',
      liveModelsHint: '列表来自 xAI /v1/models',
      syncModels: '刷新并同步模型',
      syncing: '同步中…',
      synced: '已同步 {count} 个模型，并按 xAI 返回的能力校准了推理强度。',
      syncFailed: '同步模型失败：{reason}',
      noModels: '未读取到实时模型列表',
      modelsSyncHint: '同步后，模型菜单使用 xAI 返回的列表，而不是内置目录。',
      productUsage: '分项',
      reasoningLabel: '推理',
      reasoningFixed: '固定（无强度选项）',
      reasoningNone: '非推理',
      reasoningNotSynced: '未同步',
      modelColumn: '模型',
      context: '上下文',
      inputPrice: '输入',
      outputPrice: '输出',
      cachedInput: '缓存输入',
      longContext: '长上下文',
      priceNote: '价格为美元 / 100 万 tokens；缓存输入和长上下文价格在悬停提示中。',
    }

    const en = {
      title: 'Grok (xAI Subscription)',
      description: 'Sign in to xAI with SuperGrok or X Premium. The xAI provider is added automatically, and the live model list returned by xAI is synced after sign-in.',
      signedIn: 'Signed in',
      notSignedIn: 'Not signed in',
      pending: 'Waiting for sign-in',
      failed: 'Sign-in failed',
      signIn: 'Sign in with SuperGrok / X Premium',
      signOut: 'Sign out',
      cancel: 'Cancel sign-in',
      addProvider: 'Add xAI provider',
      addProviderRetry: 'Retry adding provider',
      openPage: 'Open the xAI sign-in page',
      copyCode: 'Copy code',
      copied: 'Copied',
      copyFailed: 'Copy failed. Select the code manually.',
      starting: 'Requesting a sign-in code from xAI…',
      deviceHint: 'Enter the code below on the xAI page, then return here and wait for the status to update.',
      providerHint: 'Signed in, but adding the xAI provider did not finish. Retry, or add xAI under “Add model provider” and leave the API key blank.',
      configUnavailable: 'This deployment has no writable config editor. Add xAI under “Add model provider” and leave the API key blank.',
      entryUnavailable: 'The llm-pi-ai configuration entry is unavailable. Add xAI under “Add model provider”.',
      modelHint: 'The live model list has been synced to the xAI provider. Choose a Grok model in the composer model menu.',
      hostUnreachable: 'The plugin host is unreachable. Refresh the page and try again.',
      checking: 'Checking sign-in status…',
      refresh: 'Refresh status',
      usageLoading: 'Reading subscription usage…',
      usageSignIn: 'Sign in to see SuperGrok subscription usage.',
      usageRefreshFailed: 'The subscription credential expired. Sign in again.',
      usageUnavailable: 'Subscription usage is temporarily unavailable.',
      weeklyUsage: 'Weekly usage',
      monthlyUsage: 'Monthly usage',
      usageReset: 'Resets {time}',
      usageUpdated: 'Updated {time}',
      prepaid: 'Prepaid balance ${amount}',
      liveModels: 'Live models',
      liveModelsHint: 'From xAI /v1/models',
      syncModels: 'Refresh and sync models',
      syncing: 'Syncing…',
      synced: 'Synced {count} models and calibrated reasoning efforts from xAI capabilities.',
      syncFailed: 'Model sync failed: {reason}',
      noModels: 'No live model list was returned',
      modelsSyncHint: 'After syncing, the model menu follows the provider list instead of the installed catalog.',
      productUsage: 'Breakdown',
      reasoningLabel: 'Reasoning',
      reasoningFixed: 'Fixed (no effort options)',
      reasoningNone: 'Non-reasoning',
      reasoningNotSynced: 'Not synced',
      modelColumn: 'Model',
      context: 'Context',
      inputPrice: 'Input',
      outputPrice: 'Output',
      cachedInput: 'Cached input',
      longContext: 'Long context',
      priceNote: 'Prices are USD per 1M tokens; cached-input and long-context prices are in the hover tooltip.',
    }

    const api = async (path, method) => {
      const response = await fetch(path, {
        method: method ?? 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      let body
      try {
        body = await response.json()
      } catch {
        body = undefined
      }
      if (!response.ok || body === undefined || body.ok === false) {
        const message = body && typeof body.error === 'string' ? body.error : 'HTTP ' + response.status
        throw new Error(message)
      }
      return body
    }

    const fill = (text, values) =>
      Object.entries(values).reduce((result, [key, value]) => result.split('{' + key + '}').join(String(value)), text)

    const formatTime = (iso) => {
      if (typeof iso !== 'string' || iso.length === 0) return ''
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return ''
      try {
        return new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      } catch {
        return date.toLocaleString()
      }
    }

    const formatTokens = (value) => {
      const numeric = Number(value)
      if (!Number.isFinite(numeric) || numeric <= 0) return '—'
      if (numeric >= 1_000_000) {
        const millions = numeric / 1_000_000
        return (Number.isInteger(millions) ? String(millions) : millions.toFixed(1)) + 'M'
      }
      if (numeric >= 1_000) return Math.round(numeric / 1_000) + 'K'
      return String(Math.round(numeric))
    }

    const formatPrice = (value) => {
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return '—'
      return '$' + numeric.toFixed(2)
    }

    const SparkIcon = () =>
      h(
        'svg',
        { viewBox: '0 0 32 32', width: 18, height: 18, 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M16 2.5l2.6 10.9L29.5 16l-10.9 2.6L16 29.5l-2.6-10.9L2.5 16l10.9-2.6Z',
          fill: 'currentColor',
        }),
        h('circle', { cx: 16, cy: 16, r: 2.2, fill: '#1c1c22' }),
      )

    function GrokCard(props) {
      const t = props.t
      const [snapshot, setSnapshot] = React.useState(null)
      const [usage, setUsage] = React.useState(null)
      const [busy, setBusy] = React.useState(null)
      const [syncing, setSyncing] = React.useState(false)
      const [syncNote, setSyncNote] = React.useState(null)
      const [localError, setLocalError] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const mounted = React.useRef(true)
      const usageLoadedForSignIn = React.useRef(false)

      const describeError = React.useCallback(
        (error) => {
          const message = error instanceof Error ? error.message : String(error)
          if (/failed to fetch|networkerror|load failed|fetch/i.test(message)) return t('hostUnreachable')
          return message
        },
        [t],
      )

      const load = React.useCallback(async () => {
        try {
          const next = await api('/grok-auth/state')
          if (!mounted.current) return
          setSnapshot(next)
          setLocalError(null)
        } catch (error) {
          if (!mounted.current) return
          setLocalError(describeError(error))
        }
      }, [describeError])

      const loadUsage = React.useCallback(
        async (force) => {
          try {
            const next = await api('/grok-auth/observability' + (force ? '?refresh=1' : ''))
            if (!mounted.current) return
            setUsage(next.observability ?? null)
          } catch (error) {
            if (!mounted.current) return
            setUsage({ signedIn: false, billing: null, models: null, error: describeError(error) })
          }
        },
        [describeError],
      )

      const act = React.useCallback(
        async (path) => {
          if (!mounted.current) return
          setBusy(path)
          setLocalError(null)
          try {
            const next = await api(path, 'POST')
            if (!mounted.current) return
            setSnapshot(next)
            if (path === '/grok-auth/sign-out') setUsage(null)
          } catch (error) {
            if (mounted.current) setLocalError(describeError(error))
          } finally {
            if (mounted.current) setBusy(null)
          }
        },
        [describeError],
      )

      const syncModels = React.useCallback(async () => {
        if (!mounted.current || syncing) return
        setSyncing(true)
        setSyncNote(null)
        setLocalError(null)
        try {
          const next = await api('/grok-auth/sync-models', 'POST')
          if (!mounted.current) return
          setSnapshot(next)
          if (next.observability !== undefined) setUsage(next.observability)
          const result = next.syncResult
          if (result?.changed) {
            setSyncNote(fill(t('synced'), { count: result.count ?? 0 }))
          } else {
            setSyncNote(fill(t('syncFailed'), { reason: result?.reason ?? 'unknown' }))
          }
        } catch (error) {
          if (mounted.current) setSyncNote(fill(t('syncFailed'), { reason: describeError(error) }))
        } finally {
          if (mounted.current) setSyncing(false)
        }
      }, [syncing, t, describeError])

      React.useEffect(() => {
        mounted.current = true
        load()
        loadUsage(false)
        return () => {
          mounted.current = false
        }
      }, [load, loadUsage])

      const status = snapshot?.status ?? 'idle'
      const configured = snapshot?.configured === true
      const active = status === 'pending' || (status === 'authorized' && snapshot?.providerConfigured !== true)

      React.useEffect(() => {
        if (!active) return undefined
        const timer = setInterval(load, 1500)
        return () => clearInterval(timer)
      }, [active, load])

      React.useEffect(() => {
        if (!configured) {
          usageLoadedForSignIn.current = false
          return
        }
        if (!usageLoadedForSignIn.current) {
          usageLoadedForSignIn.current = true
          loadUsage(true)
        }
      }, [configured, loadUsage])

      React.useEffect(() => {
        if (!configured) return undefined
        const timer = setInterval(() => loadUsage(false), 60_000)
        return () => clearInterval(timer)
      }, [configured, loadUsage])

      React.useEffect(() => {
        if (snapshot?.syncedModels !== undefined) loadUsage(true)
      }, [snapshot?.syncedModels, loadUsage])

      const copyCode = async (code) => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch (error) {
          setLocalError(t('copyFailed'))
        }
      }

      const tone = status === 'pending' ? 'warn' : status === 'failed' ? 'error' : configured ? 'ok' : 'idle'
      const badge =
        status === 'pending'
          ? t('pending')
          : status === 'failed'
            ? t('failed')
            : configured
              ? t('signedIn')
              : t('notSignedIn')

      const notices = Array.isArray(snapshot?.notices) ? snapshot.notices : []
      const latest = notices.length > 0 ? notices[notices.length - 1] : null
      const codeNotice = notices.slice().reverse().find((notice) => typeof notice?.code === 'string' && notice.code.length > 0)
      const urlNotice = notices.slice().reverse().find((notice) => typeof notice?.url === 'string' && notice.url.length > 0)

      const providerError =
        snapshot?.providerAddError === 'config-editor-unavailable'
          ? t('configUnavailable')
          : snapshot?.providerAddError === 'entry-unavailable'
            ? t('entryUnavailable')
            : snapshot?.providerAddError ?? null

      const usageError = usage?.error
      const usageErrorText =
        usageError === 'SIGN_IN_REQUIRED'
          ? t('usageSignIn')
          : usageError === 'TOKEN_REFRESH_FAILED' || usageError === 'REFRESH_FAILED'
            ? t('usageRefreshFailed')
            : usageError ?? null

      const reasoningText = (model) => {
        const resolved = model.resolvedReasoning?.efforts
        if (Array.isArray(resolved) && resolved.length > 0) {
          return resolved.map((effort) => effort?.id ?? String(effort)).join(' / ')
        }
        if (model.reasoningEfforts === false) {
          return model.id.includes('non-reasoning') ? t('reasoningNone') : t('reasoningFixed')
        }
        if (model.reasoningEfforts !== null && typeof model.reasoningEfforts === 'object') {
          const levels = Object.keys(model.reasoningEfforts)
          return levels.length > 0 ? levels.join(' / ') : t('reasoningFixed')
        }
        return t('reasoningNotSynced')
      }

      const priceTitle = (model) => {
        const pricing = model.pricing ?? {}
        const lines = [
          model.id,
          t('context') + ': ' + formatTokens(model.contextWindow),
          t('inputPrice') + ': ' + formatPrice(pricing.input) + ' / 1M',
          t('outputPrice') + ': ' + formatPrice(pricing.output) + ' / 1M',
        ]
        if (pricing.cachedInput !== undefined) {
          lines.push(t('cachedInput') + ': ' + formatPrice(pricing.cachedInput) + ' / 1M')
        }
        if (pricing.longContextThreshold !== undefined) {
          lines.push(
            t('longContext') +
              ' (> ' +
              formatTokens(pricing.longContextThreshold) +
              '): ' +
              formatPrice(pricing.longContextInput) +
              ' / ' +
              formatPrice(pricing.longContextOutput) +
              ' / 1M',
          )
        }
        lines.push(t('reasoningLabel') + ': ' + reasoningText(model))
        return lines.join('\n')
      }

      const disabled = busy !== null

      const button = (label, action, kind, extra) =>
        h(
          'button',
          {
            key: extra?.key,
            type: 'button',
            className: 'grokXai_button ' + (kind === 'primary' ? 'grokXai_primary' : 'grokXai_secondary'),
            disabled: disabled || Boolean(extra?.disabled),
            onClick: action,
          },
          label,
        )

      const body = []
      body.push(
        h(
          'div',
          { className: 'grokXai_header', key: 'header' },
          h('span', { className: 'grokXai_icon' }, h(SparkIcon)),
          h(
            'div',
            { className: 'grokXai_heading' },
            h(
              'div',
              { className: 'grokXai_titleRow' },
              h('h3', { className: 'grokXai_title' }, t('title')),
              h('span', { className: 'grokXai_badge grokXai_badge_' + tone }, snapshot === null ? t('checking') : badge),
            ),
            h('p', { className: 'grokXai_description' }, t('description')),
          ),
        ),
      )

      if (status === 'pending') {
        body.push(
          h(
            'div',
            { className: 'grokXai_device', key: 'device' },
            h('p', { className: 'grokXai_deviceMessage' }, codeNotice ? t('deviceHint') : t('starting')),
            codeNotice
              ? h(
                  'div',
                  { className: 'grokXai_codeRow' },
                  h('code', { className: 'grokXai_code' }, codeNotice.code),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'grokXai_button grokXai_secondary',
                      onClick: () => copyCode(codeNotice.code),
                    },
                    copied ? t('copied') : t('copyCode'),
                  ),
                )
              : null,
            urlNotice
              ? h(
                  'a',
                  {
                    className: 'grokXai_link',
                    href: urlNotice.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  },
                  t('openPage'),
                )
              : null,
            latest && !codeNotice && typeof latest.message === 'string' && latest.message.length > 0
              ? h('p', { className: 'grokXai_hint' }, latest.message)
              : null,
          ),
        )
      }

      if (configured) {
        const billing = usage?.billing
        const percent = Number.isFinite(Number(billing?.percent)) ? Math.max(0, Math.min(100, Number(billing.percent))) : 0
        const barTone = percent >= 90 ? 'error' : percent >= 70 ? 'warn' : 'ok'
        const periodLabel = billing?.period === 'monthly' ? t('monthlyUsage') : t('weeklyUsage')
        const resetText = billing?.resetAt ? fill(t('usageReset'), { time: formatTime(billing.resetAt) }) : ''
        const products = Array.isArray(billing?.products)
          ? billing.products
              .filter((item) => item && item.percent > 0)
              .map((item) => item.product + ' ' + item.percent + '%')
              .join(' · ')
          : ''
        const meta = [resetText, products, billing?.prepaidBalance > 0 ? fill(t('prepaid'), { amount: billing.prepaidBalance.toFixed(2) }) : '']
          .filter((part) => part.length > 0)
          .join(' · ')

        body.push(
          h(
            'div',
            { className: 'grokXai_panel', key: 'usage' },
            h(
              'div',
              { className: 'grokXai_usageTop' },
              h('span', { className: 'grokXai_usageLabel' }, billing ? (billing.plan ? billing.plan + ' · ' + periodLabel : periodLabel) : t('usageLoading')),
              h('span', { className: 'grokXai_usageValue' }, billing ? percent + '%' : '—'),
            ),
            h(
              'div',
              { className: 'grokXai_bar', role: 'progressbar', 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 },
              h('span', { className: 'grokXai_barFill grokXai_barFill_' + barTone, style: { width: percent + '%' } }),
            ),
            meta.length > 0 ? h('p', { className: 'grokXai_meta' }, meta) : null,
            usageErrorText && !billing ? h('p', { className: 'grokXai_hint' }, usageErrorText) : null,
            usage?.fetchedAt
              ? h('p', { className: 'grokXai_meta' }, fill(t('usageUpdated'), { time: formatTime(new Date(usage.fetchedAt).toISOString()) }))
              : null,
          ),
        )

        const models = Array.isArray(usage?.models) ? usage.models : []
        body.push(
          h(
            'div',
            { className: 'grokXai_panel', key: 'models' },
            h(
              'div',
              { className: 'grokXai_panelHead' },
              h(
                'div',
                { className: 'grokXai_panelTitle' },
                t('liveModels') + ' · ' + models.length,
                h('span', { className: 'grokXai_meta' }, t('liveModelsHint')),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'grokXai_button grokXai_secondary',
                  disabled: syncing || disabled,
                  onClick: syncModels,
                },
                syncing ? t('syncing') : t('syncModels'),
              ),
            ),
            models.length > 0
              ? h(
                  'div',
                  { className: 'grokXai_modelTableWrap' },
                  h(
                    'div',
                    { className: 'grokXai_modelTable', role: 'table', 'aria-label': t('liveModels') },
                    h(
                      'div',
                      { className: 'grokXai_modelHead', role: 'row' },
                      h('span', { role: 'columnheader' }, t('modelColumn')),
                      h('span', { className: 'grokXai_modelCell', role: 'columnheader' }, t('context')),
                      h('span', { className: 'grokXai_modelCell grokXai_modelPrice', role: 'columnheader' }, t('inputPrice')),
                      h('span', { className: 'grokXai_modelCell grokXai_modelPrice', role: 'columnheader' }, t('outputPrice')),
                      h('span', { role: 'columnheader' }, t('reasoningLabel')),
                    ),
                    models.map((model) =>
                      h(
                        'div',
                        { className: 'grokXai_modelRow', role: 'row', key: model.id, title: priceTitle(model) },
                        h('span', { className: 'grokXai_modelName' }, model.name),
                        h('span', { className: 'grokXai_modelCell' }, formatTokens(model.contextWindow)),
                        h('span', { className: 'grokXai_modelCell grokXai_modelPrice' }, formatPrice(model.pricing?.input)),
                        h('span', { className: 'grokXai_modelCell grokXai_modelPrice' }, formatPrice(model.pricing?.output)),
                        h('span', { className: 'grokXai_modelReasoning' }, reasoningText(model)),
                      ),
                    ),
                  ),
                )
              : h('p', { className: 'grokXai_hint' }, usageErrorText ?? t('noModels')),
            models.length > 0 ? h('p', { className: 'grokXai_meta' }, t('priceNote')) : null,
            syncNote
              ? h('p', { className: 'grokXai_syncNote' }, syncNote)
              : h('p', { className: 'grokXai_meta' }, t('modelsSyncHint')),
          ),
        )
      }

      if (snapshot?.providerAddError) {
        body.push(h('p', { className: 'grokXai_error', key: 'provider-error' }, providerError))
      }

      if (configured && snapshot?.providerConfigured !== true) {
        body.push(h('p', { className: 'grokXai_hint', key: 'provider-hint' }, t('providerHint')))
      }

      if (localError || snapshot?.error) {
        body.push(h('p', { className: 'grokXai_error', key: 'error' }, localError ?? snapshot.error))
      }

      const actions = []
      if (status === 'pending') {
        actions.push(button(t('cancel'), () => act('/grok-auth/cancel'), 'secondary', { key: 'cancel' }))
      } else if (configured) {
        actions.push(button(t('refresh'), () => loadUsage(true), 'secondary', { key: 'usage-refresh' }))
        if (snapshot?.providerConfigured !== true && snapshot?.canAddProvider !== false) {
          actions.push(
            button(
              snapshot?.providerAddError ? t('addProviderRetry') : t('addProvider'),
              () => act('/grok-auth/add-provider'),
              'primary',
              { key: 'add' },
            ),
          )
        }
        actions.push(button(t('signOut'), () => act('/grok-auth/sign-out'), 'secondary', { key: 'out' }))
      } else {
        actions.push(button(t('signIn'), () => act('/grok-auth/sign-in'), 'primary', { key: 'in' }))
      }
      if (!active && snapshot !== null && !configured) {
        actions.push(button(t('refresh'), load, 'secondary', { key: 'refresh' }))
      }

      body.push(h('div', { className: 'grokXai_actions', key: 'actions' }, actions))

      if (configured && snapshot?.providerConfigured === true) {
        body.push(h('p', { className: 'grokXai_hint', key: 'model-hint' }, t('modelHint')))
      }

      return h('section', { className: 'grokXai_card', 'data-plugin': 'grok-xai', 'aria-live': 'polite' }, body)
    }

    const css = `
      .grokXai_card{display:flex;flex-direction:column;gap:12px;padding:16px;border:1px solid var(--dsw-alias-border-l1,#e3e3e8);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#18181b);font-size:13px;line-height:20px}
      .grokXai_header{display:flex;align-items:flex-start;gap:12px}
      .grokXai_icon{display:flex;flex:none;width:32px;height:32px;border-radius:9px;background:#1c1c22;color:#fff;align-items:center;justify-content:center}
      .grokXai_heading{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
      .grokXai_titleRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .grokXai_title{margin:0;font-size:14px;line-height:20px;font-weight:600;color:var(--dsw-alias-label-primary,#18181b)}
      .grokXai_badge{font-size:11px;line-height:18px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,#e3e3e8);color:var(--dsw-alias-label-secondary,#666);white-space:nowrap}
      .grokXai_badge_ok{color:var(--dsw-alias-state-success-primary,#2e7d32);border-color:currentColor}
      .grokXai_badge_warn{color:var(--dsw-alias-state-warn-primary,#9a6700);border-color:currentColor}
      .grokXai_badge_error{color:var(--dsw-alias-state-error-primary,#c62828);border-color:currentColor}
      .grokXai_description{margin:0;color:var(--dsw-alias-label-secondary,#666);font-size:12px;line-height:18px}
      .grokXai_device{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f5f5f7);border:1px solid var(--dsw-alias-border-l1,#e3e3e8)}
      .grokXai_deviceMessage{margin:0;color:var(--dsw-alias-label-primary,#18181b);font-size:12px;line-height:18px}
      .grokXai_codeRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .grokXai_code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;line-height:24px;letter-spacing:2px;padding:4px 10px;border-radius:8px;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l2,#cfcfd6);color:var(--dsw-alias-label-primary,#18181b);user-select:all}
      .grokXai_panel{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--dsw-alias-border-l1,#e3e3e8);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f5f5f7)}
      .grokXai_usageTop{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
      .grokXai_usageLabel{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#666)}
      .grokXai_usageValue{font-size:20px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary,#18181b);font-variant-numeric:tabular-nums}
      .grokXai_bar{height:6px;border-radius:999px;background:var(--dsw-alias-border-l1,#e3e3e8);overflow:hidden}
      .grokXai_barFill{display:block;height:100%;border-radius:inherit;background:var(--dsw-alias-brand-primary,#4d6bfe);transition:width .25s ease}
      .grokXai_barFill_ok{background:var(--dsw-alias-state-success-primary,#2e7d32)}
      .grokXai_barFill_warn{background:var(--dsw-alias-state-warn-primary,#9a6700)}
      .grokXai_barFill_error{background:var(--dsw-alias-state-error-primary,#c62828)}
      .grokXai_meta{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary,#666);overflow-wrap:anywhere}
      .grokXai_panelHead{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
      .grokXai_panelTitle{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-primary,#18181b)}
      .grokXai_modelTableWrap{overflow-x:auto}
      .grokXai_modelTable{display:flex;flex-direction:column;min-width:540px}
      .grokXai_modelHead,.grokXai_modelRow{display:grid;grid-template-columns:minmax(132px,1.5fr) 58px 52px 52px minmax(150px,1.7fr);gap:8px;align-items:center;padding:4px 0}
      .grokXai_modelHead{font-size:10px;line-height:14px;letter-spacing:.03em;text-transform:uppercase;color:var(--dsw-alias-label-secondary,#666);border-bottom:1px solid var(--dsw-alias-border-l1,#e3e3e8);padding-bottom:5px}
      .grokXai_modelRow{font-size:11px;line-height:15px;border-bottom:1px solid var(--dsw-alias-border-l1,#e3e3e8)}
      .grokXai_modelRow:last-child{border-bottom:0}
      .grokXai_modelName{font-weight:500;color:var(--dsw-alias-label-primary,#18181b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .grokXai_modelCell{color:var(--dsw-alias-label-secondary,#666);font-variant-numeric:tabular-nums;white-space:nowrap}
      .grokXai_modelPrice{text-align:right}
      .grokXai_modelReasoning{color:var(--dsw-alias-label-secondary,#666);font-size:10px;line-height:14px;white-space:normal}
      .grokXai_syncNote{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-state-success-primary,#2e7d32)}
      .grokXai_actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .grokXai_button{appearance:none;border:1px solid transparent;border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;line-height:18px;cursor:pointer;background:transparent;color:var(--dsw-alias-label-primary,#18181b)}
      .grokXai_button:disabled{opacity:.55;cursor:default}
      .grokXai_button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
      .grokXai_primary{background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff;border-color:transparent}
      .grokXai_secondary{border-color:var(--dsw-alias-border-l2,#cfcfd6);color:var(--dsw-alias-label-primary,#18181b)}
      .grokXai_secondary:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,#f5f5f7)}
      .grokXai_link{color:var(--dsw-alias-brand-primary,#4d6bfe);text-decoration:none;font-size:12px;line-height:18px;width:fit-content}
      .grokXai_link:hover{text-decoration:underline}
      .grokXai_hint{margin:0;color:var(--dsw-alias-label-secondary,#666);font-size:12px;line-height:18px}
      .grokXai_error{margin:0;color:var(--dsw-alias-state-error-primary,#c62828);font-size:12px;line-height:18px;overflow-wrap:anywhere}
    `

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'grok-xai: dictionaries')
        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.dataset.plugin = 'grok-xai'
          tag.textContent = css
          document.head.appendChild(tag)
          return () => tag.remove()
        }, 'grok-xai: styles')
        ctx.slots.inject('settings.models.footer', () =>
          ctx.slots.register(
            {
              name: 'settings.models.footer',
              id: 'grok-xai',
              order: 24,
              locale: NS,
            },
            GrokCard,
          ),
        )
      },
    }
  },
})
