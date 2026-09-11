# @aibizhive/dsh-web-app-aibizhive-fullskin

AIBizhive fullskin bundle for DSH web profile.

- Serves `/brand/aibizhive-icon.png`
- Serves `/manifest.webmanifest` with AIBizhive metadata
- Adds a safe client module (no @deepseek-ai overrides) that applies:
  - theme token overrides (yellow accent)
  - brand slots (icon + wordmark)
  - new-session hero cleanup (logo-only)
  - title + favicon enforcement
