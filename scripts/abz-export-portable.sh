#!/usr/bin/env bash
set -euo pipefail

# Export ABZ into a portable bundle for another machine (e.g., Windows).
# Produces: exports/abz-portable-<timestamp>.zip

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$REPO_ROOT/exports/abz_portable"
STAMP="$(date +%Y%m%d_%H%M%S)"
ZIP_PATH="$REPO_ROOT/exports/abz-portable-$STAMP.zip"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/.dsh/.agent-presets"
mkdir -p "$OUT_DIR/.dsh/skills"
mkdir -p "$OUT_DIR/repo_scripts"

# Preset
cp -R "$REPO_ROOT/dsh_presets/abz" "$OUT_DIR/.dsh/.agent-presets/"

# Skill
cp -R "$REPO_ROOT/skills/abz-coder" "$OUT_DIR/.dsh/skills/"

# Helper scripts (optional, repo-local helpers)
cp "$REPO_ROOT/scripts/abz-"*.mjs "$OUT_DIR/repo_scripts/"
cp "$REPO_ROOT/scripts/new_task.sh" "$OUT_DIR/repo_scripts/"

# README
cat > "$OUT_DIR/README.txt" <<'EOF'
ABZ Portable Bundle

Contents:
- .dsh/.agent-presets/abz/            (DSH agent preset)
- .dsh/skills/abz-coder/              (DSH filesystem skill)
- repo_scripts/                       (optional helper scripts to copy into repos)

Install on Windows (host install):
1) Unzip this bundle somewhere.
2) Copy the .dsh folder into your user profile:
   - Copy .dsh\.agent-presets\abz to %USERPROFILE%\.dsh\.agent-presets\abz
   - Copy .dsh\skills\abz-coder to %USERPROFILE%\.dsh\skills\abz-coder
3) Restart DSH. Select preset: ABZ Coder (AIBizHive).

Optional scripts:
- Copy repo_scripts into any repo if you want the helper CLI scripts available in that repo.
EOF

mkdir -p "$REPO_ROOT/exports"
(cd "$OUT_DIR" && zip -r "$ZIP_PATH" .)

echo "Wrote: $ZIP_PATH"

ls -la "$ZIP_PATH"
