# @deepseek-ai/dsh-client-ui-theme (AIBizhive override)

This is a **drop-in override package** that intentionally uses the same package name as the built-in DSH client theme module.

It exists because some DSH builds do not expose `window.__ModuleLoader__` for arbitrary third-party client modules; overriding the already-bundled package is the most reliable way to ship a theme.

## Install into the DSH web profile

1) Build/obtain the `.tgz` for this folder.
2) Install into the web profile:

```powershell
dsh plugin --profile web add "file:C:\dev\dsh-client-ui-theme-aibizhive-override.tgz"
```

3) Ensure your `cordis.patch.yml` does NOT try to insert a new theme row. The existing `ui-theme` row already points to `@deepseek-ai/dsh-client-ui-theme`.

## What it does
- Injects CSS token overrides
- Sets favicon
- Sets/enforces document title
