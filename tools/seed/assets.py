"""Arquivos de apoio da demonstração: marcadores de foto (SVG), PDFs simples e prévia de DXF.

Fotos reais podem substituir os marcadores usando o mesmo nome de arquivo.
"""

import textwrap
from html import escape
from pathlib import Path

from .common import by_id, rows, uid

PUBLIC = Path(__file__).resolve().parents[2] / "apps/web/public/demo"
GRADIENTS = [("#04233F", "#2F6AA3"), ("#154470", "#4C8BBD"), ("#2F6AA3", "#A3CFE6"), ("#04233F", "#154470"), ("#154470", "#6FADD3")]
ICON = {
    "tank": '<ellipse cx="400" cy="220" rx="140" ry="36"/><rect x="260" y="220" width="280" height="150"/><ellipse cx="400" cy="370" rx="140" ry="36"/>',
    "wall": "".join(f'<rect x="{250 + (c * 70) + (r % 2) * 35}" y="{190 + r * 46}" width="64" height="40" rx="3"/>' for r in range(4) for c in range(4)),
    "truck": '<rect x="230" y="250" width="260" height="110"/><rect x="498" y="290" width="100" height="70"/><circle cx="300" cy="372" r="30"/><circle cx="530" cy="372" r="30"/>',
    "rebar": "".join(f'<rect x="{250 + i * 40}" y="190" width="8" height="190"/>' for i in range(8)) + "".join(f'<rect x="250" y="{205 + i * 40}" width="300" height="8"/>' for i in range(5)),
    "building": '<rect x="270" y="190" width="260" height="190"/>' + "".join(f'<rect x="{300 + c * 70}" y="{215 + r * 55}" width="40" height="34" fill="#04233F" fill-opacity=".45"/>' for r in range(3) for c in range(3)),
    "crane": '<rect x="396" y="180" width="14" height="210"/><rect x="250" y="180" width="330" height="12"/><rect x="480" y="192" width="4" height="90"/><rect x="465" y="282" width="34" height="26"/>',
}


def photos() -> None:
    folder = PUBLIC / "photos"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.svg"):
        old.unlink()
    for photo in rows("photos"):
        a, b = GRADIENTS[photo["hue"]]
        obra = by_id("obras", photo["obraId"])
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="{escape(photo['caption'])}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<g fill="#FFFFFF" fill-opacity=".85">{ICON[photo['icon']]}</g>
<rect y="500" width="800" height="100" fill="#04233F" fill-opacity=".6"/>
<text x="32" y="545" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="600">{escape(photo['caption'][:52])}</text>
<text x="32" y="580" fill="#A3CFE6" font-family="Inter, system-ui, sans-serif" font-size="20">{escape(obra['name'][:56])}</text>
</svg>
"""
        (folder / photo["file"]).write_text(svg, encoding="utf-8")


def _pdf(pages: list[list[str]]) -> bytes:
    """PDF mínimo (A4, Helvetica) apenas com texto e uma moldura, suficiente para a prévia."""
    objects: list[bytes] = []

    def add(body: str | bytes) -> int:
        objects.append(body if isinstance(body, bytes) else body.encode("latin-1"))
        return len(objects)

    add("<< /Type /Catalog /Pages 2 0 R >>")
    add("")  # lista de páginas, preenchida ao final
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    kids = []
    for lines in pages:
        stream = ["0.2 0.35 0.55 RG 36 36 523 770 re S", "BT"]
        y = 780
        for i, line in enumerate(lines):
            font, size = ("/F2 15", 15) if i == 0 else ("/F1 10", 10)
            safe = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            stream.append(f"{font} Tf 1 0 0 1 52 {y} Tm ({safe}) Tj")
            y -= 26 if i == 0 else 15
        stream.append("ET")
        data = "\n".join(stream).encode("cp1252", errors="replace")
        content = add(b"<< /Length %d >>\nstream\n" % len(data) + data + b"\nendstream")
        kids.append(add(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content} 0 R >>"))
    objects[1] = f"<< /Type /Pages /Count {len(kids)} /Kids [{' '.join(f'{k} 0 R' for k in kids)}] >>".encode()
    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
    for offset in offsets:
        out += f"{offset:010d} 00000 n \n".encode()
    out += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return bytes(out)


def _wrap(text: str, width: int = 92) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        lines += textwrap.wrap(paragraph, width) or [""]
    return lines


def _money(cents: int) -> str:
    return f"R$ {cents / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def pdfs() -> None:
    folder = PUBLIC / "files"
    folder.mkdir(parents=True, exist_ok=True)
    budget = by_id("budgets", uid("budget:gerador"))
    items = [i for i in rows("budget-items") if i["budgetId"] == budget["id"]]
    pages = [["PROJETO - CASA DE GERADOR - REV. 02", "Folha 1/13 - Implantação e quadro geral", "Obra: Base de Distribuição Candeias (BA)", "Área construída: 96 m² | Pé-direito: 4,20 m", "Estrutura em concreto armado fck 30 MPa; cobertura metálica.", "Equipamento: grupo gerador diesel e tanque diário."]]
    for page in range(2, 14):
        group = [i for i in items if i["source"]["page"] == page]
        lines = [f"Folha {page}/13 - Quantitativos do projeto", ""]
        lines += [f"{i['description']}: {i['quantity']} {i['unit']}" for i in group] or ["Detalhes complementares, notas e legendas."]
        pages.append(lines)
    (folder / "GER-PE-001-rev02.pdf").write_bytes(_pdf(pages))
    (folder / "PROJ-CUI-GERAL.pdf").write_bytes(_pdf([["PROJETO GERAL - REFORMA DA BASE CUIABÁ", "Folha 1/5 - Planta geral", "Recuperação estrutural, piso industrial, cobertura e instalações."]] + [[f"Folha {n}/5 - Detalhes", "Detalhamento de reforço, piso e cobertura."] for n in range(2, 6)]))
    measurement = by_id("measurements", uid("measurement:cuiaba:4"))
    lines = ["BOLETIM DE MEDICAO N 4 - REFORMA DA BASE CUIABÁ", f"Valor do periodo: {_money(measurement['amountCents'])} | Acumulado: {_money(measurement['accumulatedCents'])}", ""]
    lines += [f"{i['description']}: {i['periodQty']} {i['unit']} - {_money(i['periodCents'])}" for i in rows("measurement-items") if i["measurementId"] == measurement["id"]]
    (folder / "boletim-medicao-04.pdf").write_bytes(_pdf([lines]))
    memorial = by_id("documents", uid("doc:1"))
    body = [b["text"] for b in memorial["blocks"]]
    (folder / "memorial-descritivo-cuiaba.pdf").write_bytes(_pdf([["MEMORIAL DESCRITIVO - BASE CUIABÁ"] + sum((_wrap(t) for t in body), [])]))
    (folder / "protocolo-li.pdf").write_bytes(_pdf([["PROTOCOLO - CONDICIONANTES DA LICENÇA DE INSTALAÇÃO", "Recebido o cronograma de atendimento às condicionantes da LI.", "Número do protocolo: LI-CETESB-8890/2026."]]))
    (folder / "relatorio-semanal-14.pdf").write_bytes(_pdf([["RELATÓRIO SEMANAL - BASE CANDEIAS - SEMANA 14", "Avanço físico acumulado e efetivo da semana.", "Frentes: tanques, bacia, hidrantes e casa de gerador."], ["Registro fotográfico", "Fotos selecionadas do diário de obra."]]))


def dxf_preview() -> None:
    folder = PUBLIC / "files"
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-label="Prévia estática do desenho GER-PE-001">
<rect width="800" height="520" fill="#04172B"/>
<g fill="none" stroke="#6FADD3" stroke-width="2"><rect x="120" y="110" width="560" height="300"/><rect x="150" y="140" width="500" height="240" stroke="#A3CFE6"/><line x1="400" y1="140" x2="400" y2="380"/><rect x="180" y="170" width="170" height="110" stroke="#4C8BBD"/><rect x="450" y="170" width="170" height="110" stroke="#4C8BBD"/></g>
<g stroke="#A3CFE6" stroke-width="1"><line x1="120" y1="440" x2="680" y2="440"/><line x1="120" y1="432" x2="120" y2="448"/><line x1="680" y1="432" x2="680" y2="448"/></g>
<g fill="#EAF3FA" font-family="Inter, system-ui, sans-serif" font-size="16"><text x="360" y="436">12,00 m</text><text x="170" y="230">Gerador</text><text x="480" y="230">Quadro geral</text><text x="120" y="80" font-size="20" font-weight="600">GER-PE-001 — Planta baixa (prévia estática)</text></g>
</svg>
"""
    (folder / "ger-pe-001-preview.svg").write_text(svg, encoding="utf-8")


def build() -> None:
    photos()
    pdfs()
    dxf_preview()
