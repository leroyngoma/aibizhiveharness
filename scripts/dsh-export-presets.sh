#!/usr/bin/env bash
set -euo pipefail

# Exports presets from your local DSH home into this repo.
# Usage: ./scripts/dsh-export-presets.sh

DSH_HOME_DIR="${DSH_HOME:-$HOME/.dsh}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$REPO_ROOT/dsh_presets"

cp -R "$DSH_HOME_DIR/.agent-presets/"* "$REPO_ROOT/dsh_presets/"

echo "Exported presets to: $REPO_ROOT/dsh_presets"
