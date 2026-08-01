#!/usr/bin/env bash
# Genera "Narrador de Voz.app" (con su icono propio) y coloca un acceso directo en el Escritorio.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

if [ ! -d "node_modules/electron-builder" ]; then
  echo "Instalando electron-builder..."
  npm install --save-dev electron-builder
fi

echo "Generando Narrador de Voz.app (puede tardar un poco la primera vez)..."
npx electron-builder --mac --dir

BUILT_APP=$(find dist -maxdepth 2 -name "*.app" | head -n 1)
if [ -z "$BUILT_APP" ]; then
  echo "No se pudo generar la app. Revisa el mensaje de electron-builder arriba." >&2
  exit 1
fi

DESKTOP="$HOME/Desktop"
mkdir -p "$DESKTOP"
ln -sfn "$APP_DIR/$BUILT_APP" "$DESKTOP/Narrador de Voz.app"

echo "Acceso directo creado en: $DESKTOP/Narrador de Voz.app"
