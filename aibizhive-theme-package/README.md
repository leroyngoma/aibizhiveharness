# @aibizhive/dsh-client-ui-aibizhive-theme

A **DSH Client UI plugin** that applies AIBizhive branding/theme without patching DSH’s installed `dist/` artifacts.

## What it does

- Injects Signal-style CSS tokens + minimal `--dsw-alias-*` mapping
- Sets favicon to `/brand/aibizhive-icon.png`
- Sets and (optionally) enforces `document.title = "AIBizhive Harness"`

## Install (global DSH)

After you publish (or pack) this package:

```bash
npm i -g @aibizhive/dsh-client-ui-aibizhive-theme
```

## Host `cordis.yml` row

Add this to the **host composition** `cordis.yml`:

```yaml
- id: aibizhive-theme
  name: "@aibizhive/dsh-client-ui-aibizhive-theme"
  config:
    title: "AIBizhive Harness"
    faviconPngPath: "/brand/aibizhive-icon.png"
    enforceTitle: true
    enforceIntervalMs: 250
```

If you want to override the CSS at runtime, you can pass a `css:` string in config.

## Notes

- This is a client-side skin. It should survive DSH reinstalls/updates as long as the Slot/theme token names remain compatible.
- Prefer this over editing files under `.../node_modules/@deepseek-ai/dsh/...`.
