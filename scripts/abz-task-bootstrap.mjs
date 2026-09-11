#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const args = process.argv.slice(2)
const slug = slugify(args[0] || '')
if (!slug) {
  console.error('Usage: node scripts/abz-task-bootstrap.mjs <task-slug>')
  process.exit(2)
}

// 1) scaffold task folder
run('bash', ['scripts/new_task.sh', slug])

// 2) detect repo + write runbook/profile
run('node', ['scripts/abz-detect-runbook.mjs', slug])

// 3) build/update .abzcache summaries (JIT)
run('node', ['scripts/abz-jit-summarize.mjs', slug])

console.log('
OK: bootstrapped task ' + slug)
