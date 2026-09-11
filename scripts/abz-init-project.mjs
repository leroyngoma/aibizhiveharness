#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const CWD = process.cwd()

function slugify(s){
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
}

async function exists(p){ try { await fs.stat(p); return true } catch { return false } }
async function mkdirp(p){ await fs.mkdir(p, { recursive:true }) }
async function write(p, c){ await mkdirp(path.dirname(p)); await fs.writeFile(p, c, 'utf8') }

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

const args = parseArgs(process.argv.slice(2))
const name = String(args.name || 'abz-app')
const backend = String(args.backend || 'python').toLowerCase()
const db = String(args.db || 'postgres').toLowerCase()

if (!['python','nestjs'].includes(backend)) { console.error('Invalid --backend (python|nestjs)'); process.exit(2) }
if (!['postgres','sqlite'].includes(db)) { console.error('Invalid --db (postgres|sqlite)'); process.exit(2) }

const repoName = slugify(name)
const apiDir = path.join(CWD,'apps','api')
const webDir = path.join(CWD,'apps','web')

async function main(){
  if (await exists(path.join(CWD,'apps'))) {
    const listing = await fs.readdir(path.join(CWD,'apps')).catch(()=>[])
    if (listing.length) {
      console.error('apps/ already exists and is not empty; aborting to avoid overwriting.')
      process.exit(2)
    }
  }

  await write(path.join(CWD,'README.md'),
    '# ' + repoName + '\n\n' +
    'Scaffolded by ABZ.\n\n' +
    '## Layout\n- apps/api\n- apps/web\n\n' +
    '## Quickstart\n\n' +
    '### Backend\nSee apps/api/README.md\n\n' +
    '### Frontend\nSee apps/web/README.md\n\n' +
    '### Database\nDB mode: ' + db + '\n\n' +
    '> Deploy is gated: never deploy unless explicitly requested and confirmed.\n'
  )

  const giPath = path.join(CWD,'.gitignore')
  const giExists = await exists(giPath)
  const giAdd = ['# ABZ','node_modules/','dist/','build/','.venv/','__pycache__/','.pytest_cache/','.abzcache/','*.sqlite3',''].join('\n')
  if (!giExists) await write(giPath, giAdd + '\n')
  else {
    const cur = await fs.readFile(giPath,'utf8').catch(()=> '')
    if (!cur.includes('.abzcache/')) await fs.writeFile(giPath, cur.trimEnd() + '\n\n' + giAdd + '\n','utf8')
  }

  if (db === 'postgres') {
    await write(path.join(CWD,'docker-compose.yml'),
      ['services:','  db:','    image: postgres:16','    environment:','      POSTGRES_USER: app','      POSTGRES_PASSWORD: app','      POSTGRES_DB: app','    ports:',      "      - '5432:5432'",'    volumes:','      - pgdata:/var/lib/postgresql/data','','volumes:','  pgdata:',''].join('\n') + '\n'
    )
  }

  if (backend === 'python') {
    await mkdirp(apiDir)
    await write(path.join(apiDir,'README.md'),
      ['# API (Python / FastAPI)','', '## Setup','```bash','python -m venv .venv && source .venv/bin/activate','pip install -r requirements.txt','```','', '## Run','```bash','uvicorn app.main:app --reload --port 8000','```','', '## Tests','```bash','pytest -q','```','', '## DB','Mode: ' + db + '.', (db==='postgres') ? 'Use DATABASE_URL=postgresql://app:app@localhost:5432/app' : 'Use sqlite via DATABASE_URL=sqlite:///./app.db', ''].join('\n') + '\n'
    )
    await write(path.join(apiDir,'requirements.txt'), ['fastapi','uvicorn[standard]','pydantic','pytest','httpx','# Optional DB libs (choose later):','# sqlalchemy','# psycopg[binary]',''].join('\n') + '\n')
    await mkdirp(path.join(apiDir,'app'))
    await write(path.join(apiDir,'app','main.py'), ['from fastapi import FastAPI','', 'app = FastAPI(title="API")','', '@app.get("/health")','def health():','    return {"ok": True}',''].join('\n') + '\n')
    await write(path.join(apiDir,'pytest.ini'), ['[pytest]','testpaths = tests',''].join('\n'))
    await mkdirp(path.join(apiDir,'tests'))
    await write(path.join(apiDir,'tests','test_health.py'), ['from fastapi.testclient import TestClient','from app.main import app','', 'client = TestClient(app)','', 'def test_health():','    r = client.get("/health")','    assert r.status_code == 200','    assert r.json()["ok"] is True',''].join('\n') + '\n')
  } else {
    await mkdirp(apiDir)
    await write(path.join(apiDir,'README.md'), ['# API (NestJS)','', 'This scaffold is minimal; generate a full NestJS app via:','```bash','npm i -g @nestjs/cli','nest new api','```','', 'Or use npx:','```bash','npx @nestjs/cli new api','```','', 'DB mode: ' + db + ' (wire up via TypeORM/Prisma later).',''].join('\n') + '\n')
    await write(path.join(apiDir,'NOTE.md'), 'NestJS scaffold placeholder. Use Nest CLI to generate, then update ABZ runbook.\n')
  }

  await mkdirp(webDir)
  await write(path.join(webDir,'README.md'), ['# Web (React + Vite)','', 'Generate a full app via:','```bash','npm create vite@latest web -- --template react-ts','```','', 'Then:','```bash','cd web','npm install','npm run dev','```',''].join('\n') + '\n')

  await write(path.join(CWD,'.env.example'), ['# Example environment variables', (db==='postgres') ? 'DATABASE_URL=postgresql://app:app@localhost:5432/app' : 'DATABASE_URL=sqlite:///./app.db', 'API_BASE_URL=http://localhost:8000',''].join('\n') + '\n')

  console.log(JSON.stringify({ ok:true, repoName, backend, db }, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })
