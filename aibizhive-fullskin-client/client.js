// Client module: @aibizhive/dsh-client-ui-aibizhive-fullskin
// Safe overlay: no overrides of @deepseek-ai packages.

window.__ModuleLoader__.load({
  id: "@aibizhive/dsh-client-ui-aibizhive-fullskin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    let react_jsx_runtime = require('react/jsx-runtime')

    const inject = ['slots']

    function apply(ctx) {
      // 1) CSS token overrides (from your patched theme + minimal additions)
      const css = `:root{\n  --sg-accent:#FFA31A;--sg-accent-hover:#ffb24a;--sg-accent-active:#e08c00;\n  --sg-ground:#0f1115;--sg-panel:#15171b;--sg-raised:#1b1e24;\n  --sg-text:#f2f3f5;--sg-dim:#c5c9d3;--sg-faint:#9aa1ad;\n  --sg-line:rgba(255,255,255,.14);--sg-line-faint:rgba(255,255,255,.10);--sg-line-bright:rgba(255,255,255,.22);\n  --sg-mono:'Cascadia Mono','Consolas',ui-monospace,'Courier New',monospace;\n  --sg-display:'Bahnschrift','Franklin Gothic Medium','Arial Narrow',sans-serif;\n}\n:root,body,body[data-ds-dark-theme]{\n  --dsw-alias-brand-primary:var(--sg-accent);\n  --dsw-alias-brand-hover:var(--sg-accent-hover);\n  --dsw-alias-label-primary-bluish:var(--sg-accent);\n  --dsw-alias-state-business-primary:var(--sg-accent);\n  --dsw-alias-button-info-fill:var(--sg-accent);\n  --dsw-alias-button-info-hover:var(--sg-accent-hover);\n  --dsw-alias-focus:var(--sg-accent);\n}\nbody{font-family:var(--sg-mono)}\n`;

      if (typeof document !== 'undefined') {
        const tag = document.createElement('style')
        tag.setAttribute('data-plugin', '@aibizhive/dsh-client-ui-aibizhive-fullskin')
        tag.setAttribute('data-plugin-css', '@aibizhive/dsh-client-ui-aibizhive-fullskin/skin.css')
        tag.textContent = css + "\nbody{font-weight:500}\nbutton,input,textarea{font-weight:500}\n"
        document.head.appendChild(tag)

        // 2) Title + favicon enforcement
        try {
          const title = 'AIBizhive Harness'
          const enforce = () => { try { if (document.title !== title) document.title = title } catch {} }
          enforce()
          window.addEventListener('visibilitychange', enforce)
          window.addEventListener('focus', enforce)
          setInterval(enforce, 250)
        } catch {}

        try {
          const href = '/brand/aibizhive-icon.png'
          let link = document.querySelector('link[rel="icon"]')
          if (!link) {
            link = document.createElement('link')
            link.setAttribute('rel','icon')
            link.setAttribute('type','image/png')
            document.head.appendChild(link)
          }
          link.setAttribute('href', href)
        } catch {}
      }

      // 3) Brand slots override (icon + wordmark)
      if (ctx && ctx.slots && typeof ctx.slots.inject === 'function') {
        const OfficialBrandMark = function ({ size, className }) {
          const px = typeof size === 'number' ? size : 24
          return react_jsx_runtime.jsx('img', {
            src: '/brand/aibizhive-icon.png',
            alt: 'AI Bizhive Harness',
            width: px,
            height: px,
            className,
            style: { display: 'block', objectFit: 'contain' },
          })
        }

        const OfficialBrandName = function () {
          return react_jsx_runtime.jsx('span', {
            style: {
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.45em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              fontFamily: 'var(--sg-display, var(--dsw-font-family))',
              color: 'var(--dsw-alias-label-primary)',
            },
            children: [
              react_jsx_runtime.jsx('span', {
                style: { fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase' },
                children: 'AI Bizhive',
              }, 'aib'),
              react_jsx_runtime.jsx('span', {
                style: { fontWeight: 600, fontSize: '0.78em', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dsw-alias-label-secondary)' },
                children: 'Harness',
              }, 'har'),
            ],
          })
        }

        ctx.slots.inject('sidebar.brand.mark', () =>
          ctx.slots.inject('sidebar.brand.name', () =>
            ctx.slots.inject('conversation.hero.brand.mark', function* () {
              yield ctx.slots.register({ name: 'sidebar.brand.mark', priority: -10 }, OfficialBrandMark)
              yield ctx.slots.register({ name: 'sidebar.brand.name', priority: -10 }, OfficialBrandName)
              yield ctx.slots.register({ name: 'conversation.hero.brand.mark', priority: -10 }, OfficialBrandMark)
            })
          )
        )
      }

      // 4) Landing hero cleanup (DOM-based, robust across hashed classnames)
      if (typeof document !== 'undefined') {
        const cleanup = () => {
          try {
            // Find a block that contains the landing hero text cluster and remove specific lines.
            const blocks = Array.from(document.querySelectorAll('body *'))
              .filter(el => el && typeof el.innerText === 'string' && el.innerText.includes('Into the Unknown'))
            if (blocks.length === 0) return
            const el = blocks[0]
            const lines = (el.innerText || '').split(/\r?\n/)
            const filtered = lines.filter(line => {
              const s = String(line).trim()
              if (!s) return true
              if (s === 'Into the Unknown') return false
              if (s === 'Preview') return false
              if (s === '预览版' || s === '预览') return false
              return true
            })
            // If we removed something, rewrite via text nodes (avoid touching inputs etc.)
            if (filtered.length !== lines.length) {
              // Keep only text nodes in this block; don't nuke interactive children.
              // If the element has complex structure, fall back to hiding the first matching child span/div.
              if (el.children.length === 0) {
                el.innerText = filtered.join('\n')
              } else {
                // Hide any direct child whose text is exactly those labels.
                Array.from(el.querySelectorAll('*')).forEach(child => {
                  const t = (child.innerText || '').trim()
                  if (t === 'Into the Unknown' || t === 'Preview' || t === '预览版' || t === '预览') {
                    child.style.display = 'none'
                  }
                })
              }
            }
          } catch (_) {}
        }

        // Run a few times in case the hero mounts after plugins settle.
        cleanup()
        setTimeout(cleanup, 50)
        setTimeout(cleanup, 250)
        setTimeout(cleanup, 1000)
      }
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  }
})
