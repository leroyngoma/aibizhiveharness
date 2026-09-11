# ABZ Coder (AIBizHive) — Quickstart

## 1) Select the preset
In the DSH GUI, select: **ABZ Coder (AIBizHive)**.

## 2) One-command task bootstrap
This scaffolds tasks/<slug>/, generates repo_profile.json + repo_runbook.md, and builds .abzcache summaries:

```bash
node scripts/abz-task-bootstrap.mjs <slug>
```

## Repo detection + runbook (manual)
```bash
node scripts/abz-detect-runbook.mjs <slug>
```

## JIT summarization cache (.abzcache)
Budget defaults: 50 files / 2MB per run.

```bash
node scripts/abz-jit-summarize.mjs <slug>
```

To target specific files:

```bash
node scripts/abz-jit-summarize.mjs <slug> --files src/index.ts,src/app.py
```

## Task-focused scoping (recommended)
To keep summaries relevant, scope to likely files first:

```bash
FILES=$(node scripts/abz-scope-files.mjs <slug> "<pattern>")
node scripts/abz-jit-summarize.mjs <slug> --files "$FILES"
```

This keeps .abzcache summaries aligned to your task instead of the whole repo.
## Scaffold a new project (greenfield)

```bash
node scripts/abz-init-project.mjs --name "my-app" --backend python --db postgres
# or (when requested)
node scripts/abz-init-project.mjs --name "my-app" --backend nestjs --db postgres
# lightweight
node scripts/abz-init-project.mjs --name "my-app" --backend python --db sqlite
```
## Fully automatic greenfield init (runs generators)

This will scaffold a repo, generate a task folder, run repo detection + .abzcache, and then run generators/install steps.
All commands are logged to tasks/<slug>/execution_log.md.

```bash
node scripts/abz-init-project-run.mjs --name "my-app" --task "my-app" --backend python --db postgres
# scaffold only (no generators):
node scripts/abz-init-project-run.mjs --name "my-app" --task "my-app" --backend python --db postgres --run false
```
