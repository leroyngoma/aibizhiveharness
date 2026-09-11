# ABZ Coder

ABZ Coder is an agentic, multi-agent coding preset for DSH.

Principles:
- Repo-agnostic: auto-detect stack and generate a runbook.
- Durable memory: uses .abzcache/ (no embeddings) for incremental file summaries.
- Workflow: research → plan → implement → review → (optional deploy gate).

Key scripts:
- scripts/abz-task-bootstrap.mjs
- scripts/abz-detect-runbook.mjs
- scripts/abz-jit-summarize.mjs
- scripts/abz-scope-files.mjs
## Typical stacks
- Python backend + React frontend + Postgres (default)
- NestJS backend (when requested) + React frontend + Postgres
- SQLite for lightweight/dev or embedded use-cases
