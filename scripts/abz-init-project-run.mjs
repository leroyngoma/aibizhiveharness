#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const CWD = process.cwd()

function slugify(s){ return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }

function hasCmd(cmdName){
  const r = spawnSync('bash', ['-lc', 'command -v ' + cmdName], { encoding: 'utf8' })
  return (r.status ?? 1) === 0
}

function run(cmd, args, opts={}){
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts })
  return { cmd: [cmd, ...args].join(' '), status: r.status ?? 0, stdout: r.stdout || '', stderr: r.stderr || '' }
}

async function appendLog(taskSlug, entry){
  const p = path.join(CWD,'tasks',taskSlug,'execution_log.md')
  const stamp = new Date().toISOString()
  const block = ['', '## ' + stamp, '```bash', entry.cmd, '```', 'exit=' + entry.status]
  if (entry.stdout.trim()) block.push('### stdout\n```\n' + entry.stdout.trim().slice(0, 12000) + '\n```')
  if (entry.stderr.trim()) block.push('### stderr\n```\n' + entry.stderr.trim().slice(0, 12000) + '\n```')
  block.push('')
  await fs.mkdir(path.dirname(p), { recursive:true })
  await fs.appendFile(p, block.join('\n'), 'utf8')
}

function parseArgs(argv){
  const out = { _: [] }
  for (let i=0;i<argv.length;i++){
    const a=argv[i]
    if (a.startsWith('--')){
      const k=a.slice(2)
      const v=(argv[i+1] && !argv[i+1].startsWith('--')) ? argv[++i] : 'true'
      out[k]=v
    } else out._.push(a)
  }
  return out
}

async function main(){
  const args = parseArgs(process.argv.slice(2))
  const name = String(args.name || 'abz-app')
  const backend = String(args.backend || 'python').toLowerCase()
  const db = String(args.db || 'postgres').toLowerCase()
  const taskSlug = slugify(String(args.task || name))
  const runGenerators = String(args.run || 'true') !== 'false'

  if (!taskSlug) { console.error('Missing --task or --name'); process.exit(2) }

  let e = run('bash', ['scripts/new_task.sh', taskSlug], { stdio: 'pipe' })
  await appendLog(taskSlug, e)

  e = run('node', ['scripts/abz-init-project.mjs', '--name', name, '--backend', backend, '--db', db], { stdio: 'pipe' })
  await appendLog(taskSlug, e)
  if (e.status !== 0) process.exit(e.status)

  e = run('node', ['scripts/abz-detect-runbook.mjs', taskSlug], { stdio: 'pipe' })
  await appendLog(taskSlug, e)
  e = run('node', ['scripts/abz-jit-summarize.mjs', taskSlug], { stdio: 'pipe' })
  await appendLog(taskSlug, e)

  if (!runGenerators) { console.log('OK (scaffold only). Task:', taskSlug); return }

  const webDir = path.join(CWD,'apps','web')
  const webListing = await fs.readdir(webDir).catch(()=>[])
  const webHasPkg = webListing.includes('package.json')
  if (!webHasPkg && haveNpm) {
    e = run('npm', ['create', 'vite@latest', 'web', '--', '--template', 'react-ts'], { cwd: path.join(CWD,'apps'), stdio: 'pipe' })
    await appendLog(taskSlug, e)
    if (e.status === 0) {
      e = run('npm', ['install'], { cwd: path.join(CWD,'apps','web'), stdio: 'pipe' })
      await appendLog(taskSlug, e)
    }
  }

  if (backend === 'python' && havePython && havePip) {
    const apiDir = path.join(CWD,'apps','api')
    e = run('bash', ['-lc', 'python -m venv .venv'], { cwd: apiDir, stdio: 'pipe' })
    await appendLog(taskSlug, e)
    e = run('bash', ['-lc', '. .venv/bin/activate && pip install -r requirements.txt'], { cwd: apiDir, stdio: 'pipe' })
    await appendLog(taskSlug, e)
  }

  if (backend === 'nestjs' && haveNpx) {
    const appsDir = path.join(CWD,'apps')
    const apiDir = path.join(CWD,'apps','api')
    const listing = await fs.readdir(apiDir).catch(()=>[])
    const already = listing.includes('package.json')
    if (!already) {
      e = run('npx', ['-y', '@nestjs/cli', 'new', 'api', '--skip-git'], { cwd: appsDir, stdio: 'pipe' })
      await appendLog(taskSlug, e)
    }
  }

  if (db === 'postgres' && haveDocker) {
    e = run('docker', ['compose', 'up', '-d', 'db'], { cwd: CWD, stdio: 'pipe' })
    await appendLog(taskSlug, e)
  }

  console.log('OK (auto init). Task:', taskSlug)
}

main().catch(err => { console.error(err); process.exit(1) })
