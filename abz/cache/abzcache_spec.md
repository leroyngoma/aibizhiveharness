# .abzcache layout

Repo-local cache used to avoid slow full indexing and reduce token load.

- .abzcache/index/manifest.json
  - file list with size/mtime + ignore rules applied

- .abzcache/index/file_summaries.jsonl
  - one JSON per line: { path, mtimeMs, size, summary, updatedAt }

- .abzcache/index/task_links/<task_slug>.json
  - { taskSlug, inScopeFiles, createdAt, updatedAt }

Principles:
- No embeddings.
- JIT summaries only for in-scope files.
- Budgets: 50 files / 2MB per run (default).
