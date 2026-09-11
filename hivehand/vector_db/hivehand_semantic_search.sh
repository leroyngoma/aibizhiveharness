#!/usr/bin/env bash
set -euo pipefail

ROLE=${1:-all}
QUERY=${2:-}
TOPK=${3:-5}

if [[ -z "$QUERY" ]]; then
  echo "usage: hivehand_semantic_search.sh <role|all> <query> [topk]" >&2
  exit 1
fi

node hivehand/vector_db/indexer.js search --role "$ROLE" --query "$QUERY" --topk "$TOPK"
