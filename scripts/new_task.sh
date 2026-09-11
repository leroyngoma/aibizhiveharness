#!/usr/bin/env bash
set -euo pipefail

# Create a new ABZ task folder under tasks/<slug>/
# Usage: ./scripts/new_task.sh my-task-slug

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <task-slug>" >&2
  exit 1
fi

ROOT="$(pwd)"
DIR="$ROOT/tasks/$SLUG"

mkdir -p "$DIR"

cat > "$DIR/intake.md" <<'EOF'
# Intake

## Request
(TODO) Describe what you want built/changed.

## Constraints
- (TODO) e.g. must work on Windows, no breaking changes, etc.

## Acceptance criteria
- (TODO) bullet list
EOF

cat > "$DIR/research.md" <<'EOF'
# Research

(TODO) Repo map, relevant files, risks.
EOF

cat > "$DIR/repo_runbook.md" <<'EOF'
# Repo Runbook

(TODO) How to install, run, test, build, (deploy if applicable).
EOF

cat > "$DIR/plan.md" <<'EOF'
# Plan

## Steps
1. (TODO)

## Acceptance criteria
- (TODO)

## Rollback
- (TODO)
EOF

cat > "$DIR/execution_log.md" <<'EOF'
# Execution Log

Record commands and outputs here.
EOF
