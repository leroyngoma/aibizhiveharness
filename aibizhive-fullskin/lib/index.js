// Host plugin for @aibizhive/dsh-web-app-aibizhive-fullskin
// Serves real /brand/aibizhive-icon.png and overrides /manifest.webmanifest.

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
      { src: '/brand/aibizhive-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ]
  })
}

export const inject = ['webServer']

export function apply(ctx) {
  // dsh-host-webserver provides service name "webServer".
  const webServer = ctx.webServer
  if (!webServer || typeof webServer.register !== 'function') return

  // Register exact route: /brand/aibizhive-icon.png
  webServer.register({
    kind: 'exact',
    path: '/brand/aibizhive-icon.png',
    handler: async (_req, res) => {
      const buf = fs.readFileSync(ICON_PATH)
      res.statusCode = 200
      res.setHeader('content-type', 'image/png')
      res.end(buf)
    },
  })

  // Register exact route: /manifest.webmanifest
  webServer.register({
    kind: 'exact',
    path: '/manifest.webmanifest',
    handler: async (_req, res) => {
      const body = manifestJson()
      res.statusCode = 200
      res.setHeader('content-type', 'application/manifest+json; charset=utf-8')
      res.end(body)
    },
  })
}
