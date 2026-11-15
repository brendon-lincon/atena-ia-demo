"""Composições, orçamentos, medições e regularização."""

from .common import add, by_id, d, rng, rows, uid
from .works import OBRAS

# ---------- Composições de custo unitário (próprias; valores ilustrativos) ----------
# chave: (código, descrição, unidade, [(tipo, insumo, unidade, coeficiente, preço em reais)])
COMPOSITIONS = {
    "loc": ("CGA-0101", "Locação de obra com topografia", "m²", [("labor", "Topógrafo", "h", 0.03, 62.0), ("labor", "Auxiliar de topografia", "h", 0.06, 24.0), ("material", "Piquetes e estacas de madeira", "un", 0.2, 2.8)]),
    "esc": ("CGA-0102", "Escavação mecanizada de vala em solo de 1ª categoria", "m³", [("equipment", "Retroescavadeira", "h", 0.06, 165.0), ("labor", "Servente", "h", 0.12, 19.5)]),
    "lastro": ("CGA-0103", "Lastro de concreto magro e = 5 cm", "m²", [("material", "Concreto magro fck 15 MPa", "m³", 0.055, 395.0), ("labor", "Pedreiro", "h", 0.18, 26.0), ("labor", "Servente", "h", 0.18, 19.5)]),
    "forma": ("CGA-0104", "Fôrma de madeira compensada resinada, 5 usos", "m²", [("material", "Compensado resinado 17 mm", "m²", 0.22, 78.0), ("labor", "Carpinteiro", "h", 0.7, 28.0), ("labor", "Servente", "h", 0.35, 19.5)]),
    "aco": ("CGA-0105", "Armação em aço CA-50, corte, dobra e montagem", "kg", [("material", "Aço CA-50 diâmetros variados", "kg", 1.08, 7.9), ("labor", "Armador", "h", 0.075, 27.5), ("labor", "Servente", "h", 0.075, 19.5)]),
    "conc30": ("CGA-0106", "Concreto fck 30 MPa, lançamento e adensamento", "m³", [("material", "Concreto usinado fck 30 MPa", "m³", 1.05, 468.0), ("equipment", "Bomba de concreto", "h", 0.12, 280.0), ("labor", "Servente", "h", 1.6, 19.5)]),
    "alv": ("CGA-0107", "Alvenaria de bloco de concreto 14 cm", "m²", [("material", "Bloco de concreto 14x19x39", "un", 12.5, 4.35), ("material", "Argamassa de assentamento", "m³", 0.012, 520.0), ("labor", "Pedreiro", "h", 0.62, 26.0), ("labor", "Servente", "h", 0.45, 19.5)]),
    "reboco": ("CGA-0108", "Chapisco, emboço e reboco", "m²", [("material", "Argamassa industrializada", "kg", 38.0, 0.62), ("labor", "Pedreiro", "h", 0.55, 26.0), ("labor", "Servente", "h", 0.3, 19.5)]),
    "laje": ("CGA-0109", "Laje pré-moldada treliçada com capa", "m²", [("material", "Painel treliçado e lajota", "m²", 1.0, 62.0), ("material", "Concreto fck 25 MPa da capa", "m³", 0.07, 455.0), ("labor", "Pedreiro", "h", 0.5, 26.0)]),
    "cobert": ("CGA-0110", "Cobertura em telha metálica trapezoidal com estrutura", "m²", [("material", "Telha trapezoidal e = 0,5 mm", "m²", 1.12, 58.0), ("material", "Estrutura metálica de apoio", "kg", 9.5, 14.8), ("labor", "Montador", "h", 0.55, 32.0)]),
    "imper": ("CGA-0111", "Impermeabilização com manta asfáltica 4 mm", "m²", [("material", "Manta asfáltica 4 mm", "m²", 1.15, 49.0), ("labor", "Impermeabilizador", "h", 0.4, 28.0)]),
    "piso": ("CGA-0112", "Piso de concreto armado e = 12 cm, acabamento polido", "m²", [("material", "Concreto fck 30 MPa", "m³", 0.126, 468.0), ("material", "Tela soldada Q-138", "m²", 1.1, 14.5), ("labor", "Pedreiro", "h", 0.42, 26.0), ("equipment", "Acabadora de piso", "h", 0.08, 55.0)]),
    "pintura": ("CGA-0113", "Pintura epóxi em duas demãos", "m²", [("material", "Tinta epóxi bicomponente", "L", 0.28, 74.0), ("labor", "Pintor", "h", 0.35, 25.0)]),
    "porta": ("CGA-0114", "Porta metálica de abrir com ferragens", "un", [("material", "Porta metálica 0,90 x 2,10", "un", 1.0, 980.0), ("labor", "Serralheiro", "h", 2.0, 30.0)]),
    "ponto": ("CGA-0115", "Ponto elétrico de iluminação ou tomada", "un", [("material", "Eletroduto, fiação e caixa", "vb", 1.0, 118.0), ("labor", "Eletricista", "h", 2.2, 29.0)]),
    "qdc": ("CGA-0116", "Quadro de distribuição de circuitos", "un", [("material", "Quadro 24 disjuntores com barramento", "un", 1.0, 2650.0), ("labor", "Eletricista", "h", 6.0, 29.0)]),
    "hidr": ("CGA-0117", "Ponto hidráulico com tubulação", "un", [("material", "Tubos e conexões", "vb", 1.0, 96.0), ("labor", "Encanador", "h", 2.0, 27.0)]),
    "aterr": ("CGA-0118", "Malha de aterramento com hastes", "un", [("material", "Hastes, cabo de cobre e conectores", "vb", 1.0, 1450.0), ("labor", "Eletricista", "h", 12.0, 29.0)]),
    "junta": ("CGA-0119", "Junta de dilatação com selante", "m", [("material", "Selante e fundo de junta", "m", 1.0, 11.5), ("labor", "Pedreiro", "h", 0.18, 26.0)]),
    "demol": ("CGA-0120", "Demolição mecanizada de piso e remoção de entulho", "m²", [("equipment", "Rompedor hidráulico", "h", 0.09, 190.0), ("labor", "Servente", "h", 0.3, 19.5), ("equipment", "Caminhão basculante", "h", 0.05, 210.0)]),
    "refor": ("CGA-0121", "Reforço de pilar com encamisamento em concreto", "m", [("material", "Concreto autoadensável", "m³", 0.08, 640.0), ("material", "Aço CA-50", "kg", 18.0, 7.9), ("labor", "Armador", "h", 1.4, 27.5), ("labor", "Carpinteiro", "h", 1.2, 28.0)]),
}  # fmt: skip

# Casa de gerador: (grupo, descrição, unidade, quantidade, composição, confiança, página no projeto, valor-base)
GENERATOR_ITEMS = [
    ("Serviços preliminares", "Locação da obra", "m²", 96, "loc", 0.99, 2),
    ("Serviços preliminares", "Escavação de valas e blocos", "m³", 38, "esc", 0.96, 3),
    ("Serviços preliminares", "Lastro de concreto magro", "m²", 52, "lastro", 0.95, 3),
    ("Fundação", "Fôrmas de blocos e baldrame", "m²", 94, "forma", 0.88, 4),
    ("Fundação", "Armação de blocos e baldrame (CA-50)", "kg", 2850, "aco", 0.62, 4),
    ("Fundação", "Concreto fck 30 MPa de blocos e baldrame", "m³", 21.5, "conc30", 0.9, 4),
    ("Fundação", "Impermeabilização do baldrame", "m²", 38, "imper", 0.84, 4),
    ("Estrutura", "Fôrmas de pilares e vigas", "m²", 168, "forma", 0.86, 5),
    ("Estrutura", "Armação de pilares e vigas (CA-50)", "kg", 4120, "aco", 0.58, 5),
    ("Estrutura", "Concreto fck 30 MPa de pilares e vigas", "m³", 18.4, "conc30", 0.91, 5),
    ("Estrutura", "Base do gerador em concreto armado", "m³", 6.2, "conc30", 0.97, 5),
    ("Estrutura", "Armação da base do gerador", "kg", 780, "aco", 0.72, 5),
    ("Vedações", "Alvenaria de bloco de concreto 14 cm", "m²", 210, "alv", 0.93, 6),
    ("Vedações", "Chapisco, emboço e reboco interno", "m²", 380, "reboco", 0.9, 6),
    ("Vedações", "Chapisco, emboço e reboco externo", "m²", 215, "reboco", 0.9, 6),
    ("Vedações", "Portas metálicas de acesso", "un", 3, "porta", 0.98, 7),
    ("Vedações", "Venezianas metálicas de ventilação", "m²", 18, "cobert", 0.41, 7),
    ("Cobertura", "Laje pré-moldada treliçada", "m²", 96, "laje", 0.89, 8),
    ("Cobertura", "Impermeabilização da laje", "m²", 104, "imper", 0.83, 8),
    ("Cobertura", "Cobertura em telha metálica com estrutura", "m²", 112, "cobert", 0.87, 8),
    ("Cobertura", "Calhas e rufos", "m", 44, "junta", 0.55, 8),
    ("Piso", "Piso de concreto armado polido", "m²", 88, "piso", 0.94, 9),
    ("Piso", "Contrapiso e regularização", "m²", 88, "lastro", 0.8, 9),
    ("Instalações elétricas", "Quadro de distribuição de circuitos", "un", 2, "qdc", 0.97, 10),
    ("Instalações elétricas", "Pontos de iluminação", "un", 14, "ponto", 0.92, 10),
    ("Instalações elétricas", "Pontos de tomada", "un", 10, "ponto", 0.9, 10),
    ("Instalações elétricas", "Eletrodutos e canaletas para cabos de potência", "m", 120, "junta", 0.47, 10),
    ("Instalações elétricas", "Aterramento do gerador e da edificação", "un", 1, "aterr", 0.38, 10),
    ("Instalações hidráulicas", "Pontos de água e drenagem de piso", "un", 6, "hidr", 0.85, 11),
    ("Instalações hidráulicas", "Caixa separadora de óleo", "un", 1, "hidr", 0.66, 11),
    ("Instalações hidráulicas", "Tubulação de combustível do tanque diário", "m", 36, "hidr", 0.52, 11),
    ("Acabamentos", "Pintura epóxi de piso", "m²", 88, "pintura", 0.93, 12),
    ("Acabamentos", "Pintura acrílica interna e externa", "m²", 595, "pintura", 0.91, 12),
    ("Acabamentos", "Sinalização de segurança", "vb", 1, "pintura", 0.7, 12),
    ("Acabamentos", "Limpeza final de obra", "m²", 96, "loc", 0.99, 12),
    ("Complementares", "Passeio e calçada de proteção", "m²", 42, "lastro", 0.77, 13),
    ("Complementares", "Bloco de ancoragem de tubulação", "un", 4, "lastro", 0.44, 13),
    ("Complementares", "Placas de identificação e extintores", "vb", 1, "pintura", 0.6, 13),
]  # fmt: skip
CROSS_CHECK = [
    ("Junta de dilatação e selante do piso", "junta", "Piso de 88 m² sem juntas de retração previstas. Item omitido no levantamento.", 88, "m"),
    ("Aterramento da malha do gerador (inspeção e medição de resistência)", "aterr", "O quantitativo cobre o aterramento, mas não a medição e o laudo de resistência exigidos pela NBR 5419.", 1, "un"),
]  # fmt: skip

CUIABA_ITEMS = [
    ("Demolições", "Demolição de piso e remoção de entulho", "m²", 2200, "demol"),
    ("Recuperação estrutural", "Reforço de pilares com encamisamento", "m", 940, "refor"),
    ("Recuperação estrutural", "Armação complementar (CA-50)", "kg", 21400, "aco"),
    ("Recuperação estrutural", "Concreto fck 30 MPa", "m³", 168, "conc30"),
    ("Recuperação estrutural", "Fôrmas para reforço", "m²", 1320, "forma"),
    ("Recuperação estrutural", "Tratamento de fissuras e juntas", "m", 1800, "junta"),
    ("Piso industrial", "Preparo de base e sub-base", "m²", 6400, "lastro"),
    ("Piso industrial", "Piso de concreto armado polido", "m²", 6400, "piso"),
    ("Piso industrial", "Juntas serradas e seladas", "m", 3900, "junta"),
    ("Cobertura", "Telhas metálicas, calhas e rufos", "m²", 5200, "cobert"),
    ("Cobertura", "Impermeabilização de marquises", "m²", 640, "imper"),
    ("Instalações elétricas", "Pontos de iluminação industrial", "un", 220, "ponto"),
    ("Instalações elétricas", "Quadros de distribuição", "un", 9, "qdc"),
    ("Instalações elétricas", "Aterramento e SPDA", "un", 6, "aterr"),
    ("Instalações hidráulicas", "Pontos hidráulicos e drenagem", "un", 64, "hidr"),
    ("Combate a incêndio", "Hidrantes e abrigos", "un", 14, "hidr"),
    ("Pintura", "Pintura epóxi de piso e demarcações", "m²", 7800, "pintura"),
    ("Pintura", "Pintura acrílica de estruturas", "m²", 4200, "pintura"),
    ("Acabamentos", "Portas metálicas", "un", 18, "porta"),
    ("Acabamentos", "Alvenaria de vedação", "m²", 960, "alv"),
    ("Acabamentos", "Reboco e emboço", "m²", 1920, "reboco"),
    ("Urbanização", "Calçadas e sinalização", "m²", 2100, "lastro"),
]  # fmt: skip
INDIRECTS = [("Administração local", 0.045), ("Canteiro e instalações provisórias", 0.012), ("Mobilização e desmobilização", 0.011),
             ("EPI e exames ocupacionais", 0.008), ("Seguros e garantias", 0.006)]  # fmt: skip


def compositions() -> None:
    for key, (code, name, unit, inputs) in COMPOSITIONS.items():
        parts = [{"kind": k, "description": desc, "unit": u, "coefficient": coef, "unitCostCents": round(price * 100)} for k, desc, u, coef, price in inputs]
        cost = round(sum(p["coefficient"] * p["unitCostCents"] for p in parts))
        add("compositions", f"comp:{key}", code=code, description=name, unit=unit, inputs=parts, unitCostCents=cost,
            source="Própria da empresa", baseDate="2026-10", state="MS")  # fmt: skip


def _build_budget(okey: str, key: str, name: str, status: str, level: str, items: list, total_cents: int,
                  bdi: float, indirect_rate: float, low_confidence: bool, eap_code: str | None) -> None:
    direct_target = round(total_cents / ((1 + indirect_rate) * (1 + bdi / 100)))
    raw = []
    for it in items:
        comp = by_id("compositions", uid(f"comp:{it[4]}"))
        raw.append(round(comp["unitCostCents"] * it[3]))
    scale = direct_target / sum(raw)
    budget_id = uid(f"budget:{key}")
    oid = uid(f"obra:{okey}")
    eap = next((r["id"] for r in rows("eap-items") if r["obraId"] == oid and r["code"] == eap_code), None) if eap_code else None
    totals = [round(v * scale) for v in raw]
    totals[totals.index(max(totals))] += direct_target - sum(totals)
    for i, (it, total) in enumerate(zip(items, totals, strict=True), start=1):
        group, desc, unit, qty, comp_key = it[:5]
        confidence = it[5] if low_confidence else round(rng.uniform(0.93, 1.0), 2)
        add("budget-items", f"{key}:item:{i}", budgetId=budget_id, code=f"{1 + sorted({x[0] for x in items}).index(group)}.{i}", group=group,
            description=desc, unit=unit, quantity=qty, unitCostCents=round(total / qty), totalCents=total,
            compositionId=uid(f"comp:{comp_key}"), eapItemId=eap, confidence=confidence,
            source={"fileName": "GER-PE-001-rev02.pdf" if low_confidence else "PROJ-CUI-GERAL.pdf", "page": it[6] if low_confidence else 1 + i % 9},
            priceSource="Composição própria + base SINAPI de referência (10/2026)", priceBaseDate="2026-10",
            reviewStatus="pending" if low_confidence and confidence < 0.7 else "ok")  # fmt: skip
    indirect_total = round(direct_target * indirect_rate)
    base = [round(indirect_total * r / sum(x[1] for x in INDIRECTS)) for _, r in INDIRECTS]
    base[0] += indirect_total - sum(base)
    bdi_cents = total_cents - direct_target - indirect_total
    cross = []
    if low_confidence:
        cross = [{"title": t, "message": m, "suggestedQuantity": q, "unit": u, "compositionId": uid(f"comp:{c}")} for t, c, m, q, u in CROSS_CHECK]
    add("budgets", f"budget:{key}", obraId=oid, eapItemId=eap, name=name, level=level, status=status, version=2 if low_confidence else 3,
        baseDate="2026-10", baseRef="Composições próprias + SINAPI (referência), data-base 10/2026, MS", bdiPct=bdi, socialChargesPct=113.9,
        directCostCents=direct_target, indirectCostCents=indirect_total,
        indirects=[{"label": label, "cents": cents} for (label, _), cents in zip(INDIRECTS, base, strict=True)],
        bdiCents=bdi_cents, totalCents=total_cents, crossCheck=cross, sourceFileName="GER-PE-001-rev02.pdf" if low_confidence else "PROJ-CUI-GERAL.pdf",
        createdBy=uid("user:engineer"), approvedAt=None if status != "approved" else d(-80))  # fmt: skip


def budgets() -> None:
    generator_total = next(r for r in rows("eap-items") if r["obraId"] == uid("obra:candeias") and r["code"] == "5")["contractedCents"]
    _build_budget("candeias", "gerador", "Casa de Gerador — Candeias (orçamento analítico)", "in_review", "analytic",
                  GENERATOR_ITEMS, generator_total, 24.5, 0.06, True, "5")  # fmt: skip
    _build_budget("cuiaba", "cuiaba", "Reforma da Base Cuiabá (orçamento analítico)", "approved", "analytic", CUIABA_ITEMS,
                  OBRAS["cuiaba"]["value"] * 100, 24.5, 0.082, False, None)  # fmt: skip


# ---------- Medições ----------
PERIODS = {
    "cuiaba": [(-74, -50, "issued"), (-49, -33, "issued"), (-32, -13, "issued"), (-12, -1, "approved")],
    "candeias": [(-103, -73, "issued"), (-72, -43, "issued"), (-42, -13, "issued")],
    "vertice": [(-60, -31, "issued"), (-30, -1, "in_review")],
}


def _off(token: str) -> int:
    return int(token[2:])


def _done_at(leaf: dict, act: dict, day: int) -> float:
    """Quantidade acumulada executada até `day` (avanço linear entre início real e hoje)."""
    start = _off(act["startDate"])
    total = leaf["quantity"] * leaf["progressPct"] / 100
    if day <= start:
        return 0.0
    return total * min((day - start) / max(0 - start, 1), 1)


def measurements() -> None:
    for okey, periods in PERIODS.items():
        oid = uid(f"obra:{okey}")
        leaves = [r for r in rows("eap-items") if r["obraId"] == oid and r["level"] == "leaf" and r["progressPct"] > 0]
        acts = {a["eapItemId"]: a for a in rows("schedule-activities") if a["obraId"] == oid and a["eapItemId"]}
        accumulated_cents = 0
        previous = {leaf["id"]: 0.0 for leaf in leaves}
        for number, (start, end, status) in enumerate(periods, start=1):
            items, amount = [], 0
            for leaf in leaves:
                done = round(_done_at(leaf, acts[leaf["id"]], end), 2)
                period_qty = round(done - previous[leaf["id"]], 2)
                if period_qty <= 0.005:
                    continue
                cents = round(period_qty * leaf["unitPriceCents"])
                amount += cents
                photos = [p["id"] for p in rows("photos") if p["eapItemId"] == leaf["id"]][:2]
                diaries = [e["id"] for e in rows("diary-entries") if any(s["eapItemId"] == leaf["id"] for s in e["services"])][:3]
                items.append((leaf, previous[leaf["id"]], period_qty, done, cents, photos, diaries))
                previous[leaf["id"]] = done
            accumulated_cents += amount
            mid = f"measurement:{okey}:{number}"
            retention = round(amount * 0.05)
            add("measurements", mid, obraId=oid, number=number, periodStart=d(start), periodEnd=d(end), status=status,
                amountCents=amount, accumulatedCents=accumulated_cents, retentionPct=5.0, retentionCents=retention,
                netCents=amount - retention, contractId=uid(f"contract:{okey}"), approvedAt=d(end + 3) if status in ("issued", "approved") else None,
                issuedAt=d(end + 6) if status == "issued" else None, notes="")  # fmt: skip
            for leaf, prev, qty, done, cents, photos, diaries in items:
                add("measurement-items", f"{mid}:{leaf['code']}", measurementId=uid(mid), obraId=oid, eapItemId=leaf["id"],
                    description=leaf["name"], unit=leaf["unit"], contractedQty=leaf["quantity"], previousQty=round(prev, 2),
                    periodQty=qty, accumulatedQty=done, balanceQty=round(leaf["quantity"] - done, 2), unitPriceCents=leaf["unitPriceCents"],
                    periodCents=cents, photoIds=photos, diaryEntryIds=diaries,
                    calcMemory=f"Executado até {abs(end)} dia(s) atrás: {done} {leaf['unit']}; anterior: {round(prev, 2)} {leaf['unit']}.")  # fmt: skip


# ---------- Regularização ----------
STEPS = {"cno": 1, "art": 2, "alvara": 3, "env_lp": 4, "env_li": 5, "env_lo": 6, "fire": 7, "other": 8}
# (obra, passo, título, órgão, situação, solicitado, emitido, validade, prazo de ação, protocolo, base legal, observação)
COMPLIANCE = [
    ("osasco", "cno", "Inscrição no CNO", "receita", "in_progress", -6, None, None, 88, None, "IN RFB 2.061/2021", "Prazo legal: até 30 dias após o início da obra."),
    ("osasco", "art", "ART de execução da obra", "crea-ms", "submitted", -12, None, None, 20, "ART-OS-2026-0412", "Lei 6.496/1977", ""),
    ("osasco", "alvara", "Alvará de construção", "pref-osasco", "in_progress", -20, None, None, 45, "ALV-2026-18822", "Código de Obras municipal", "Aguardando análise do projeto."),
    ("osasco", "env_lp", "Licença Prévia (LP)", "cetesb", "issued", -170, -150, 580, None, "LP-CETESB-3321", "CONAMA 237/1997; CONAMA 273/2000", ""),
    ("osasco", "env_li", "Licença de Instalação (LI)", "cetesb", "issued", -90, -40, 700, None, "LI-CETESB-8890", "CONAMA 237/1997; CONAMA 273/2000", "7 condicionantes; cronograma de atendimento em acompanhamento."),
    ("osasco", "env_lo", "Licença de Operação (LO)", "cetesb", "not_started", None, None, None, 340, None, "CONAMA 237/1997", "Solicitar após a conclusão da instalação."),
    ("osasco", "fire", "Projeto técnico de segurança contra incêndio", "bombeiros-sp", "in_progress", -15, None, None, 120, None, "Instruções Técnicas do CBPMESP", ""),
    ("osasco", "other", "Comunicação prévia de obra (NR-18) e PGR", "pref-osasco", "in_progress", -4, None, None, 50, None, "NR-18; NR-1", "Documentos de SST em elaboração."),
    ("candeias", "cno", "Inscrição no CNO", "receita", "issued", -112, -108, None, None, "CNO-71-2026-0045", "IN RFB 2.061/2021", ""),
    ("candeias", "art", "ART de execução da obra", "crea-ms", "issued", -115, -114, None, None, "ART-BA-2026-3377", "Lei 6.496/1977", ""),
    ("candeias", "alvara", "Alvará de construção", "pref-candeias", "issued", -150, -120, 600, None, "ALV-2026-0210", "Código de Obras municipal", ""),
    ("candeias", "env_li", "Licença de Instalação (LI)", "inema", "issued", -240, -190, 420, None, "LI-INEMA-5512", "CONAMA 237/1997; CONAMA 273/2000", "Condicionantes em atendimento; relatório semestral."),
    ("candeias", "env_lo", "Licença de Operação (LO)", "inema", "in_progress", -10, None, None, 150, None, "CONAMA 237/1997", "Pedido em preparação para a conclusão da obra."),
    ("candeias", "fire", "Projeto aprovado e AVCB", "bombeiros-ba", "in_progress", -60, None, None, 190, None, "Legislação estadual (CBMBA)", "Projeto aprovado; AVCB após a conclusão."),
    ("candeias", "other", "Autorização da ANP para instalação de armazenamento", "anp", "in_progress", -30, None, None, 100, None, "Resoluções ANP", ""),
    ("cuiaba", "cno", "Inscrição no CNO", "receita", "issued", -80, -76, None, None, "CNO-51-2026-0112", "IN RFB 2.061/2021", ""),
    ("cuiaba", "art", "ART de execução da reforma", "crea-ms", "issued", -82, -81, None, None, "ART-MT-2026-1988", "Lei 6.496/1977", ""),
    ("cuiaba", "alvara", "Alvará de reforma", "sema-mt", "issued", -95, -85, 400, None, "ALV-REF-2026-77", "NBR 16280", ""),
    ("cuiaba", "env_lo", "Renovação da LO — condicionante de monitoramento", "sema-mt", "issued", -200, -180, 240, 20, "LO-SEMA-4410", "CONAMA 237/1997", "Condicionante: relatório de monitoramento de águas subterrâneas vence em 20 dias."),
    ("cuiaba", "fire", "CLCB renovado", "bombeiros-mt", "issued", -150, -140, 210, None, "CLCB-2026-9921", "Legislação estadual (CBMMT)", ""),
    ("paulinia", "cno", "Baixa do CNO e certidão negativa de débitos da obra", "receita", "issued", -190, -170, None, None, "CND-OBRA-2026-77", "IN RFB 2.021/2021", ""),
    ("paulinia", "alvara", "Habite-se / termo de recebimento definitivo", "pref-osasco", "in_progress", -150, None, None, 30, None, "Código de Obras municipal", "Pendente de as built aprovado."),
    ("paulinia", "other", "Certidão de regularidade fiscal da obra", "receita", "issued", -175, -165, None, None, "CRF-2026-31", "", ""),
    ("vertice", "art", "ART de execução do subcontrato", "crea-ms", "issued", -65, -64, None, None, "ART-BA-2026-3011", "Lei 6.496/1977", ""),
    ("vertice", "other", "Comunicação prévia de obra (NR-18)", "pref-candeias", "issued", -62, -60, None, None, "CP-2026-114", "NR-18", ""),
]  # fmt: skip


def compliance() -> None:
    for i, (okey, step, title, agency, status, requested, issued, valid, due, protocol, law, notes) in enumerate(COMPLIANCE, start=1):
        add("compliance-items", f"compliance:{i}", obraId=uid(f"obra:{okey}"), step=step, stepOrder=STEPS[step], title=title,
            agencyId=uid(f"contact:{agency}"), status=status, protocol=protocol, requestedAt=d(requested) if requested is not None else None,
            issuedAt=d(issued) if issued is not None else None, validUntil=d(valid) if valid is not None else None,
            dueDate=d(due) if due is not None else None, responsibleId=uid("user:engineer"), regulation=law, notes=notes,
            evidenceFileId=None)  # fmt: skip


def build() -> None:
    compositions()
    budgets()
    measurements()
    compliance()
