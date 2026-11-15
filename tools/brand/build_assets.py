"""Gera movimento, padrões, ilustrações, moldes de documentos e peças de marketing da marca.

Uso: npm run brand:svg (executado em seguida a build_logo)
"""

import json

from .build_logo import BBOX, BRAND, NAVY, PATHS, ROOT, place, write

SYM = PATHS["symbol"]["ink"]
X0, Y0, X1, Y1 = BBOX["symbol"]
W, H = X1 - X0, Y1 - Y0
VIEW = f"{X0:.1f} {Y0:.1f} {W:.1f} {H:.1f}"
REDUCE = "@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }"


def motion() -> None:
    gradient = '<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#6FADD3" stop-opacity="0"/><stop offset=".5" stop-color="#EAF3FA"/><stop offset="1" stop-color="#6FADD3" stop-opacity="0"/></linearGradient>'
    entry = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW}" role="img" aria-label="Atena IA">
<style>
.s {{ fill: {NAVY}; animation: rise 900ms cubic-bezier(.2,0,0,1) both; }}
.beam {{ animation: sweep 1100ms cubic-bezier(.2,0,0,1) 250ms both; }}
@keyframes rise {{ from {{ opacity: 0; transform: translateY(10px); }} to {{ opacity: 1; transform: none; }} }}
@keyframes sweep {{ from {{ transform: translateX(-120%); }} to {{ transform: translateX(120%); }} }}
{REDUCE}
</style>
<defs>{gradient}<clipPath id="c"><path fill-rule="evenodd" d="{SYM}"/></clipPath></defs>
<path class="s" fill-rule="evenodd" d="{SYM}"/>
<g clip-path="url(#c)"><rect class="beam" x="{X0}" y="{Y0}" width="{W * 0.6:.1f}" height="{H}" fill="url(#beam)"/></g>
</svg>
"""
    loading = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW}" role="img" aria-label="Carregando">
<style>
.base {{ fill: {NAVY}; opacity: .28; }}
.beam {{ animation: sweep 1600ms cubic-bezier(.2,0,0,1) infinite; }}
@keyframes sweep {{ from {{ transform: translateX(-110%); }} to {{ transform: translateX(170%); }} }}
{REDUCE}
</style>
<defs>{gradient.replace('#EAF3FA', '#2F6AA3')}<clipPath id="c"><path fill-rule="evenodd" d="{SYM}"/></clipPath></defs>
<path class="base" fill-rule="evenodd" d="{SYM}"/>
<g clip-path="url(#c)"><rect class="beam" x="{X0}" y="{Y0}" width="{W * 0.7:.1f}" height="{H}" fill="url(#beam)"/></g>
</svg>
"""
    thinking = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Atena pensando">
<style>
.ring {{ transform-origin: 120px 120px; animation: spin 2400ms linear infinite; }}
.glow {{ transform-origin: 120px 120px; animation: pulse 1800ms ease-in-out infinite; }}
@keyframes spin {{ to {{ transform: rotate(360deg); }} }}
@keyframes pulse {{ 0%,100% {{ opacity: .45; transform: scale(.92); }} 50% {{ opacity: .9; transform: scale(1.04); }} }}
{REDUCE}
</style>
<defs>
<radialGradient id="g"><stop offset="0" stop-color="#A3CFE6" stop-opacity=".85"/><stop offset="1" stop-color="#4C8BBD" stop-opacity="0"/></radialGradient>
<linearGradient id="r" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#4C8BBD"/><stop offset="1" stop-color="#A3CFE6"/></linearGradient>
</defs>
<circle class="glow" cx="120" cy="120" r="110" fill="url(#g)"/>
<circle cx="120" cy="120" r="64" fill="{NAVY}"/>
<circle class="ring" cx="120" cy="120" r="78" fill="none" stroke="url(#r)" stroke-width="6" stroke-linecap="round" stroke-dasharray="150 340"/>
<g transform="translate({120 - W * 0.22:.1f} {120 - H * 0.22:.1f}) scale(.44) translate({-X0:.1f} {-Y0:.1f})"><path fill="#FFFFFF" fill-rule="evenodd" d="{SYM}"/></g>
</svg>
"""
    write(BRAND / "motion/atena-symbol-entry.svg", entry)
    write(BRAND / "motion/atena-symbol-loading.svg", loading)
    write(BRAND / "motion/atena-thinking.svg", thinking)


def patterns() -> None:
    lines = "".join(f'<path d="M{i * 20} 0V160M0 {i * 20}H160"/>' for i in range(1, 8))
    grid = f"""<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
<g fill="none" stroke="#6FADD3" stroke-width="1"><g opacity=".12">{lines}</g><path opacity=".26" d="M0 0V160M0 0H160"/><path opacity=".26" d="M80 0V160M0 80H160"/></g>
</svg>
"""
    stripes = """<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<g fill="#6FADD3"><path opacity=".10" d="M-8 96 56 -8H72L8 96Z"/><path opacity=".05" d="M40 104 104 0V16L56 104Z"/></g>
</svg>
"""
    write(BRAND / "patterns/blueprint-grid.svg", grid)
    write(BRAND / "patterns/ia-stripes.svg", stripes)


def illustrations() -> None:
    base = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="{label}">{body}</svg>\n'
    empty = '<path d="M60 40h200v140H60z" stroke="#2F6AA3" stroke-width="2.5"/><path d="M60 64h200" stroke="#4C8BBD" stroke-width="2"/><path d="M96 100h128M96 124h88M96 148h108" stroke="#A3CFE6" stroke-width="3" stroke-dasharray="2 9"/><circle cx="244" cy="152" r="26" fill="#E6F1F8" stroke="#2F6AA3" stroke-width="2.5"/><path d="M244 140v24M232 152h24" stroke="#2F6AA3" stroke-width="3"/>'
    error = '<path d="M40 176h240" stroke="#4C8BBD" stroke-width="2"/><path d="M160 52 236 168H84z" stroke="#E0A526" stroke-width="3" fill="#FBF1D9"/><path d="M160 96v34" stroke="#8A5F00" stroke-width="5"/><circle cx="160" cy="148" r="3.5" fill="#8A5F00" stroke="none"/><path d="M60 176v-26M80 176v-14M240 176v-18M262 176v-30" stroke="#A3CFE6" stroke-width="3"/>'
    steps = '<path d="M50 180h60v-30h60v-30h60v-30h40" stroke="#2F6AA3" stroke-width="3"/><path d="M50 180h220" stroke="#A3CFE6" stroke-width="2"/><path d="M272 60V36" stroke="#154470" stroke-width="3"/><path d="M272 36l28 10-28 10z" fill="#4C8BBD" stroke="#154470" stroke-width="2"/><circle cx="140" cy="118" r="7" fill="#6FADD3" stroke="#2F6AA3" stroke-width="2"/>'
    for name, label, body in (("empty", "Nada por aqui ainda", empty), ("error", "Algo não saiu como o esperado", error), ("first-steps", "Primeiros passos", steps)):
        write(BRAND / f"illustrations/{name}.svg", base.format(label=label, body=body))


def documents_and_marketing() -> dict:
    sym_w, _ = place("symbol", "navy", 0, 0)
    horiz = lambda color, x, y, k: _lockup_group(color, x, y, k)  # noqa: E731
    letterhead = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842" width="595" height="842">
<rect width="595" height="842" fill="#FFFFFF"/>{horiz("navy", 48, 40, 0.085)}
<path d="M48 104H547" stroke="#DCE5EE"/>
<path d="M48 790H547" stroke="#DCE5EE"/><text x="48" y="808" font-family="Inter, system-ui, sans-serif" font-size="8" fill="#55708C">Endereço da empresa · CNPJ · telefone · e-mail</text>
<rect x="48" y="128" width="499" height="632" fill="none" stroke="#A3CFE6" stroke-dasharray="3 5"/>
</svg>
"""
    cover = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842" width="595" height="842">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#04233F"/><stop offset="1" stop-color="#2F6AA3"/></linearGradient></defs>
<rect width="595" height="842" fill="url(#g)"/>{horiz("white", 60, 70, 0.11)}
<path d="M60 560H535" stroke="#A3CFE6" opacity=".6"/>
<text x="60" y="610" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="600" fill="#FFFFFF">Título do documento</text>
<text x="60" y="640" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#A3CFE6">Obra · contratante · data de emissão</text>
</svg>
"""
    stamp = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 150" width="370" height="150" font-family="Inter, system-ui, sans-serif" font-size="8" fill="#04233F">
<rect x="1" y="1" width="368" height="148" fill="#FFFFFF" stroke="#04233F" stroke-width="1.5"/>
<path d="M1 50H369M1 100H369M185 50V150" stroke="#04233F"/><text x="8" y="14" fill="#55708C">EMPRESA</text><text x="8" y="64" fill="#55708C">OBRA</text><text x="193" y="64" fill="#55708C">DISCIPLINA</text><text x="8" y="114" fill="#55708C">TÍTULO DA PRANCHA</text><text x="193" y="114" fill="#55708C">Nº · REV. · ESCALA · DATA</text>
</svg>
"""
    signature = """<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><title>Assinatura de e-mail — Atena IA</title>
<table cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#04233F">
<tr><td style="padding-right:14px;border-right:2px solid #2F6AA3"><img src="atena-symbol-navy.png" width="48" alt="Atena IA"></td>
<td style="padding-left:14px"><strong>Nome do colaborador</strong><br>Cargo · Empresa<br><span style="color:#55708C">(00) 00000-0000 · contato@empresa.example</span></td></tr></table>
</html>
"""
    og = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#04233F"/><stop offset="1" stop-color="#2F6AA3"/></linearGradient><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M0 0H80V80" fill="none" stroke="#6FADD3" stroke-opacity=".14"/></pattern></defs>
<rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#p)"/>{horiz("white", 90, 90, 0.52)}
<text x="90" y="430" font-family="Inter, system-ui, sans-serif" font-size="54" font-weight="650" fill="#FFFFFF" letter-spacing="-1">Todas as obras sob controle,</text>
<text x="90" y="496" font-family="Inter, system-ui, sans-serif" font-size="54" font-weight="650" fill="#A3CFE6" letter-spacing="-1">num só lugar.</text>
</svg>
"""
    banner = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500" width="1500" height="500">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#04233F"/><stop offset="1" stop-color="#2F6AA3"/></linearGradient></defs>
<rect width="1500" height="500" fill="url(#g)"/>{horiz("white", 120, 160, 0.62)}
</svg>
"""
    write(BRAND / "documents/letterhead.svg", letterhead)
    write(BRAND / "documents/cover.svg", cover)
    write(BRAND / "documents/plate-stamp.svg", stamp)
    write(BRAND / "documents/email-signature.html", signature)
    write(BRAND / "marketing/og-image.svg", og)
    write(BRAND / "marketing/banner.svg", banner)
    for folder in ("marketing/social-covers", "marketing/outdoor"):
        write(BRAND / f"{folder}/README.md", "Preparado na Fase 0 apenas como estrutura; o conteúdo final vem com a página de vendas.\n")
    return {"svg": "brand/marketing/og-image.svg", "out": "brand/marketing/og-image.png", "width": 1200}, {"svg": "brand/marketing/banner.svg", "out": "brand/marketing/banner.png", "width": 1500}


def _lockup_group(color: str, x: float, y: float, k: float) -> str:
    sym, sb = place("symbol", color, 0, 0)
    sw = sb[2] - sb[0]
    word, _ = place("wordmark", color, sw + 23, (sb[3] - (BBOX["wordmark"][3] - BBOX["wordmark"][1])) / 2 + 4)
    return f'<g transform="translate({x} {y}) scale({k})">{sym}{word}</g>'


def main() -> None:
    motion()
    patterns()
    illustrations()
    extra = list(documents_and_marketing())
    (BRAND / "source/render-extra.json").write_text(json.dumps(extra, indent=1), encoding="utf-8")
    _ = ROOT
    print("Movimento, padrões, ilustrações, moldes e marketing gerados.")


if __name__ == "__main__":
    main()
