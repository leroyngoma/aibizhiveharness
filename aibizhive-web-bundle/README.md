# @aibizhive/dsh-web-app-aibizhive

A **DSH bundle patch** that adds the AIBizhive skin client module to the web profile.

## Install

1) Install this bundle into the web profile:

```powershell
dsh plugin --profile web add "file:C:\dev\<this-tgz>.tgz"
```

2) Add it to the profile bundle list in:
`C:\Users\<you>\.dsh\profiles\web\package.json`

```json
"bundles": [
  "@deepseek-ai/dsh-base",
  "@deepseek-ai/dsh-web-app",
  "@aibizhive/dsh-web-app-aibizhive",
  "dsh-passwords"
]
```

3) Reinstall and restart:

```powershell
cd C:\Users\<you>\.dsh\profiles\web
pnpm install
dsh web --no-open
```
