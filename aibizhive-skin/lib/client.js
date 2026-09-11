// Client module for @aibizhive/dsh-client-ui-aibizhive-skin
// Loaded by DSH's /plugins bundle system; registers via __ModuleLoader__.load.

window.__ModuleLoader__.load({
  id: "@aibizhive/dsh-client-ui-aibizhive-skin",
  factory: (require) => {
    var module = { exports: {} };

    const inject = [];

    function apply(ctx, config) {
      const cfg = Object.assign({
        title: 'AIBizhive Harness',
        faviconPngPath: '/brand/aibizhive-icon.png',
        enforceTitle: true,
        enforceIntervalMs: 250,
        css: `:root{\n  --sg-ground:#08090A;--sg-panel:#0E1012;--sg-raised:#15181B;--sg-sunken:#050607;\n  --sg-line:#1E2328;--sg-line-bright:#2C333A;--sg-line-faint:#14181B;\n  --sg-text:#E6E9EC;--sg-dim:#8A9299;--sg-faint:#565E66;\n  --sg-accent:#FFA31A;--sg-accent-hover:#FFB544;\n  --sg-mono:'Cascadia Mono','Consolas',ui-monospace,'Courier New',monospace;\n  --sg-display:'Bahnschrift','Franklin Gothic Medium','Arial Narrow',sans-serif;\n}\n:root,body,body[data-ds-dark-theme]{\n  --dsw-alias-bg-base:var(--sg-ground);\n  --dsw-alias-bg-layer-1:var(--sg-panel);\n  --dsw-alias-bg-layer-2:var(--sg-raised);\n  --dsw-alias-bg-layer-3:var(--sg-raised);\n  --dsw-alias-label-primary:var(--sg-text);\n  --dsw-alias-label-secondary:var(--sg-dim);\n  --dsw-alias-label-tertiary:var(--sg-faint);\n  --dsw-alias-border-l1:var(--sg-line);\n  --dsw-alias-border-l2:var(--sg-line-bright);\n  --dsw-alias-border-l3:var(--sg-line-bright);\n  --dsw-alias-brand-primary:var(--sg-accent);\n  --dsw-alias-brand-hover:var(--sg-accent-hover);\n  --dsw-alias-focus:var(--sg-accent);\n}\nbody{background:var(--sg-ground);color:var(--sg-text);font-family:var(--sg-mono)}\nbody[data-ds-dark-theme]{background:var(--sg-ground);color:var(--sg-text)}\na{color:var(--sg-accent)}\na:hover{color:var(--sg-accent-hover)}\n:focus-visible{outline-color:var(--sg-accent) !important}\n`
      }, config || {})

      if (typeof document !== 'undefined') {
        // CSS injection
        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.setAttribute('data-plugin', '@aibizhive/dsh-client-ui-aibizhive-skin')
          tag.setAttribute('data-plugin-css', '@aibizhive/dsh-client-ui-aibizhive-skin/skin.css')
          tag.textContent = String(cfg.css || '')
          document.head.appendChild(tag)
          return () => tag.remove()
        }, 'aibizhive-skin: css')

        // favicon
        ctx.effect(() => {
          try {
            const href = String(cfg.faviconPngPath || '')
            if (!href) return
            let link = document.querySelector('link[rel="icon"]')
            const prev = link ? link.getAttribute('href') : null
            if (!link) {
              link = document.createElement('link')
              link.setAttribute('rel', 'icon')
              link.setAttribute('type', 'image/png')
              document.head.appendChild(link)
            }
            link.setAttribute('href', href)
            return () => {
              if (!link) return
              if (prev !== null) link.setAttribute('href', prev)
            }
          } catch (_) {}
        }, 'aibizhive-skin: favicon')

        // title enforcement
        ctx.effect(() => {
          try {
            const title = String(cfg.title || '')
            if (!title) return
            const enforce = () => {
              try { if (document.title !== title) document.title = title } catch (_) {}
            }
            enforce()
            if (!cfg.enforceTitle) return
            const onVis = () => enforce()
            const onFocus = () => enforce()
            window.addEventListener('visibilitychange', onVis)
            window.addEventListener('focus', onFocus)
            const t = setInterval(enforce, Math.max(50, Number(cfg.enforceIntervalMs || 250)))
            return () => {
              try { window.removeEventListener('visibilitychange', onVis) } catch (_) {}
              try { window.removeEventListener('focus', onFocus) } catch (_) {}
              try { clearInterval(t) } catch (_) {}
            }
          } catch (_) {}
        }, 'aibizhive-skin: title')
      }
    }

    module.exports = { inject, apply }
    return module.exports
  }
})
