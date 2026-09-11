// @aibizhive/dsh-web-app-aibizhive-full
// Host-side bundle plugin. Serves real /brand/aibizhive-icon.png and overrides /manifest.webmanifest.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICON_PATH = path.join(__dirname, '..', 'assets', 'brand', 'aibizhive-icon.png')

function manifestJson() {
  return JSON.stringify({
    id: '/',
    name: 'AIBizhive Harness',
    short_name: 'AIBizhive',
    start_url: '/',
    scope: '/',
    display: 'fullscreen',
    icons: [
      {
        src: '/brand/aibizhive-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }, null, 2)
}

export function apply(ctx) {
  const webserver = ctx.get('webserver')
  if (!webserver) return

  // Serve icon bytes.
  // dsh-host-webserver API is not documented here; we attempt common hook/event patterns.
  // If your build uses a different registration method, we will adjust based on the host error.

  // Pattern 1: Koa-like router
  if (typeof webserver.use === 'function') {
    webserver.use(async (c, next) => {
      const url = c?.request?.url || c?.url
      if (url === '/brand/aibizhive-icon.png') {
        const buf = fs.readFileSync(ICON_PATH)
        c.type = 'image/png'
        c.body = buf
        return
      }
      if (url === '/manifest.webmanifest') {
        c.type = 'application/manifest+json'
        c.body = manifestJson()
        return
      }
      return next()
    })
    return
  }

  // Pattern 2: event-based fetch hook
  ctx.on?.('webserver/request', (req, res) => {
    try {
      if (req?.url === '/brand/aibizhive-icon.png') {
        const buf = fs.readFileSync(ICON_PATH)
        res.statusCode = 200
        res.setHeader('content-type', 'image/png')
        res.end(buf)
      }
      if (req?.url === '/manifest.webmanifest') {
        const body = manifestJson()
        res.statusCode = 200
        res.setHeader('content-type', 'application/manifest+json; charset=utf-8')
        res.end(body)
      }
    } catch (e) {}
  })
}
