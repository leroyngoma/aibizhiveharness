# HiveHand Windows Setup
# - Verifies Node
# - Verifies Ollama embeddings endpoint
# - Reindexes work_folders/* into hivehand/vector_db/index.json

$ErrorActionPreference = "Stop"

Write-Host "[HiveHand] Workspace:" (Get-Location)

# --- Node check ---
try {
  $nodev = node -v
  Write-Host "[HiveHand] Node:" $nodev
} catch {
  throw "Node.js not found on PATH. Install Node 20+ (recommended 22+) then retry."
}

# --- Ollama check ---
try {
  $body = '{"model":"nomic-embed-text","prompt":"ping"}'
  $resp = curl.exe http://127.0.0.1:11434/api/embeddings -H "Content-Type: application/json" -d $body
  if ($resp -notmatch 'embedding') {
    throw "Ollama response did not include 'embedding'. Response: $resp"
  }
  Write-Host "[HiveHand] Ollama embeddings: OK"
} catch {
  throw "Ollama embeddings not reachable. Ensure Ollama is running and run: ollama pull nomic-embed-text"
}

# --- Reindex ---
Write-Host "[HiveHand] Reindexing work_folders (phemi/sima/leroy)…"
node .\hivehand\vector_db\indexer.js reindex --role all
Write-Host "[HiveHand] Done."
