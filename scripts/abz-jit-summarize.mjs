#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const CWD = process.cwd()

const IGNORE_DIRS = new Set(['.git','node_modules','dist','build','.next','.nuxt','.venv','venv','__pycache__','.pytest_cache','.mypy_cache','.ruff_cache','.abzcache','.turbo','.cache','coverage','target'])
const TEXT_EXT_ALLOW = new Set(['.md','.txt','.json','.yml','.yaml','.toml','.js','.ts','.jsx','.tsx','.py','.go','.rs','.java','.kt','.c','.cc','.cpp','.h','.hpp','.cs','.php','.rb','.sh','.zsh','.bash','.sql','.graphql','.gql'])

function nowIso(){ return new Date().toISOString() }
function toPosix(p){ return p.split(path.sep).join('/') }
async function statSafe(p){ try { return await fs.stat(p) } catch { return null } }

async function walk(root){
  const out=[]
  const stack=[root]
  while(stack.length){
    const d=stack.pop()
    let entries
    try { entries = await fs.readdir(d, { withFileTypes:true }) } catch { continue }
    for(const e of entries){
      const abs = path.join(d,e.name)
      if(e.isDirectory()){
        if(IGNORE_DIRS.has(e.name)) continue
        stack.push(abs)
      } else if (e.isFile()) {
        out.push(abs)
      }
    }
  }
  return out
}

function isTextLike(file){
  const ext = path.extname(file).toLowerCase()
  if (TEXT_EXT_ALLOW.has(ext)) return true
  const base = path.basename(file)
  if (base.startsWith('.env')) return true
  return false
}

function cheapSummary(text, rel){
  const lines = String(text).replace(/
/g,'
').split('
')
  const head = lines.slice(0, 120)
  const nonEmpty = head.filter(l=>l.trim())
  const firstNonEmpty = nonEmpty[0] || ''
  const signals = []
  for(const l of head){
    const s=l.trim()
    if(!s) continue
    if(/^import/.test(s) || s.includes('require(')) signals.push(s)
    if(/^export/.test(s)) signals.push(s)
    if(/^def/.test(s) || /^class/.test(s) || /^function/.test(s)) signals.push(s)
    if(s.startsWith('#') || s.startsWith('##')) signals.push(s)
    if(signals.length>=25) break
  }
  const preview = head.slice(0, 40).join('
').slice(0, 2000)
  return { rel, firstLine: firstNonEmpty.slice(0, 200), signals, preview }
}

async function readJsonlMap(p){
  const m = new Map()
  const st = await statSafe(p)
  if(!st) return m
  const raw = await fs.readFile(p,'utf8')
  for (const line of raw.split('
')){
    if(!line.trim()) continue
    try { const j = JSON.parse(line); if(j && j.path) m.set(j.path, j) } catch {}
  }
  return m
}

async function appendJsonl(p, rows){
  if(!rows.length) return
  await fs.mkdir(path.dirname(p), { recursive:true })
  const content = rows.map(r=>JSON.stringify(r)).join('
') + '
'
  await fs.appendFile(p, content, 'utf8')
}

async function writeJson(p, obj){
  await fs.mkdir(path.dirname(p), { recursive:true })
  await fs.writeFile(p, JSON.stringify(obj, null, 2) + '
', 'utf8')
}

function slugify(s){ return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }

async function main(){
  const args = process.argv.slice(2)
  const taskSlug = slugify(args[0] || '')
  if(!taskSlug){ console.error('Usage: scripts/abz-jit-summarize.mjs <task-slug> [--files <comma-separated>]'); process.exit(2) }

  const maxFiles = 50
  const maxBytes = 2097152

  const filesArgIdx = args.indexOf('--files')
  let requested = null
  if(filesArgIdx !== -1){ requested = String(args[filesArgIdx+1] || '').split(',').map(s=>s.trim()).filter(Boolean) }

  const all = await walk(CWD)
  const manifest = []
  for(const abs of all){
    const rel = toPosix(path.relative(CWD, abs))
    if(rel.startsWith('tasks/')) continue
    if(!isTextLike(abs)) continue
    const st = await statSafe(abs)
    if(!st) continue
    if(st.size > 512*1024) continue
    manifest.push({ path: rel, size: st.size, mtimeMs: st.mtimeMs })
  }

  const manifestPath = path.join(CWD, '.abzcache', 'index', 'manifest.json')
  await writeJson(manifestPath, { generatedAt: nowIso(), root: toPosix(CWD), count: manifest.length, files: manifest })

  const set = new Set(manifest.map(x=>x.path))
  let targets = requested ? requested : manifest.map(x=>x.path)
  targets = targets.filter(p=>set.has(p))

  const summariesPath = path.join(CWD, '.abzcache', 'index', 'file_summaries.jsonl')
  const existing = await readJsonlMap(summariesPath)

  const rows=[]
  let usedFiles=0
  let usedBytes=0

  for(const rel of targets){
    if(usedFiles >= maxFiles) break
    const meta = manifest.find(x=>x.path===rel)
    if(!meta) continue
    if(usedBytes + meta.size > maxBytes) break
    const prev = existing.get(rel)
    if(prev && prev.mtimeMs === meta.mtimeMs && prev.size === meta.size) continue
    let text
    try { text = await fs.readFile(path.join(CWD, rel), 'utf8') } catch { continue }
    const sum = cheapSummary(text, rel)
    rows.push({ path: rel, mtimeMs: meta.mtimeMs, size: meta.size, summary: sum, updatedAt: nowIso() })
    usedFiles++
    usedBytes += meta.size
  }

  await appendJsonl(summariesPath, rows)
  const taskLinksPath = path.join(CWD, '.abzcache', 'index', 'task_links', taskSlug + '.json')
  await writeJson(taskLinksPath, { taskSlug, updatedAt: nowIso(), maxFiles, maxBytes, inScopeFiles: rows.map(r=>r.path) })

  console.log(JSON.stringify({ ok:true, taskSlug, wrote: [toPosix(manifestPath), toPosix(summariesPath), toPosix(taskLinksPath)], summarized: {files: usedFiles, bytes: usedBytes} }, null, 2))
}

main().catch(err=>{ console.error(err); process.exit(1) })
