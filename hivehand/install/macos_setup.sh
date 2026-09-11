#!/usr/bin/env bash
set -euo pipefail

echo "[HiveHand] Workspace: $(pwd)"

# --- Node check ---
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found on PATH. Install Node 20+ (recommended 22+) then retry." >&2
  exit 1
fi

echo "[HiveHand] Node: $(node -v)"

# --- Ollama check ---
if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama not installed. On macOS: brew install ollama && brew services start ollama" >&2
  exit 1
fi

# pull model if missing (safe even if present)
ollama pull nomic-embed-text >/dev/null

curl -s http://127.0.0.1:11434/api/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"nomic-embed-text","prompt":"ping"}' \
  | grep -q embedding

echo "[HiveHand] Ollama embeddings: OK"

echo "[HiveHand] Reindexing work_folders (phemi/sima/leroy)…"
node hivehand/vector_db/indexer.js reindex --role all

echo "[HiveHand] Done."
