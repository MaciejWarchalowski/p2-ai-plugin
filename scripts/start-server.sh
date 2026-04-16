#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$PLUGIN_ROOT/server"

if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "Installing server dependencies..."
  npm install --prefix "$SERVER_DIR"
fi

PORT="${PORT:-3001}"
export PORT
exec node "$SERVER_DIR/index.js"
