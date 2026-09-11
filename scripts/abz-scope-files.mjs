#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'

function slugify(s){ return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }

const args = process.argv.slice(2)
const slug = slugify(args[0] || '')
const pattern = args[1] || ''
if (!slug || !pattern) {
  console.error('Usage: node scripts/abz-scope-files.mjs <task-slug> <ripgrep-pattern>')
  console.error('Example: node scripts/abz-scope-files.mjs my-task "Login|Auth"')
  process.exit(2)
}

const rg = spawnSync('rg', ['--files-with-matches', '-g', '!*node_modules/*', '-g', '!*dist/*', '-g', '!*build/*', pattern, '.'], { encoding: 'utf8' })
if (rg.status !== 0 && rg.status !== 1) {
  console.error(rg.stderr || rg.stdout)
  process.exit(rg.status ?? 1)
}

const files = (rg.stdout || '')
  .split('
')
  .map(s => s.trim())
  .filter(Boolean)
  .map(f => f.split(path.sep).join('/'))

console.log(files.slice(0, 50).join(','))
