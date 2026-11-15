"""Gera as peças do logotipo (SVG), os arranjos, os ícones (SVG) e o manifesto de rasterização.

Uso: npm run brand:svg
Origem: brand/source/logo-paths.json (gerado por tools/brand/trace.py).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "brand"
PATHS = json.loads((BRAND / "source/logo-paths.json").read_text(encoding="utf-8"))
NAVY, MID, LIGHT = "#04233F", "#2F6AA3", "#A3CFE6"
COLORS = ["mono-black", "navy", "white", "on-navy", "duotone"]
INK = {"mono-black": "#000000", "navy": NAVY, "white": "#FFFFFF", "on-navy": "#FFFFFF", "duotone": NAVY}
# Opacidades que preservam a hierarquia tonal do original (preto > cinza > faixa clara > placa).
OPACITY = {"a": 0.62, "slash": 0.31, "plate": 0.06, "tag": 0.6}
DUOTONE_OPACITY = {"a": 1.0, "slash": 0.62, "plate": 0.16, "tag": 0.6}
BBOX = {
    "symbol": PATHS["symbol"]["_bbox"],
    "symbol-micro": PATHS["symbol-micro"]["_bbox"],
    "wordmark": [PATHS["wordmark"]["_bbox"][0], PATHS["ia"]["_bbox"][1], PATHS["ia"]["_bbox"][2], PATHS["ia"]["_bbox"][3]],
    "tagline": PATHS["tagline"]["_bbox"],
}
CAP_HEIGHT = 64  # altura do "A" do logotipo = área de respiro mínima


def paint(color: str, role: str) -> str:
    if color == "duotone" and role in ("a", "slash", "plate"):
        return f'fill="url(#ia)" fill-opacity="{DUOTONE_OPACITY[role]}"'
    opacity = OPACITY.get(role)
    base = f'fill="{INK[color]}"'
    return base if opacity is None or role == "ink" else f'{base} fill-opacity="{opacity}"'


def body(piece: str, color: str) -> str:
    def path(d: str, role: str) -> str:
        return f'<path fill-rule="evenodd" {paint(color, role)} d="{d}"/>'

    if piece in ("symbol", "symbol-micro"):
        return path(PATHS[piece]["ink"], "ink")
    if piece == "wordmark":
        ia = PATHS["ia"]
        return path(PATHS["wordmark"]["ink"], "ink") + path(ia["plate"], "plate") + path(ia["slash"], "slash") + path(ia["a"], "a")
    return path(PATHS["tagline"]["tag"], "tag")


def place(piece: str, color: str, x: float, y: float, scale: float = 1.0) -> tuple[str, list[float]]:
    """Posiciona uma peça com o canto superior esquerdo em (x, y). Devolve o SVG e a caixa ocupada."""
    x0, y0, x1, y1 = BBOX[piece]
    group = f'<g transform="translate({x - x0 * scale:.2f} {y - y0 * scale:.2f}) scale({scale})">{body(piece, color)}</g>'
    return group, [x, y, x + (x1 - x0) * scale, y + (y1 - y0) * scale]


def defs(color: str, box: list[float]) -> str:
    if color != "duotone":
        return ""
    x0, x1 = PATHS["ia"]["_bbox"][0], PATHS["ia"]["_bbox"][2]
    return f'<defs><linearGradient id="ia" gradientUnits="userSpaceOnUse" x1="{x0}" y1="0" x2="{x1}" y2="0"><stop offset="0" stop-color="{MID}"/><stop offset="1" stop-color="{LIGHT}"/></linearGradient></defs>'


def document(items: list[tuple[str, list[float]]], color: str, title: str, pad: float = 0, square: bool = False) -> str:
    x0 = min(b[0] for _, b in items)
    y0 = min(b[1] for _, b in items)
    x1 = max(b[2] for _, b in items)
    y1 = max(b[3] for _, b in items)
    w, h = x1 - x0, y1 - y0
    background = ""
    if color == "on-navy":
        pad = pad or CAP_HEIGHT
        if square:
            side = max(w, h) + pad * 2
            x0, y0 = x0 - (side - w) / 2, y0 - (side - h) / 2
            w = h = side
            pad_x = pad_y = 0
        else:
            x0, y0, w, h = x0 - pad, y0 - pad, w + pad * 2, h + pad * 2
            pad_x = pad_y = 0
        background = f'<rect x="{x0:.2f}" y="{y0:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{NAVY}"/>'
        _ = (pad_x, pad_y)
    else:
        x0, y0, w, h = x0 - pad, y0 - pad, w + pad * 2, h + pad * 2
    inner = "".join(g for g, _ in items)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" role="img" aria-label="{title}">'
        f"<title>{title}</title>{defs(color, [x0, y0, x0 + w, y0 + h])}{background}{inner}</svg>\n"
    )


def lockups(color: str) -> dict[str, str]:
    s = {k: BBOX[k] for k in BBOX}
    sw, sh = s["symbol"][2] - s["symbol"][0], s["symbol"][3] - s["symbol"][1]
    ww = s["wordmark"][2] - s["wordmark"][0]
    # Horizontal: composição original (símbolo à esquerda; ATENA IA centralizado na altura do símbolo; assinatura abaixo).
    sym_x, sym_y = 0.0, 0.0
    word_x = sw + 23
    word_y = sym_y + (sh - (s["wordmark"][3] - s["wordmark"][1])) / 2 + 4
    tag_y = word_y + (s["wordmark"][3] - s["wordmark"][1]) + 13
    sym = place("symbol", color, sym_x, sym_y)
    word = place("wordmark", color, word_x, word_y)
    tag = place("tagline", color, word_x, tag_y)
    horizontal = [sym, word]
    horizontal_tag = [sym, word, tag]
    # Vertical: símbolo ampliado, centralizado sobre o logotipo.
    k = 1.35
    vsym = place("symbol", color, (ww - sw * k) / 2, 0, k)
    vword = place("wordmark", color, 0, sh * k + 64)
    vtag = place("tagline", color, 0, sh * k + 64 + (s["wordmark"][3] - s["wordmark"][1]) + 26)
    return {
        "horizontal": document(horizontal, color, "Atena IA", pad=CAP_HEIGHT if color == "on-navy" else 0),
        "horizontal-tagline": document(horizontal_tag, color, "Atena IA — Gestão, Engenharia, Controle", pad=CAP_HEIGHT if color == "on-navy" else 0),
        "vertical": document([vsym, vword], color, "Atena IA"),
        "vertical-tagline": document([vsym, vword, vtag], color, "Atena IA — Gestão, Engenharia, Controle"),
    }


def tile(size: int, color_symbol: str = "#FFFFFF", radius: float = 0.0, scale: float = 0.6, micro: bool = False, circle: bool = False) -> str:
    """Quadro azul-marinho com o símbolo branco centralizado (ícones de aplicativo)."""
    piece = "symbol-micro" if micro else "symbol"
    x0, y0, x1, y1 = BBOX[piece]
    w, h = x1 - x0, y1 - y0
    k = size * scale / max(w, h)
    tx, ty = (size - w * k) / 2 - x0 * k, (size - h * k) / 2 - y0 * k
    shape = (
        f'<circle cx="{size / 2}" cy="{size / 2}" r="{size / 2}" fill="{NAVY}"/>'
        if circle
        else f'<rect width="{size}" height="{size}" rx="{size * radius:.2f}" fill="{NAVY}"/>'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">{shape}'
        f'<g transform="translate({tx:.2f} {ty:.2f}) scale({k:.4f})"><path fill-rule="evenodd" fill="{color_symbol}" d="{PATHS[piece]["ink"]}"/></g></svg>\n'
    )


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    manifest: list[dict] = []
    widths = {"symbol": 128, "wordmark": 480, "tagline": 480, "lockup-horizontal": 640, "lockup-vertical": 400}

    def raster(svg: Path, kind: str, rel: str) -> None:
        for suffix, factor in (("", 1), ("@2x", 2), ("@3x", 3)):
            manifest.append({"svg": str(svg.relative_to(ROOT)), "out": str((svg.parent / f"{svg.stem}{suffix}.png").relative_to(ROOT)), "width": widths[kind] * factor})

    for color in COLORS:
        ink_pieces = {"symbol": "symbol", "wordmark": "wordmark", "tagline": "tagline"}
        for folder, piece in ink_pieces.items():
            items = [place(piece, color, 0, 0)]
            svg_path = BRAND / f"logo/{folder}/atena-{folder}-{color}.svg"
            write(svg_path, document(items, color, "Atena IA", square=(folder == "symbol")))
            raster(svg_path, folder, "")
        write(BRAND / f"logo/symbol/atena-symbol-micro-{color}.svg", document([place("symbol-micro", color, 0, 0)], color, "Atena IA", square=True))
        for arrangement, svg in lockups(color).items():
            svg_path = BRAND / f"logo/lockup/atena-lockup-{arrangement}-{color}.svg"
            write(svg_path, svg)
            raster(svg_path, "lockup-vertical" if arrangement.startswith("vertical") else "lockup-horizontal", "")

    icons = BRAND / "icons"
    for size in (16, 32, 48):
        write(icons / f"favicon/favicon-{size}.svg", tile(size, radius=0.2, scale=0.78, micro=True))
        manifest.append({"svg": f"brand/icons/favicon/favicon-{size}.svg", "out": f"brand/icons/favicon/favicon-{size}.png", "width": size})
    write(icons / "favicon/favicon.svg", tile(64, radius=0.2, scale=0.78, micro=True))
    for size in (192, 512):
        write(icons / f"pwa/pwa-{size}.svg", tile(size, radius=0.0, scale=0.58))
        manifest.append({"svg": f"brand/icons/pwa/pwa-{size}.svg", "out": f"brand/icons/pwa/pwa-{size}.png", "width": size})
        write(icons / f"pwa/pwa-maskable-{size}.svg", tile(size, radius=0.0, scale=0.48))
        manifest.append({"svg": f"brand/icons/pwa/pwa-maskable-{size}.svg", "out": f"brand/icons/pwa/pwa-maskable-{size}.png", "width": size})
    write(icons / "apple/apple-touch-icon.svg", tile(180, radius=0.0, scale=0.58))
    manifest.append({"svg": "brand/icons/apple/apple-touch-icon.svg", "out": "brand/icons/apple/apple-touch-icon.png", "width": 180})
    # macOS: quadro arredondado com margem transparente (grade do sistema: 824 de 1024).
    mac = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><g transform="translate(100 100)">'
        + tile(824, radius=0.2237, scale=0.56).split(">", 1)[1].rsplit("</svg>", 1)[0]
        + "</g></svg>\n"
    )
    write(icons / "macos/macos-icon.svg", mac)
    for name, px in (("16", 16), ("16@2x", 32), ("32", 32), ("32@2x", 64), ("128", 128), ("128@2x", 256), ("256", 256), ("256@2x", 512), ("512", 512), ("512@2x", 1024)):
        manifest.append({"svg": "brand/icons/macos/macos-icon.svg", "out": f"brand/icons/macos/atena.iconset/icon_{name.split('@')[0]}x{name.split('@')[0]}{'@2x' if '@2x' in name else ''}.png", "width": px})
    for px in (16, 24, 32, 48, 64, 128, 256):
        write(icons / f"windows/win-{px}.svg", tile(px, radius=0.18, scale=0.78 if px <= 48 else 0.6, micro=px <= 48))
        manifest.append({"svg": f"brand/icons/windows/win-{px}.svg", "out": f"brand/icons/windows/win-{px}.png", "width": px})
    write(icons / "social/avatar-square.svg", tile(800, radius=0.0, scale=0.6))
    write(icons / "social/avatar-circle.svg", tile(800, scale=0.52, circle=True))
    for name in ("avatar-square", "avatar-circle"):
        manifest.append({"svg": f"brand/icons/social/{name}.svg", "out": f"brand/icons/social/{name}.png", "width": 800})

    (BRAND / "source/render-manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")

    # Caminhos para o front-end renderizar o logotipo em linha (cor herdada do tema).
    out = ROOT / "apps/web/src/design/brand/logo.generated.ts"
    out.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "symbol": {"d": PATHS["symbol"]["ink"], "box": BBOX["symbol"]},
        "symbolMicro": {"d": PATHS["symbol-micro"]["ink"], "box": BBOX["symbol-micro"]},
        "wordmark": {"ink": PATHS["wordmark"]["ink"], "a": PATHS["ia"]["a"], "slash": PATHS["ia"]["slash"], "plate": PATHS["ia"]["plate"], "box": BBOX["wordmark"]},
        "tagline": {"d": PATHS["tagline"]["tag"], "box": BBOX["tagline"]},
        "opacity": OPACITY,
        "wordmarkGradientBox": PATHS["ia"]["_bbox"],
    }
    out.write_text("// GERADO por tools/brand/build_logo.py. Não edite à mão.\n\nexport const logo = " + json.dumps(data) + " as const;\n", encoding="utf-8")
    print(f"{len(manifest)} rasterizações previstas.")


if __name__ == "__main__":
    main()
