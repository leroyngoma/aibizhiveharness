// Host entry for @aibizhive/dsh-client-ui-aibizhive-theme
//
// IMPORTANT: This file runs in Node (DSH host). Do not touch `window`/DOM here.
// The actual browser behavior lives in lib/client.js (ModuleLoader format).
//
// This host stub registers the client module with the web profile's
// @deepseek-ai/dsh-client-modules service so the browser loads lib/client.js.
//
// DSH versions vary in the exact clientModules method name, so we:
// - log the enumerable keys once (to help pinpoint API), and
// - try a small set of common method names.

module.exports = {
  name: '@aibizhive/dsh-client-ui-aibizhive-theme',
  inject: ['clientModules'],
  apply(ctx) {
    const cm = ctx.clientModules

    // Best-effort: log available keys to host logger.
    try {
      const keys = []
      for (const k in cm) keys.push(k)
      if (ctx.logger && typeof ctx.logger.info === 'function') {
        ctx.logger.info('[aibizhive-theme] clientModules keys: ' + keys.join(', '))
      }
    } catch (_) {}

    const spec = {
      id: '@aibizhive/dsh-client-ui-aibizhive-theme',
      entry: 'lib/client.js',
    }

    if (cm && typeof cm.add === 'function') return cm.add(spec)
    if (cm && typeof cm.define === 'function') return cm.define(spec)
    if (cm && typeof cm.registerModule === 'function') return cm.registerModule(spec)
    if (cm && typeof cm.registerClientModule === 'function') return cm.registerClientModule(spec)

    throw new Error('[aibizhive-theme] unsupported clientModules API: no add/define/registerModule/registerClientModule')
  },
}
