"""Gera instâncias estáticas da Inter (TTF) só para a rasterização do SVG (o resvg não lê WOFF2 variável).

Uso: npm run brand:fonts. Saída em tools/brand/.cache (ignorada pelo Git).
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "tools/brand/.cache"


def main() -> None:
    CACHE.mkdir(exist_ok=True)
    for weight in (400, 650):
        font = TTFont(ROOT / "brand/typography/inter/Inter-roman-latin.woff2")
        instance = instantiateVariableFont(font, {"wght": weight, "opsz": 28}, updateFontNames=False)
        instance.flavor = None
        for record in instance["name"].names:
            if record.nameID in (1, 16):
                record.string = "Inter"
        instance["OS/2"].usWeightClass = weight
        instance.save(CACHE / f"Inter-{weight}.ttf")
    print("Instâncias da Inter geradas para rasterização.")


if __name__ == "__main__":
    main()
