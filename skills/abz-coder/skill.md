# Skill: abz-coder

## Purpose
Provide a repo-agnostic, fast agentic coding workflow (ABZ) inside DSH, with:
- Task artifacts under tasks/<slug>/
- Repo detection + runbook generation
- Incremental JIT summaries under .abzcache/ (no embeddings)

## When to use
- You are in a new workspace/repo and want ABZ to start working immediately.
- You want a repeatable research→plan→implement→review loop with durable artifacts.

## Key conventions
### Task folder
- tasks/<slug>/intake.md
- tasks/<slug>/research.md
- tasks/<slug>/repo_runbook.md
- tasks/<slug>/plan.md
- tasks/<slug>/execution_log.md
- tasks/<slug>/final_report.md
- tasks/<slug>/state.json

### Cache folder
- .abzcache/index/manifest.json
- .abzcache/index/file_summaries.jsonl
- .abzcache/index/task_links/<slug>.json

## Default budgets
- Summarization max files: 50
- Summarization max bytes per run: 2MB
- Skip single files > 512KB

## Detection signals (cross-language)
- Node: package.json, pnpm-lock.yaml, yarn.lock, package-lock.json
- Python: pyproject.toml, requirements*.txt, poetry.lock, Pipfile
- Go: go.mod / go.work
- Rust: Cargo.toml
- Docker: Dockerfile, docker-compose.yml
- E2E: playwright.config.*
- Deploy signals: .github/workflows, vercel.json, fly.toml, terraform/*.tf, k8s/helm folders

## Recommended operating procedure (ABZ default)
1) Ensure task folder exists (create it if missing).
2) Detect repo + write repo_profile.json and repo_runbook.md.
3) Task-scope a file set using grep patterns from intake/research.
4) JIT summarize ONLY those files into .abzcache.
5) Plan and implement in small steps; log commands to execution_log.md.

## Prompt snippet: Task bootstrap (no external scripts)
Use filesystem tools to create the task folder and stub files.

### state.json template
```json
{
  "taskSlug": "<slug>",
  "status": "research",
  "repoProfile": { "stacks": [], "packageManagers": [], "hasPlaywright": false },
  "inScopeFiles": [],
  "commandsRun": [],
  "decisions": [],
  "openQuestions": [],
  "deployRequested": false,
  "deployConfirmed": false
}
```

## Prompt snippet: Repo detection + runbook generation
- List top-level files.
- Detect stacks using the signals above.
- Write tasks/<slug>/repo_profile.json.
- Write tasks/<slug>/repo_runbook.md with:
  - bootstrap commands
  - unit/integration/e2e commands
  - Playwright section only if detected
  - deploy section with DEPLOY gate

## Prompt snippet: JIT summarization
- Build a manifest (paths + size + mtime) excluding heavy dirs.
- Select candidate files (starting from grep hits).
- For each file within budgets, write a short structured summary:
  - first line / purpose
  - imports/exports/signals
  - preview of header
- Append summaries to .abzcache/index/file_summaries.jsonl.
- Update .abzcache/index/task_links/<slug>.json.

## Greenfield mode defaults
If the repo is empty or user requests “from scratch”, prefer:
- Python backend + React frontend + Postgres
- NestJS backend when explicitly requested
- SQLite for lightweight/dev

Always include in plan.md:
- repo layout
- env setup
- DB migration strategy
- local dev commands
- testing approach
- deploy outline (gated)
