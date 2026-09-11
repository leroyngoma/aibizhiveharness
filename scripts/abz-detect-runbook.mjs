#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const CWD = process.cwd()

function toPosix(p) { return p.split(path.sep).join('/') }
async function exists(p) { try { await fs.stat(p); return true } catch { return false } }
async function listDir(p) { try { return await fs.readdir(p) } catch { return [] } }
function nowIso() { return new Date().toISOString() }
function slugify(s) { return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }

function detectNode(files) {
  if (!files.includes('package.json')) return null
  const pkgManagers = []
  if (files.includes('pnpm-lock.yaml')) pkgManagers.push('pnpm')
  if (files.includes('yarn.lock')) pkgManagers.push('yarn')
  if (files.includes('package-lock.json')) pkgManagers.push('npm')
  if (!pkgManagers.length) pkgManagers.push('npm')
  return { stack: 'node', pkgManagers }
}
function detectPython(files) {
  const has = files.includes('pyproject.toml') || files.some(f => f.startsWith('requirements') && f.endsWith('.txt')) || files.includes('Pipfile')
  if (!has) return null
  const managers = []
  if (files.includes('poetry.lock')) managers.push('poetry')
  if (files.includes('Pipfile')) managers.push('pipenv')
  if (files.some(f => f.startsWith('requirements') && f.endsWith('.txt'))) managers.push('pip')
  if (files.includes('pyproject.toml') && !managers.length) managers.push('python')
  return { stack: 'python', managers }
}
function detectGo(files) { if (files.includes('go.mod') || files.includes('go.work')) return { stack: 'go' }; return null }
function detectRust(files) { if (files.includes('Cargo.toml')) return { stack: 'rust' }; return null }
function detectDocker(files) {
  const out = { hasDockerfile: files.includes('Dockerfile'), hasCompose: files.includes('docker-compose.yml') || files.includes('compose.yml') }
  if (!out.hasDockerfile && !out.hasCompose) return null
  return { stack: 'docker', ...out }
}
function detectPlaywright(files) { return files.some(f => f.startsWith('playwright.config.')) }

async function detectGithubWorkflows() { return await exists(path.join(CWD, '.github', 'workflows')) }
async function detectVercel() { return await exists(path.join(CWD, 'vercel.json')) }
async function detectFly() { return await exists(path.join(CWD, 'fly.toml')) }
async function detectTerraform() { return await exists(path.join(CWD, 'terraform')) || (await listDir(CWD)).some(f => f.endsWith('.tf')) }
async function detectK8s() {
  const names = ['k8s','kubernetes','manifests','charts','helm']
  const dir = await listDir(CWD)
  return names.some(n => dir.includes(n))
}

async function main() {
  const args = process.argv.slice(2)
  const taskSlug = slugify(args[0] || '')
  if (!taskSlug) { console.error('Usage: scripts/abz-detect-runbook.mjs <task-slug>'); process.exit(2) }

  const repoFiles = await listDir(CWD)
  const stacks = []
  const packageManagers = []

  const n = detectNode(repoFiles)
  if (n) { stacks.push('node'); packageManagers.push(...n.pkgManagers) }
  const py = detectPython(repoFiles)
  if (py) { stacks.push('python'); packageManagers.push(...py.managers) }
  const go = detectGo(repoFiles)
  if (go) stacks.push('go')
  const rs = detectRust(repoFiles)
  if (rs) stacks.push('rust')
  const dk = detectDocker(repoFiles)
  if (dk) stacks.push('docker')

  const hasPlaywright = detectPlaywright(repoFiles)
  const deploySignals = {
    githubWorkflows: await detectGithubWorkflows(),
    vercel: await detectVercel(),
    fly: await detectFly(),
    terraform: await detectTerraform(),
    k8sOrHelm: await detectK8s(),
  }

  const profile = {
    detectedAt: nowIso(),
    cwd: toPosix(CWD),
    stacks: Array.from(new Set(stacks)),
    packageManagers: Array.from(new Set(packageManagers)),
    hasPlaywright,
    deploySignals,
  }

  const tasksDir = path.join(CWD, 'tasks', taskSlug)
  await fs.mkdir(tasksDir, { recursive: true })
  const runbookPath = path.join(tasksDir, 'repo_runbook.md')
  const profilePath = path.join(tasksDir, 'repo_profile.json')
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2) + '
', 'utf8')

  const out = []
  out.push('# Repo Runbook')
  out.push('')
  out.push('Generated: ' + profile.detectedAt)
  out.push('')
  out.push('## Detected stacks')
  out.push('- ' + (profile.stacks.length ? profile.stacks.join(', ') : 'Unknown'))
  out.push('')
  out.push('## Bootstrap')
  if (profile.stacks.includes('node')) {
    const pm = profile.packageManagers.includes('pnpm') ? 'pnpm' : (profile.packageManagers.includes('yarn') ? 'yarn' : 'npm')
    out.push('```bash')
    out.push(pm + ' install')
    out.push('```')
    out.push('')
  }
  if (profile.stacks.includes('python')) {
    out.push('```bash')
    out.push('# Choose one based on repo')
    out.push('python -m venv .venv && source .venv/bin/activate')
    out.push('pip install -r requirements.txt  # if present')
    out.push('poetry install                 # if poetry.lock present')
    out.push('```')
    out.push('')
  }
  if (profile.stacks.includes('go')) {
    out.push('```bash')
    out.push('go mod download')
    out.push('```')
    out.push('')
  }
  if (profile.stacks.includes('rust')) {
    out.push('```bash')
    out.push('cargo fetch')
    out.push('```')
    out.push('')
  }
  out.push('## Tests')
  out.push('_Fill in based on repo scripts/config._')
  out.push('')
  if (profile.hasPlaywright) {
    out.push('## E2E (Playwright detected)')
    out.push('```bash')
    out.push('npx playwright install   # first time only')
    out.push('npx playwright test')
    out.push('```')
    out.push('')
  } else {
    out.push('## E2E')
    out.push('Playwright not detected. Only run E2E if the repo has a configured framework.')
    out.push('')
  }
  out.push('## Build')
  out.push('_Fill in based on repo._')
  out.push('')
  out.push('## Deploy (gated)')
  out.push('Deploy signals:')
  for (const [k,v] of Object.entries(profile.deploySignals)) out.push('- ' + k + ': ' + (v ? 'yes' : 'no'))
  out.push('')
  out.push('Policy: do not deploy unless explicitly requested AND user confirms with "DEPLOY".')
  out.push('')

  await fs.writeFile(runbookPath, out.join('
') + '
', 'utf8')
  console.log(JSON.stringify({ ok: true, taskSlug, wrote: [toPosix(runbookPath), toPosix(profilePath)] }, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })
