// HiveHand local vector indexer
// - Reads files from work_folders/<role>/**
// - Chunks text
// - Calls Ollama embeddings API
// - Stores vectors + metadata in hivehand/vector_db/index.json
//
// Usage:
//   node hivehand/vector_db/indexer.js reindex --role phemi
//   node hivehand/vector_db/indexer.js reindex --role all
//   node hivehand/vector_db/indexer.js search --role phemi --query "pricing model" --topk 5
//
// Notes:
// - JSON storage is intentionally simple and portable. If it grows too large,
//   we will migrate to SQLite (still local) without changing the tool surface.

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const INDEX_PATH = path.join(ROOT, 'hivehand', 'vector_db', 'index.json')

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'

function nowIso() {
  return new Date().toISOString()
}

async function readIndex() {
  const raw = await fs.readFile(INDEX_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeIndex(next) {
  await fs.writeFile(INDEX_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
}

async function statSafe(p) {
  try {
    return await fs.stat(p)
  } catch {
    return null
  }
}

async function listFilesRecursive(dir) {
  const out = []
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()
    let entries
    try {
      entries = await fs.readdir(d, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const p = path.join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile()) out.push(p)
    }
  }
  return out
}

function chunkText(text, opts = {}) {
  const maxChars = opts.maxChars ?? 1800
  const overlap = opts.overlap ?? 200

  const clean = String(text).replace(/\r\n/g, '\n')
  const chunks = []
  let i = 0
  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars)
    const slice = clean.slice(i, end)
    const trimmed = slice.trim()
    if (trimmed) chunks.push(trimmed)
    if (end >= clean.length) break
    i = Math.max(0, end - overlap)
  }
  return chunks
}

async function ollamaEmbed(prompt) {
  const res = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ollama embeddings failed: ${res.status} ${body}`)
  }
  const json = await res.json()
  if (!json || !Array.isArray(json.embedding)) throw new Error('ollama embeddings: missing embedding[]')
  return json.embedding
}

function cosine(a, b) {
  let dot = 0
  let na = 0
  let nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const x = a[i]
    const y = b[i]
    dot += x * y
    na += x * x
    nb += y * y
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

function roleDir(role) {
  return path.join(ROOT, 'work_folders', role)
}

function toRel(p) {
  return path.relative(ROOT, p)
}

async function reindexRole(role) {
  const idx = await readIndex()

  const dir = roleDir(role)
  const st = await statSafe(dir)
  if (!st || !st.isDirectory()) {
    return { role, indexed: 0, skipped: 0, error: `missing dir ${toRel(dir)}` }
  }

  const files = await listFilesRecursive(dir)
  let indexed = 0
  let skipped = 0

  for (const abs of files) {
    const rel = toRel(abs)
    const s = await statSafe(abs)
    if (!s) continue

    // small allowlist
    const ext = path.extname(abs).toLowerCase()
    const ok = ['.md', '.txt', '.json', '.yaml', '.yml'].includes(ext)
    if (!ok) {
      skipped++
      continue
    }

    const prev = idx.files[rel]
    const mtimeMs = s.mtimeMs
    const size = s.size
    if (prev && prev.mtimeMs === mtimeMs && prev.size === size) {
      skipped++
      continue
    }

    let content
    try {
      content = await fs.readFile(abs, 'utf-8')
    } catch {
      skipped++
      continue
    }

    const chunks = chunkText(content)
    const chunkIds = []

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i]
      const id = `${rel}::${i}`
      const vec = await ollamaEmbed(text)
      idx.chunks[id] = {
        id,
        role,
        file: rel,
        ordinal: i,
        text,
        vector: vec,
        updatedAt: nowIso(),
      }
      chunkIds.push(id)

      if (!idx.embedding.dim) idx.embedding.dim = vec.length
    }

    idx.files[rel] = {
      role,
      path: rel,
      mtimeMs,
      size,
      chunkIds,
      updatedAt: nowIso(),
    }

    indexed++
  }

  await writeIndex(idx)
  return { role, indexed, skipped }
}

async function searchRole(role, query, topk) {
  const idx = await readIndex()
  const qVec = await ollamaEmbed(query)

  const scored = []
  for (const ch of Object.values(idx.chunks)) {
    if (role !== 'all' && ch.role !== role) continue
    const score = cosine(qVec, ch.vector)
    scored.push({ score, chunk: ch })
  }
  scored.sort((a, b) => b.score - a.score)

  const hits = scored.slice(0, topk).map(({ score, chunk }) => ({
    score,
    file: chunk.file,
    ordinal: chunk.ordinal,
    preview: chunk.text.slice(0, 280),
  }))

  return { role, query, topk, hits }
}

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
      out[key] = val
    } else {
      out._.push(a)
    }
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const cmd = args._[0]

  if (cmd === 'reindex') {
    const role = String(args.role || 'all')
    const roles = role === 'all' ? ['phemi', 'sima', 'leroy'] : [role]
    const results = []
    for (const r of roles) results.push(await reindexRole(r))
    console.log(JSON.stringify({ ok: true, results }, null, 2))
    return
  }

  if (cmd === 'search') {
    const role = String(args.role || 'all')
    const query = String(args.query || '')
    const topk = Math.max(1, Math.min(20, Number(args.topk || 5)))
    if (!query) throw new Error('--query required')
    const result = await searchRole(role, query, topk)
    console.log(JSON.stringify({ ok: true, result }, null, 2))
    return
  }

  throw new Error('Usage: node indexer.js reindex --role <phemi|sima|leroy|all> | search --role <...> --query <text> [--topk 5]')
}

main().catch((e) => {
  console.error(String(e && e.stack ? e.stack : e))
  process.exit(1)
})
