#!/usr/bin/env bash
# Crea un acceso directo (.desktop) con icono propio en el Escritorio para Narrador de Voz.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ICON_PATH="$APP_DIR/build/icon.png"
LAUNCHER="$APP_DIR/scripts/launch.sh"
DESKTOP_DIR="${XDG_DESKTOP_DIR:-$HOME/Desktop}"
DESKTOP_FILE="$DESKTOP_DIR/narrador-de-voz.desktop"

chmod +x "$LAUNCHER"
mkdir -p "$DESKTOP_DIR"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Narrador de Voz
Comment=App de escritorio para narracion de voz con seleccion de voces y efectos
Exec="$LAUNCHER"
Icon=$ICON_PATH
Terminal=false
Categories=AudioVideo;Utility;
EOF

chmod +x "$DESKTOP_FILE"

# Marca el .desktop como confiable en GNOME/Nautilus, si esta disponible.
if command -v gio >/dev/null 2>&1; then
  gio set "$DESKTOP_FILE" metadata::trusted true 2>/dev/null || true
fi

# Tambien lo registra en el menu de aplicaciones del sistema.
mkdir -p "$HOME/.local/share/applications"
cp "$DESKTOP_FILE" "$HOME/.local/share/applications/narrador-de-voz.desktop"

echo "Acceso directo creado en: $DESKTOP_FILE"
echo "Si el icono no se ve o no abre con doble clic, clic derecho sobre el > 'Permitir lanzamiento' (segun tu entorno de escritorio: GNOME, KDE, XFCE, etc.)."
