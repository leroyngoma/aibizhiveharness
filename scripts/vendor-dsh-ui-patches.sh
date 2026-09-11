#!/usr/bin/env bash
set -euo pipefail

# Vendor patched DSH UI assets from a local global install into this repo.
# This lets your UI/branding edits travel with Docker images.
#
# Usage:
#   ./scripts/vendor-dsh-ui-patches.sh
#
# Optional:
#   DSH_GLOBAL_ROOT=/path/to/@deepseek-ai/dsh ./scripts/vendor-dsh-ui-patches.sh

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Default to your current global install path (nvm Node 22.23.1)
DSH_GLOBAL_ROOT_DEFAULT="$HOME/.nvm/versions/node/v22.23.1/lib/node_modules/@deepseek-ai/dsh"
DSH_GLOBAL_ROOT="${DSH_GLOBAL_ROOT:-$DSH_GLOBAL_ROOT_DEFAULT}"

if [ ! -d "$DSH_GLOBAL_ROOT" ]; then
  echo "DSH_GLOBAL_ROOT does not exist: $DSH_GLOBAL_ROOT" >&2
  echo "Set DSH_GLOBAL_ROOT to your @deepseek-ai/dsh install directory." >&2
  exit 1
fi

set -x

mkdir -p "$REPO_ROOT/dsh_patches/dsh-web-frontend/dist/assets"
mkdir -p "$REPO_ROOT/dsh_patches/dsh-client-ui-theme/lib"
mkdir -p "$REPO_ROOT/dsh_patches/dsh-client-ui-brand-official/lib"
mkdir -p "$REPO_ROOT/dsh_patches/dsh-client-ui-conversation/lib"
mkdir -p "$REPO_ROOT/dsh_patches/dsh-client-ui-settings-general/lib"

cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-web-frontend/dist/index.html" \
  "$REPO_ROOT/dsh_patches/dsh-web-frontend/dist/index.html"

# Copy the specific hashed asset currently referenced by our Dockerfile.
# If you upgrade DSH and the hash changes, update Dockerfile + this script.
cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-CA9Bpko5.js" \
  "$REPO_ROOT/dsh_patches/dsh-web-frontend/dist/assets/index-CA9Bpko5.js"

cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/client.js" \
  "$REPO_ROOT/dsh_patches/dsh-client-ui-theme/lib/client.js"

cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-client-ui-brand-official/lib/client.js" \
  "$REPO_ROOT/dsh_patches/dsh-client-ui-brand-official/lib/client.js"

cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js" \
  "$REPO_ROOT/dsh_patches/dsh-client-ui-conversation/lib/client.js"

cp -f "$DSH_GLOBAL_ROOT/node_modules/@deepseek-ai/dsh-client-ui-settings-general/lib/client.js" \
  "$REPO_ROOT/dsh_patches/dsh-client-ui-settings-general/lib/client.js"

set +x

echo "Vendored patched UI files into: $REPO_ROOT/dsh_patches"
