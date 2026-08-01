#!/usr/bin/env bash
# Lanza Narrador de Voz sin pasar por npm (usado por el acceso directo de escritorio en Linux).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

if [ ! -x "$APP_DIR/node_modules/.bin/electron" ]; then
  echo "Electron no esta instalado. Ejecuta 'npm install' dentro de $APP_DIR." >&2
  exit 1
fi

exec "$APP_DIR/node_modules/.bin/electron" "$APP_DIR" "$@"
