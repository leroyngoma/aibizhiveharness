# @aibizhive/dsh-client-ui-aibizhive-skin

A **DSH client module** that applies the AIBizhive UI skin:
- dark-only CSS variable overrides
- enforced title
- favicon

## Install into the web profile (Windows)

Copy the generated `.tgz` to `C:\dev\...` then:

```powershell
cd C:\Users\leroy\.dsh\profiles\web
# install into the profile so it is bundled into /plugins
 dsh plugin --profile web add "file:C:\dev\<tgz>.tgz"

# restart
 dsh web --no-open
```

No `cordis.patch.yml` changes are required.

## Config

This module accepts optional `config` keys (if you later patch it into a row with config):
- `title`
- `faviconPngPath`
- `enforceTitle`
- `enforceIntervalMs`
- `css`
