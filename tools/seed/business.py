"""Contratos, propostas, custos, contas a pagar e a receber, suprimentos."""

from .common import add, brl, by_id, d, rng, rows, uid

CLIENT_CONTRACTS = {"candeias": "atlas", "cuiaba": "atlas", "vertice": "vertice", "osasco": "atlas", "paulinia": "atlas"}

# (categoria, descrição, fornecedor, peso)
COSTS = {
    "candeias": [
        ("subcontract", "Terraplenagem geral e compactação — medição final", "terraplan", 14), ("materials", "Aço CA-50 — lote 07", "aco", 9),
        ("materials", "Concreto usinado fck 30 MPa — bases TQ-05 a TQ-07", "concreto", 12), ("materials", "Brita e areia — bases e bacia", "brita", 4),
        ("equipment", "Locação de guindaste e retroescavadeiras — mês", "locamax", 7), ("labor", "Folha e encargos — equipe própria (mês anterior)", None, 11),
        ("labor", "Folha e encargos — equipe própria (mês corrente)", None, 9), ("subcontract", "Hidrotec — adiantamento da rede de hidrantes", "hidrotec", 4),
        ("subcontract", "Eletromaq — sinal do QGBT e CCM", "eletromaq", 5), ("logistics", "Hospedagem e alimentação — equipe de armação", "pousada-candeias", 3),
        ("materials", "Fôrmas e madeiramento", "ferragens", 3), ("materials", "Concreto usinado — bases TQ-08 e TQ-09", "concreto", 8),
        ("materials", "Aço CA-50 — lote 08", "aco", 6), ("safety", "EPI e uniformes", "ferragens", 1), ("indirect", "Canteiro, vigilância e limpeza", None, 2),
        ("equipment", "Combustível de máquinas e geradores", None, 2), ("indirect", "Administração local — engenharia e apoio", None, 3),
        ("materials", "Tubos e conexões — bacia de contenção", "ferragens", 3),
    ],
    "cuiaba": [
        ("materials", "Concreto usinado fck 30 MPa — piso", "concreto", 14), ("materials", "Telhas metálicas, calhas e rufos", "ferragens", 12),
        ("labor", "Folha e encargos — equipe própria", None, 20), ("equipment", "Locação de rompedor e acabadora de piso", "locamax", 7),
        ("logistics", "Hospedagem — equipe em Cuiabá", "hotel-cuiaba", 8), ("logistics", "Alimentação e deslocamentos", None, 4),
        ("materials", "Aço CA-50 para reforço estrutural", "aco", 11), ("subcontract", "Serviços de impermeabilização", None, 8),
        ("safety", "EPI, treinamentos e exames", None, 3), ("indirect", "Administração local e canteiro", None, 13),
    ],
    "vertice": [
        ("materials", "Concreto usinado — bases e pisos", "concreto", 20), ("labor", "Folha e encargos — equipe própria", None, 24),
        ("equipment", "Locação de equipamentos", "locamax", 12), ("materials", "Aço CA-50 e telas", "aco", 14),
        ("logistics", "Hospedagem e alimentação", "pousada-candeias", 8), ("safety", "EPI e exames", None, 4), ("indirect", "Administração local", None, 18),
    ],
    "paulinia": [
        ("materials", "Consolidado de materiais e subempreiteiros da obra", None, 58), ("labor", "Consolidado de mão de obra própria e encargos", None, 30),
        ("indirect", "Consolidado de indiretos, canteiro e administração local", None, 12),
    ],
}  # fmt: skip


def contracts() -> None:
    for okey, client in CLIENT_CONTRACTS.items():
        obra = by_id("obras", uid(f"obra:{okey}"))
        add("contracts", f"contract:{okey}", kind="client", title=f"Contrato de empreitada — {obra['name']}", number=f"CT-{obra['code']}",
            partyId=uid(f"contact:{client}"), obraId=obra["id"], valueCents=obra["contractValueCents"], startDate=obra["startDate"], endDate=obra["endDate"],
            signedAt=d(int(obra["startDate"][2:]) - 20), status="closed" if okey == "paulinia" else "active", readjustmentIndex="INCC-M",
            retentionPct=5.0, warrantyPct=5.0, paymentTerms="Medição mensal; pagamento em 30 dias após a emissão da nota fiscal.",
            insurance="Seguro de riscos de engenharia e responsabilidade civil", notes="")  # fmt: skip
    subs = [("candeias", "terraplan", "Terraplenagem e drenagem", 0.84), ("candeias", "eletromaq", "QGBT e CCM", 0.86), ("candeias", "hidrotec", "Rede de hidrantes e abrigos", 0.85)]
    for okey, party, scope, ratio in subs:
        front = next(r for r in rows("eap-items") if r["obraId"] == uid(f"obra:{okey}") and r["level"] == "front" and r["name"].startswith(scope.split(" e ")[0]))
        add("contracts", f"contract:sub:{party}", kind="subcontract", title=f"Subempreitada — {scope}", number=f"SUB-{party[:3].upper()}-2026", partyId=uid(f"contact:{party}"),
            obraId=uid(f"obra:{okey}"), valueCents=round(front["contractedCents"] * ratio), startDate=d(-100), endDate=d(120), signedAt=d(-112), status="active",
            readjustmentIndex="INCC-M", retentionPct=5.0, warrantyPct=5.0, paymentTerms="Medição mensal; 30 dias.", insurance="Seguro de responsabilidade civil do contratado", notes="")  # fmt: skip
    add("contracts", "contract:lease:locamax", kind="lease", title="Locação de guindaste 60 t e retroescavadeiras", number="LOC-2026-021", partyId=uid("contact:locamax"),
        obraId=uid("obra:candeias"), valueCents=brl(486000), startDate=d(-95), endDate=d(130), signedAt=d(-100), status="active", readjustmentIndex="IPCA",
        retentionPct=0.0, warrantyPct=0.0, paymentTerms="Faturamento mensal; 28 dias.", insurance="", notes="Franquia de horas: 220 h/mês.")  # fmt: skip


def proposals() -> None:
    rows_ = [
        ("won", "Base de Distribuição Candeias", "atlas", 18_400_000, -150, "candeias"), ("won", "Reforma da Base Cuiabá", "atlas", 3_200_000, -110, "cuiaba"),
        ("won", "Serviços civis — Parque de tanques (Vértice)", "vertice", 2_100_000, -90, "vertice"), ("won", "Base de Distribuição Osasco", "atlas", 9_700_000, -60, "osasco"),
        ("negotiation", "Ampliação de tancagem — Base Salvador", "atlas", 14_500_000, -18, None), ("proposal", "Reforma da Base Uberaba", "atlas", 4_100_000, -9, None),
        ("lead", "Pavimentação de pátios — Terminal Itaqui", "vertice", 7_800_000, -3, None), ("lost", "Cobertura de plataformas — Base Betim", "atlas", 3_600_000, -70, None),
    ]  # fmt: skip
    for i, (stage, title, client, value, sent, okey) in enumerate(rows_, start=1):
        add("proposals", f"proposal:{i}", number=f"PRO-2026-{i:03d}", title=title, clientId=uid(f"contact:{client}"), obraId=uid(f"obra:{okey}") if okey else None,
            valueCents=brl(value), stage=stage, sentAt=d(sent), validUntil=d(sent + 45), probabilityPct={"won": 100, "negotiation": 60, "proposal": 35, "lead": 15, "lost": 0}[stage],
            ownerId=uid("user:owner"), technicalProposal=True, commercialProposal=stage != "lead")  # fmt: skip


def costs() -> None:
    n = 0
    for okey, entries in COSTS.items():
        obra = by_id("obras", uid(f"obra:{okey}"))
        total = obra["actualCostToDateCents"]
        weights = [e[3] for e in entries]
        amounts = [round(total * w / sum(weights)) for w in weights]
        amounts[amounts.index(max(amounts))] += total - sum(amounts)
        start = int(obra["startDate"][2:])
        end = min(int(obra["endDate"][2:]), -1)
        for i, ((cat, desc, supplier, _), amount) in enumerate(zip(entries, amounts, strict=True)):
            n += 1
            add("cost-entries", f"cost:{n}", obraId=obra["id"], eapItemId=None, date=d(start + round((end - start) * (i + 1) / (len(entries) + 1))), category=cat,
                description=desc, supplierId=uid(f"contact:{supplier}") if supplier else None, amountCents=amount, documentRef=f"NF {rng.randint(1000, 9999)}" if supplier else "Lançamento interno",
                status="conferred" if i % 3 else "posted", costCenter=obra["code"])  # fmt: skip
    osasco = by_id("obras", uid("obra:osasco"))
    extra = [("indirect", "Taxas de ART e protocolos de licenciamento", None, 18600), ("logistics", "Visita técnica à área — deslocamento e hospedagem", "hotel-cuiaba", 9400)]
    for i, (cat, desc, supplier, value) in enumerate(extra, start=1):
        add("cost-entries", f"cost:osasco:{i}", obraId=osasco["id"], eapItemId=None, date=d(-20 * i), category=cat, description=desc,
            supplierId=uid(f"contact:{supplier}") if supplier else None, amountCents=brl(value), documentRef="Lançamento interno", status="conferred", costCenter=osasco["code"])  # fmt: skip
    osasco["actualCostToDateCents"] = brl(sum(v for *_, v in extra))
    assert len(rows("cost-entries")) == 40, len(rows("cost-entries"))


def receivables() -> None:
    for n, m in enumerate(rows("measurements"), start=1):
        obra = by_id("obras", m["obraId"])
        issued = m["issuedAt"]
        status = "forecast" if m["status"] == "approved" else ("open" if m["status"] == "in_review" else "paid")
        due = d(int(issued[2:]) + 30) if issued else d(25)
        if m["number"] == max(x["number"] for x in rows("measurements") if x["obraId"] == m["obraId"]) and status == "paid":
            status = "open" if int(due[2:]) >= 0 else "overdue"
        add("receivables", f"recv:{n}", obraId=obra["id"], clientId=obra["clientId"], measurementId=m["id"], description=f"Medição nº {m['number']} — {obra['name']}",
            amountCents=m["netCents"], dueDate=due, status=status, paidAt=due if status == "paid" else None, invoiceNumber=f"NF-{2400 + n}" if issued else None)  # fmt: skip
    paulinia = by_id("obras", uid("obra:paulinia"))
    add("receivables", "recv:retention", obraId=paulinia["id"], clientId=paulinia["clientId"], measurementId=None, description="Liberação da retenção contratual — Paulínia",
        amountCents=round(paulinia["contractValueCents"] * 0.05), dueDate=d(20), status="open", paidAt=None, invoiceNumber="NF-2390")  # fmt: skip


def payables() -> None:
    items = [
        ("aco", "candeias", "Aço CA-50 — lote 08", 186400, 4, "open"), ("concreto", "candeias", "Concreto usinado — bases TQ-08 e TQ-09", 312800, 9, "open"),
        ("locamax", "candeias", "Locação de guindaste — mês corrente", 118500, -2, "overdue"), ("terraplan", "candeias", "Terraplenagem — medição final", 468000, 12, "open"),
        ("eletromaq", "candeias", "QGBT e CCM — sinal", 215000, 18, "open"), ("hidrotec", "candeias", "Rede de hidrantes — adiantamento", 142000, 6, "open"),
        ("hotel-cuiaba", "cuiaba", "Hospedagem — equipe, mês anterior", 38200, -8, "paid"), ("ferragens", "cuiaba", "Telhas e rufos — saldo", 96400, 15, "open"),
        ("concreto", "cuiaba", "Concreto usinado — piso", 128900, -12, "paid"), ("aco", "vertice", "Aço CA-50 e telas", 74600, 3, "open"),
        ("pousada-candeias", "candeias", "Hospedagem e alimentação — armadores", 41800, 8, "open"), ("bastos", None, "Honorários contábeis — mês", 6800, 5, "open"),
        ("brita", "candeias", "Brita e areia — lote", 52300, -20, "paid"), ("ferragens", "candeias", "EPI e uniformes", 17900, 11, "open"),
    ]  # fmt: skip
    for i, (supplier, okey, desc, value, due, status) in enumerate(items, start=1):
        add("payables", f"pay:{i}", supplierId=uid(f"contact:{supplier}"), obraId=uid(f"obra:{okey}") if okey else None, description=desc, amountCents=brl(value),
            dueDate=d(due), status=status, documentRef=f"NF {rng.randint(1000, 9999)}", category="company" if not okey else "obra", paidAt=d(due) if status == "paid" else None)  # fmt: skip


def procurement() -> None:
    cand, cui, osa = (uid(f"obra:{k}") for k in ("candeias", "cuiaba", "osasco"))
    reqs = [
        ("steel", "Aço CA-50 12,5 mm — 12 t", cand, "draft", "atena", 2, [("Aço CA-50 12,5 mm, barra de 12 m", "t", 12)]),
        ("concrete", "Concreto fck 30 MPa — base do TQ-10", cand, "quoting", "manual", 6, [("Concreto usinado fck 30 MPa, bombeado", "m³", 64)]),
        ("crane", "Locação de guindaste 60 t — montagem de tanques", cand, "ordered", "manual", 20, [("Guindaste 60 t com operador", "mês", 3)]),
        ("ppe", "EPI — luvas, capacetes e botinas", cand, "quoting", "manual", 8, [("Luva de raspa", "par", 120), ("Capacete com jugular", "un", 40), ("Botina de segurança", "par", 40)]),
        ("tiles", "Telhas e rufos — Cuiabá", cui, "received", "manual", -6, [("Telha trapezoidal", "m²", 640)]),
        ("lodging", "Hospedagem da equipe de mobilização — Osasco", osa, "draft", "atena", 40, [("Diárias de hotel", "diária", 900)]),
    ]  # fmt: skip
    for key, title, oid, status, origin, needed, items in reqs:
        add("purchase-requests", f"req:{key}", number=f"REQ-2026-{len(rows('purchase-requests')) + 41:03d}", title=title, obraId=oid, status=status, origin=origin, neededBy=d(needed),
            requestedBy=uid("user:engineer"), items=[{"description": a, "unit": b, "quantity": c} for a, b, c in items], notes="")  # fmt: skip
    quotes = [
        ("steel", "aco", 102_100, 4), ("steel", "ferragens", 104_900, 6), ("concrete", "concreto", 36_800, 2), ("concrete", "brita", 38_900, 3),
        ("ppe", "ferragens", 8_900, 5), ("crane", "locamax", 486_000, 0), ("tiles", "ferragens", 96_400, 7), ("lodging", "pousada-candeias", 112_500, 0),
    ]  # fmt: skip
    for i, (req, supplier, total, days) in enumerate(quotes, start=1):
        selected = i in (1, 3, 5, 6, 7)
        add("quotes", f"quote:{i}", requestId=uid(f"req:{req}"), supplierId=uid(f"contact:{supplier}"), totalCents=brl(total), deliveryDays=days, validUntil=d(10),
            status="selected" if selected else "received", notes="")  # fmt: skip


def build() -> None:
    contracts()
    proposals()
    costs()
    receivables()
    payables()
    procurement()
