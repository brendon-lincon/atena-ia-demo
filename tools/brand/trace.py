"""Vetoriza as partes do logotipo original (símbolo, ATENA, IA e assinatura) em caminhos SVG.

Uso: npm run brand:svg  (gera brand/logo/** e brand/icons/**/*.svg)
Se o Lincon fornecer o vetor original, ele substitui esta vetorização.
"""

import json
from pathlib import Path

import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "brand/source/logo-original.webp"
UP = 4  # fator de ampliação antes de vetorizar (suaviza o contorno)


def _path(mask: np.ndarray, x0: int, y0: int) -> str:
    """Converte uma máscara (ampliada) em `d` de SVG nas coordenadas da imagem original."""
    bitmap = potrace.Bitmap(~mask)
    curves = bitmap.trace(turdsize=6, alphamax=1.05, opticurve=True, opttolerance=0.3)

    def pt(p) -> str:
        return f"{x0 + p.x / UP:.2f} {y0 + p.y / UP:.2f}"

    parts = []
    for curve in curves:
        parts.append(f"M{pt(curve.start_point)}")
        for seg in curve.segments:
            if seg.is_corner:
                parts.append(f"L{pt(seg.c)}L{pt(seg.end_point)}")
            else:
                parts.append(f"C{pt(seg.c1)} {pt(seg.c2)} {pt(seg.end_point)}")
        parts.append("Z")
    return "".join(parts)


def _crop(gray: Image.Image, box: tuple[int, int, int, int]) -> np.ndarray:
    region = gray.crop(box)
    region = region.resize((region.width * UP, region.height * UP), Image.LANCZOS)
    return np.asarray(region, dtype=np.float32)


def _bbox(d: str) -> tuple[float, float, float, float]:
    numbers = [float(n) for n in d.replace("M", " ").replace("L", " ").replace("C", " ").replace("Z", " ").split()]
    xs, ys = numbers[0::2], numbers[1::2]
    return min(xs), min(ys), max(xs), max(ys)


def trace_all() -> dict:
    gray = Image.open(SOURCE).convert("L")
    pieces: dict[str, dict] = {}

    sym_box = (525, 525, 740, 795)
    symbol = _crop(gray, sym_box)
    pieces["symbol"] = {"ink": _path(symbol < 128, sym_box[0], sym_box[1])}
    # Versão simplificada para 16 px: silhueta sólida (contorno + miolo), sem os traços internos.
    ink = Image.fromarray(((symbol < 150) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15))
    ImageDraw.floodfill(ink, (0, 0), 128)  # o exterior vira 128; o que sobrou em 0 é miolo fechado
    silhouette = Image.fromarray(((np.asarray(ink) != 128) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(11))
    silhouette = silhouette.filter(ImageFilter.GaussianBlur(2))
    pieces["symbol-micro"] = {"ink": _path(np.asarray(silhouette) > 127, sym_box[0], sym_box[1])}

    word_box = (740, 620, 1357, 705)
    pieces["wordmark"] = {"ink": _path(_crop(gray, word_box) < 150, word_box[0], word_box[1])}

    ia_box = (1356, 620, 1550, 705)
    ia = _crop(gray, ia_box)
    dark = ia < 160
    # Faixas claras: abertura morfológica remove o "halo" de antialiasing em volta da parte escura.
    light_img = Image.fromarray((((ia >= 160) & (ia < 225)) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
    plate_img = Image.fromarray((((ia >= 225) & (ia < 250)) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
    pieces["ia"] = {
        "a": _path(dark, ia_box[0], ia_box[1]),
        "slash": _path(np.asarray(light_img) > 127, ia_box[0], ia_box[1]),
        "plate": _path(np.asarray(plate_img) > 127, ia_box[0], ia_box[1]),
    }

    tag_box = (740, 700, 1550, 760)
    pieces["tagline"] = {"tag": _path(_crop(gray, tag_box) < 246, tag_box[0], tag_box[1])}

    for piece in pieces.values():
        boxes = [_bbox(d) for d in piece.values() if d]
        piece["_bbox"] = [min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)]
    return pieces


if __name__ == "__main__":
    out = ROOT / "brand/source/logo-paths.json"
    out.write_text(json.dumps(trace_all(), indent=1), encoding="utf-8")
    print(f"Caminhos gravados em {out}")
