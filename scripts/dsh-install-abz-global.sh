#!/usr/bin/env bash
set -euo pipefail

# Install ABZ preset + skills into the host DSH home so they are available in ANY workspace.
# Usage: ./scripts/dsh-install-abz-global.sh

DSH_HOME_DIR="${DSH_HOME:-$HOME/.dsh}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$DSH_HOME_DIR/.agent-presets"
mkdir -p "$DSH_HOME_DIR/skills"

# Presets
cp -R "$REPO_ROOT/dsh_presets/"* "$DSH_HOME_DIR/.agent-presets/"

# Skills (filesystem skills)
if [[ -d "$REPO_ROOT/skills" ]]; then
  cp -R "$REPO_ROOT/skills/"* "$DSH_HOME_DIR/skills/" || true
fi

echo "Installed presets into: $DSH_HOME_DIR/.agent-presets"
echo "Installed skills into:  $DSH_HOME_DIR/skills"
echo "Next: restart DSH (or refresh presets list if supported)."
