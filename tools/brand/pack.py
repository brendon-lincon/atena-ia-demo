"""Empacota ícones (.ico, .icns) e publica os arquivos usados pelo site em apps/web/public.

Uso: npm run brand:pack (depois de brand:png)
"""

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "brand"
PUBLIC = ROOT / "apps/web/public"


def ico(target: Path, sources: list[Path]) -> None:
    images = [Image.open(s).convert("RGBA") for s in sources]
    biggest = max(images, key=lambda i: i.width)
    biggest.save(target, format="ICO", sizes=[(i.width, i.height) for i in images], append_images=[i for i in images if i is not biggest])


def main() -> None:
    ico(BRAND / "icons/favicon/favicon.ico", [BRAND / f"icons/favicon/favicon-{n}.png" for n in (16, 32, 48)])
    ico(BRAND / "icons/windows/atena.ico", [BRAND / f"icons/windows/win-{n}.png" for n in (16, 24, 32, 48, 64, 128, 256)])
    if sys.platform == "darwin":
        subprocess.run(["iconutil", "-c", "icns", str(BRAND / "icons/macos/atena.iconset"), "-o", str(BRAND / "icons/macos/atena.icns")], check=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for source, name in [
        ("icons/favicon/favicon.svg", "favicon.svg"), ("icons/favicon/favicon.ico", "favicon.ico"), ("icons/apple/apple-touch-icon.png", "apple-touch-icon.png"),
        ("icons/pwa/pwa-192.png", "pwa-192.png"), ("icons/pwa/pwa-512.png", "pwa-512.png"), ("icons/pwa/pwa-maskable-192.png", "pwa-maskable-192.png"),
        ("icons/pwa/pwa-maskable-512.png", "pwa-maskable-512.png"), ("marketing/og-image.png", "og-image.png"),
    ]:  # fmt: skip
        shutil.copy2(BRAND / source, PUBLIC / name)
    illustrations = PUBLIC / "illustrations"
    illustrations.mkdir(exist_ok=True)
    for svg in (BRAND / "illustrations").glob("*.svg"):
        shutil.copy2(svg, illustrations / svg.name)
    patterns = PUBLIC / "patterns"
    patterns.mkdir(exist_ok=True)
    for svg in (BRAND / "patterns").glob("*.svg"):
        shutil.copy2(svg, patterns / svg.name)
    print("Ícones empacotados e publicados em apps/web/public.")


if __name__ == "__main__":
    main()
