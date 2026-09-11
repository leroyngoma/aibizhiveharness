#!/usr/bin/env bash
set -euo pipefail

# Imports vendored presets into your local DSH home.
# Usage: ./scripts/dsh-import-presets.sh

DSH_HOME_DIR="${DSH_HOME:-$HOME/.dsh}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$DSH_HOME_DIR/.agent-presets"

cp -R "$REPO_ROOT/dsh_presets/"* "$DSH_HOME_DIR/.agent-presets/"

echo "Imported presets into: $DSH_HOME_DIR/.agent-presets"
