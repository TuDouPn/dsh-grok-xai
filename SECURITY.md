# Security Policy

## Supported versions

Security fixes are applied to the latest `main` branch.

## Reporting a vulnerability

Please use GitHub's **Security → Report a vulnerability** (private advisory) for this repository. Do not open a public issue for a vulnerability that could expose credentials or user data.

Include:

- affected version/commit;
- DSH version and OS;
- steps to reproduce;
- impact;
- any relevant logs with tokens and personal data removed.

## Scope

- The plugin stores no tokens itself. OAuth credentials are managed by DeepSeek Harness `authorization` / `credentials` as `llm-pi-ai/xai`.
- `/grok-auth/*` is a same-origin local route surface. Reports about cross-origin access, token leakage, or unsafe logging are in scope.
- The billing/settings endpoints are undocumented Grok CLI proxy endpoints. Their availability and behavior can change; this is not a vulnerability by itself.
- Do not test against accounts or subscriptions you do not own.
- Do not attach `~/.dsh/.credentials.yaml`, access tokens, refresh tokens, or Grok Bot/Cursor data to a report.

## Disclosure

Please allow time for a fix before public disclosure.
