# AIBizhive UI Theme Override (web profile)

This folder builds an override package **named exactly** `@deepseek-ai/dsh-client-ui-theme`.

It preserves the upstream host bootstrap (`lib/index.js`, DOM-free) and replaces/extends the browser behavior (`lib/client.js`) to:
- apply AIBizhive dark token overrides
- enforce title + favicon

## Build

```bash
npm pack
```

## Install into the DSH web profile (Windows)

1) Copy the generated `.tgz` to `C:\dev\...`.
2) Add it as a file dependency in `C:\Users\leroy\.dsh\profiles\web\package.json`:

```json
"@deepseek-ai/dsh-client-ui-theme": "file:C:/dev/<tgz-name>.tgz"
```

3) Reinstall profile deps:

```powershell
cd C:\Users\leroy\.dsh\profiles\web
pnpm install
```

4) Start:

```powershell
dsh web --no-open
```
