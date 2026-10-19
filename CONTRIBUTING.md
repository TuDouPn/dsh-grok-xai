# Contributing

Thanks for helping improve this plugin.

## Before you open an issue

- Check the troubleshooting section in [README.md](README.md) and [README.en.md](README.en.md).
- Confirm the bundle is enabled in **Plugins** and the DSH profile is one with `llm-pi-ai`, `authorization`, `credentials`, `configEditor`, and `webServer`.
- Include the DSH version, OS, the exact error message, and whether sign-in, usage, or model sync is affected.

**Never paste tokens, refresh tokens, `~/.dsh/.credentials.yaml`, `host-secrets.json`, or other personal data into an issue or pull request.** Redact account IDs and request headers.

## Pull requests

- Keep the plugin dependency-free: plain JavaScript, no build step, no npm runtime packages.
- Run syntax checks before submitting:

  ```bash
  node --check index.js
  node --check client.js
  ```

- Keep `/grok-auth/*` handlers same-origin and free of token logging.
- When behavior or endpoints change, update:
  - [README.md](README.md)
  - [README.en.md](README.en.md)
  - [CHANGELOG.md](CHANGELOG.md)
- When adding UI text, register it through the Client locale service and add both `zh` and `en` dictionaries.
- If you change model sync or reasoning mapping, explain the xAI endpoint/field you used and include a reproducible check.

## Security

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contribution is licensed under the MIT License.
