#!/usr/bin/env bash
set -euo pipefail

REPO="/Users/user/Documents/GitHub/aibizhive agentic"

# Load nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
elif [ -s "/opt/homebrew/opt/nvm/nvm.sh" ]; then
  . "/opt/homebrew/opt/nvm/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
  . "/usr/local/opt/nvm/nvm.sh"
else
  echo "Could not find nvm.sh. Install/configure nvm first."
  exit 1
fi

cd "$REPO"

nvm use 22

dsh web
