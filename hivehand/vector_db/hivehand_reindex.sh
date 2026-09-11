#!/usr/bin/env bash
set -euo pipefail

ROLE=${1:-all}
node hivehand/vector_db/indexer.js reindex --role "$ROLE"
