#!/usr/bin/env python3
"""Genera icon.png, icon.ico e icon.icns a partir de build/icon.svg."""
import io
import os
import struct

import cairosvg
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.path.join(HERE, "..", "build")
SVG_PATH = os.path.join(BUILD_DIR, "icon.svg")

SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]


def render_png(size):
    data = cairosvg.svg2png(url=SVG_PATH, output_width=size, output_height=size)
    return Image.open(io.BytesIO(data)).convert("RGBA")


def main():
    images = {size: render_png(size) for size in SIZES}

    # icon.png principal (Linux / app en general)
    images[1024].save(os.path.join(BUILD_DIR, "icon.png"))

    # icons/ con varios tamaños (usado por AppImage / linux target de electron-builder)
    icons_dir = os.path.join(BUILD_DIR, "icons")
    os.makedirs(icons_dir, exist_ok=True)
    for size in SIZES:
        images[size].save(os.path.join(icons_dir, f"{size}x{size}.png"))

    # icon.ico (Windows) con tamanos multiples embebidos
    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    images[256].save(
        os.path.join(BUILD_DIR, "icon.ico"),
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
    )

    # icon.icns (macOS)
    build_icns(images)

    print("Iconos generados en build/: icon.png, icon.ico, icon.icns, icons/*.png")


ICNS_TYPES = {
    16: b"icp4",
    32: b"icp5",
    64: b"icp6",
    128: b"ic07",
    256: b"ic08",
    512: b"ic09",
    1024: b"ic10",
}


def build_icns(images):
    entries = []
    for size, osx_type in ICNS_TYPES.items():
        img = images[size]
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()
        entries.append((osx_type, png_bytes))

    body = b"".join(
        osx_type + struct.pack(">I", len(data) + 8) + data for osx_type, data in entries
    )
    header = b"icns" + struct.pack(">I", len(body) + 8)

    with open(os.path.join(BUILD_DIR, "icon.icns"), "wb") as f:
        f.write(header + body)


if __name__ == "__main__":
    main()
