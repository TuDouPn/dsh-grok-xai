# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [1.3.0] - 2026-10-19

### Added

- Context window, input/output price, cached-input price, and long-context price in the live model table.
- `xAI (Grok)` plan from Grok CLI settings (`subscription_tier_display`).
- Per-model reasoning calibration from `capabilities.reasoning_effort`.
- English README and Grok Bot capability research note.

### Changed

- Reasoning efforts are no longer guessed from model names; models without declared efforts are written as `false`.
- Grok 4.3 and 4.5 now expose `xhigh` when xAI declares it.
- The observability endpoint includes the reasoning levels resolved by the Harness adapter.

### Fixed

- `grok-4.20-0309-reasoning` and `grok-build-0.1` no longer offer reasoning-effort values that the API rejects with HTTP 400.
- The usage panel shows `SuperGrok Plus` instead of the generic `SuperGrok` fallback.

## [1.2.0] - 2026-10-19

### Added

- Subscription plan, default model, and enabled-feature readout from Grok CLI settings.
- Per-model capability lookup through `/v1/models/{id}`.
- Harness-resolved reasoning levels in the observability payload.

## [1.1.0] - 2026-10-19

### Added

- SuperGrok weekly/monthly usage, product breakdown, reset time, and prepaid balance.
- Live model list from `api.x.ai/v1/models` and model sync into `llm-pi-ai`.
- 60-second usage cache and OAuth refresh-token handling.

## [1.0.0] - 2026-10-19

### Added

- xAI device-code OAuth sign-in from the DSH Settings → Models page.
- Credential record `llm-pi-ai/xai` and automatic `xai` provider setup.
- Sign-in, cancel, sign-out, and provider-retry actions.
