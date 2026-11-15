"""Arquivos, prazos, apontamentos, revisão, notas, atividade, avisos, agenda, versões e roteiros."""

from .common import add, by_id, d, h, rng, rows, uid, write_script
from .knowledge import money

FILES_DIR = "/demo/files"
# nome, tipo, KB, obra, disciplina, tipo de vínculo, chave do vínculo, existe fisicamente
FILES = [
    ("GER-PE-001-rev02.pdf", "pdf", 2480, "candeias", "estrutura", "budgets", "budget:gerador", True),
    ("GER-PE-001.dxf", "dxf", 860, "candeias", "estrutura", "budgets", "budget:gerador", True),
    ("GER-PE-002-eletrica.pdf", "pdf", 1320, "candeias", "eletrica", "obras", "obra:candeias", False),
    ("TQ-01-12-bases-formas.pdf", "pdf", 3120, "candeias", "estrutura", "obras", "obra:candeias", False),
    ("PROJ-BACIA-contencao.dxf", "dxf", 1740, "candeias", "estrutura", "obras", "obra:candeias", False),
    ("memorial-descritivo-tanques.docx", "docx", 214, "candeias", "geral", "obras", "obra:candeias", False),
    ("planilha-contratual-candeias.xlsx", "xlsx", 96, "candeias", "geral", "contracts", "contract:candeias", False),
    ("ART-BA-2026-3377.pdf", "pdf", 142, "candeias", "geral", "compliance-items", "compliance:10", False),
    ("LI-INEMA-5512.pdf", "pdf", 388, "candeias", "geral", "compliance-items", "compliance:12", False),
    ("relatorio-semanal-14.pdf", "pdf", 1280, "candeias", "geral", "obras", "obra:candeias", True),
    ("ensaio-corpos-de-prova-TQ07.pdf", "pdf", 210, "candeias", "geral", "obras", "obra:candeias", False),
    ("PROJ-CUI-GERAL.pdf", "pdf", 4210, "cuiaba", "estrutura", "budgets", "budget:cuiaba", True),
    ("boletim-medicao-04.pdf", "pdf", 612, "cuiaba", "geral", "measurements", "measurement:cuiaba:4", True),
    ("relatorio-fotografico-medicao-04.pdf", "pdf", 5600, "cuiaba", "geral", "measurements", "measurement:cuiaba:4", False),
    ("laudo-pilar-P12.pdf", "pdf", 740, "cuiaba", "estrutura", "documents", "doc:15", False),
    ("LO-SEMA-4410.pdf", "pdf", 420, "cuiaba", "geral", "compliance-items", "compliance:19", False),
    ("PROJ-PISO-industrial.dxf", "dxf", 980, "cuiaba", "estrutura", "obras", "obra:cuiaba", False),
    ("memorial-descritivo-cuiaba.pdf", "pdf", 560, "cuiaba", "geral", "documents", "doc:1", True),
    ("croqui-area-sul.pdf", "pdf", 480, "vertice", "geral", "obras", "obra:vertice", False),
    ("PROJ-PARQUE-pisos.dxf", "dxf", 1210, "vertice", "estrutura", "obras", "obra:vertice", False),
    ("contrato-vertice.pdf", "pdf", 330, "vertice", "geral", "contracts", "contract:vertice", False),
    ("protocolo-li.pdf", "pdf", 214, "osasco", "geral", "compliance-items", "compliance:5", True),
    ("LP-CETESB-3321.pdf", "pdf", 350, "osasco", "geral", "compliance-items", "compliance:4", False),
    ("sondagem-osasco.pdf", "pdf", 2900, "osasco", "geral", "obras", "obra:osasco", False),
    ("PROJ-OSASCO-implantacao.dxf", "dxf", 2250, "osasco", "arquitetura", "obras", "obra:osasco", False),
    ("exigencias-alvara-osasco.pdf", "pdf", 120, "osasco", "geral", "compliance-items", "compliance:3", False),
    ("as-built-paulinia.pdf", "pdf", 8800, "paulinia", "geral", "obras", "obra:paulinia", False),
    ("termo-recebimento-paulinia.docx", "docx", 88, "paulinia", "geral", "documents", "doc:20", False),
    ("CND-OBRA-2026-77.pdf", "pdf", 96, "paulinia", "geral", "compliance-items", "compliance:21", False),
    ("pacote-mensal.zip", "zip", 3400, None, "geral", "emails", "email:14", False),
    ("tabela-ca50.xlsx", "xlsx", 38, "candeias", "geral", "emails", "email:4", False),
    ("cronograma-qgbt.pdf", "pdf", 98, "candeias", "eletrica", "emails", "email:8", False),
    ("contrato-social-cga.pdf", "pdf", 540, None, "geral", "company", "company", False),
    ("apolice-seguro-riscos-engenharia.pdf", "pdf", 720, None, "geral", "company", "company", False),
    ("certidao-negativa-federal.pdf", "pdf", 64, None, "geral", "company", "company", False),
    ("PGR-candeias.pdf", "pdf", 1850, "candeias", "geral", "obras", "obra:candeias", False),
    ("PCMSO-2026.pdf", "pdf", 930, None, "geral", "company", "company", False),
    ("ficha-EPI-modelo.xlsx", "xlsx", 44, None, "geral", "company", "company", False),
    ("DDS-modelo.docx", "docx", 52, None, "geral", "company", "company", False),
    ("fotos-p12-corrosao.zip", "zip", 6100, "cuiaba", "estrutura", "diary-entries", "diary:cuiaba:3", False),
    ("audio-obra-candeias-aco.opus", "audio", 160, "candeias", "geral", "messages", "msg:8", False),
]  # fmt: skip


def files() -> None:
    for i, (name, kind, size, okey, disc, rtype, rkey, physical) in enumerate(FILES, start=1):
        add("files", f"file:{i}", name=name, kind=kind, sizeKb=size, obraId=uid(f"obra:{okey}") if okey else None, discipline=disc, recordType=rtype,
            recordId=uid(rkey) if rkey != "company" else uid("company"), version=1 + i % 3, uploadedBy=uid("user:engineer"), url=f"{FILES_DIR}/{name}" if physical else None,
            previewUrl=f"{FILES_DIR}/ger-pe-001-preview.svg" if name == "GER-PE-001.dxf" else None, fingerprint=f"{rng.getrandbits(48):012x}")  # fmt: skip


def deadlines() -> None:
    n = 0

    def put(title, date, kind, rtype, rkey, okey=None, severity=None):
        nonlocal n
        n += 1
        add("deadlines", f"deadline:{n}", title=title, dueDate=date, kind=kind, recordType=rtype, recordId=uid(rkey) if isinstance(rkey, str) else rkey,
            obraId=uid(f"obra:{okey}") if okey else None, responsibleId=uid("user:admin"), severity=severity)  # fmt: skip

    for ex in rows("health-exams"):
        if int(ex["validUntil"][2:]) <= 45:
            emp = by_id("employees", ex["employeeId"])
            put(f"ASO vence — {emp['name']}", ex["validUntil"], "aso", "health-exams", ex["id"])
    for tr in rows("trainings"):
        if int(tr["validUntil"][2:]) <= 60:
            emp = by_id("employees", tr["employeeId"])
            put(f"{tr['courseCode']} vence — {emp['name']}", tr["validUntil"], "training", "trainings", tr["id"])
    for item in rows("compliance-items"):
        date = item["dueDate"] or item["validUntil"]
        if date and int(date[2:]) >= -5 and item["status"] != "not_started":
            obra = by_id("obras", item["obraId"])
            put(f"{item['title']} — {obra['name']}", date, "license", "compliance-items", item["id"], None)
            rows("deadlines")[-1]["obraId"] = obra["id"]
    extras = [
        ("Certidão negativa trabalhista", d(18), "certificate", "company"), ("Certidão negativa federal (RFB/PGFN)", d(41), "certificate", "company"),
        ("Certidão de regularidade do FGTS", d(26), "certificate", "company"), ("Seguro de riscos de engenharia — Candeias", d(64), "insurance", "company"),
("Franquia de horas do guindaste (92% consumida)", d(12), "contract", "contract:lease:locamax"),
        ("Reajuste anual — contrato Cuiabá", d(21), "contract", "contract:cuiaba"), ("Pacote mensal ao contador", d(7), "obligation", "company"), ("Fechamento da folha do mês", d(9), "obligation", "company"),
    ]  # fmt: skip
    for title, date, kind, rkey in extras:
        put(title, date, kind, "company" if rkey == "company" else "contracts", rkey)


def insights() -> None:
    cand, cui, osa = (uid(f"obra:{k}") for k in ("candeias", "cuiaba", "osasco"))
    exams = [e for e in rows("health-exams") if e["validUntil"] == "@d+7"]
    lo = next(c for c in rows("compliance-items") if c["step"] == "env_lo" and c["obraId"] == cui)
    tq08 = next(a for a in rows("schedule-activities") if a["name"] == "Base do tanque TQ-08")
    data = [
        ("risk", "critical", "Falta de aço CA-50 12,5 mm", "A nota do diário de ontem informa que o estoque cobre só mais 1 dia. A frente de armação do TQ-09 vai parar sem reposição.", "morning", -6,
         {"type": "diary-entries", "recordId": uid("diary:candeias:1"), "label": "Nota do diário de ontem, Candeias"}, "Criar requisição de aço CA-50 12,5 mm (12 t)", {"type": "open-record", "recordType": "purchase-requests", "recordId": uid("req:steel")}, cand),
        ("conflict", "attention", "Conflito de alocação — equipe de armação", "Os 5 armadores estão alocados em Candeias e em Cuiabá na mesma semana (próximos 12 dias).", "morning", -6,
         {"type": "allocations", "recordId": None, "label": "Alocações da equipe de armação"}, "Reprogramar a equipe de armação", {"type": "navigate", "to": "/planning?tab=resources"}, cand),
        ("deadline", "attention", "Condicionante da licença de operação vence em 20 dias", "Relatório de monitoramento de águas subterrâneas da LO de Cuiabá.", "afternoon", -20,
         {"type": "compliance-items", "recordId": lo["id"], "label": "Licença de Operação — Cuiabá"}, "Criar tarefa para protocolar o relatório", {"type": "create-task", "title": "Protocolar o relatório da condicionante da LO", "obraId": cui}, cui),
        ("omission", "attention", "Hospedagem da mobilização de Osasco fora do orçamento", "O planejamento prevê 9 colaboradores por 6 semanas, mas o orçamento não tem custo de hospedagem.", "afternoon", -20,
         {"type": "mobilization", "recordId": None, "label": "Mobilização — Osasco"}, "Incluir hospedagem no orçamento", {"type": "open-record", "recordType": "purchase-requests", "recordId": uid("req:lodging")}, osa),
        ("risk", "critical", "Atividade crítica atrasada — Concretagem da base TQ-08", "A atividade, que está no caminho crítico, está 3 dias atrasada em relação à linha de base.", "morning", -30,
         {"type": "schedule-activities", "recordId": tq08["id"], "label": "Cronograma — Candeias"}, "Replanejar o TQ-08 e recuperar o prazo", {"type": "navigate", "to": "/planning?tab=gantt"}, cand),
        ("deadline", "attention", "2 ASO vencem em 7 dias", "Colaboradores com exame periódico vencendo.", "afternoon", -30,
         {"type": "health-exams", "recordId": exams[0]["id"], "label": "Exames — SST"}, "Agendar os exames periódicos", {"type": "navigate", "to": "/safety?tab=exams"}, None),
        ("risk", "info", "Desvio de custo em Candeias: +2,1%", "O desvio está concentrado em concreto usinado e locação de equipamentos.", "night", -54,
         {"type": "cost-entries", "recordId": None, "label": "Custos — Candeias"}, "Revisar custos de concreto", {"type": "navigate", "to": "/finance"}, cand),
        ("risk", "info", "Previsão de chuva forte na quinta-feira", "A concretagem da base do TQ-09 está programada para o mesmo dia.", "night", -54,
         {"type": "weather", "recordId": None, "label": "Previsão do tempo — Candeias"}, "Antecipar a concretagem ou preparar proteção", {"type": "navigate", "to": "/works"}, cand),
        ("deadline", "info", "NR-35 de colaborador vence em 25 dias", "Reciclagem de trabalho em altura necessária para manter a frente de cobertura.", "morning", -78,
         {"type": "trainings", "recordId": None, "label": "Treinamentos — SST"}, "Agendar reciclagem", {"type": "navigate", "to": "/safety?tab=trainings"}, None),
        ("reminder", "attention", "Medição nº 4 de Cuiabá pronta para envio", "O boletim está aprovado internamente; o contrato prevê envio em até 5 dias após o fechamento.", "morning", -78,
         {"type": "measurements", "recordId": uid("measurement:cuiaba:4"), "label": "Medição nº 4 — Cuiabá"}, "Revisar e enviar ao contratante", {"type": "open-record", "recordType": "measurements", "recordId": uid("measurement:cuiaba:4")}, cui),
        ("risk", "info", "Franquia de horas do guindaste quase no limite", "92% das 220 h/mês contratadas já foram usadas.", "afternoon", -102,
         {"type": "contracts", "recordId": uid("contract:lease:locamax"), "label": "Contrato de locação LocaMax"}, "Negociar horas adicionais", {"type": "navigate", "to": "/procurement"}, cand),
        ("opportunity", "info", "Oportunidade: reaproveitar fôrmas do TQ-08 no TQ-12", "A sequência das bases permite reaproveitar o jogo de fôrmas e reduzir a compra de compensado.", "night", -102,
         {"type": "schedule-activities", "recordId": tq08["id"], "label": "Cronograma — bases dos tanques"}, "Ajustar o plano de fôrmas", {"type": "navigate", "to": "/planning"}, cand),
    ]  # fmt: skip
    for i, (kind, sev, title, body, shift, ago, source, action_label, action, okey) in enumerate(data, start=1):
        add("insights", f"insight:{i}", kind=kind, severity=sev, title=title, body=body, shift=shift, obraId=okey, source=source,
            suggestedAction={"label": action_label, **action}, status="new" if i <= 9 else "accepted" if i == 10 else "snoozed", generatedAt=h(ago))  # fmt: skip


def review_items() -> None:
    cand, cui = uid("obra:candeias"), uid("obra:cuiaba")
    budget = by_id("budgets", uid("budget:gerador"))
    low = [i for i in rows("budget-items") if i["budgetId"] == budget["id"] and i["confidence"] < 0.7]
    exams = [e for e in rows("health-exams") if e["validUntil"] == "@d+7"]
    photos = [p for p in rows("photos") if p["obraId"] == cand][:2]
    data = [
        ("quantity_takeoff", "Aprovar o quantitativo da Casa de Gerador", cand, "budgets", budget["id"], 0.78, 1, "GER-PE-001-rev02.pdf, p. 4–13", f"{len([i for i in rows('budget-items') if i['budgetId'] == budget['id']])} itens levantados, {len(low)} com confiança baixa", f"{money(budget['totalCents'])} (total com BDI)"),
        ("measurement_send", "Enviar a medição nº 4 de Cuiabá", cui, "measurements", uid("measurement:cuiaba:4"), 1.0, 1, "boletim-medicao-04.pdf", "Boletim aprovado internamente", "Enviar ao fiscal do contratante"),
        ("exam_renewal", "Renovar ASO que vence em 7 dias", None, "health-exams", exams[0]["id"], 1.0, 2, "Controle de ASO", "Validade em 7 dias", "Agendar exame periódico"),
        ("exam_renewal", "Renovar ASO que vence em 7 dias", None, "health-exams", exams[1]["id"], 1.0, 2, "Controle de ASO", "Validade em 7 dias", "Agendar exame periódico"),
        ("photo_classification", "Classificar foto na EAP", cand, "photos", photos[0]["id"], 0.91, 3, photos[0]["file"], "Foto do dia, sem frente definida", "2. Bases dos tanques — TQ-09"),
        ("photo_classification", "Classificar foto na EAP", cand, "photos", photos[1]["id"], 0.64, 3, photos[1]["file"], "Foto do dia, sem frente definida", "3. Bacia e muros de contenção"),
        ("invoice_classification", "Classificar nota fiscal de concreto", cand, "cost-entries", rows("cost-entries")[2]["id"], 0.97, 3, "NF-e 4821 — Concreteira Planalto", "Concreto usinado fck 30 MPa, 64 m³", "Categoria: materiais · Frente: Bases dos tanques"),
        ("invoice_classification", "Classificar nota fiscal de locação", cand, "cost-entries", rows("cost-entries")[4]["id"], 0.74, 3, "NF-e 1190 — LocaMax Equipamentos", "Locação de guindaste, mês corrente", "Categoria: equipamentos · Frente: Bases dos tanques"),
        ("diary_extraction", "Conferir registro do diário extraído de áudio", cand, "messages", rows("messages")[7]["id"], 0.82, 2, "Áudio do encarregado (transcrito)", "O aço de doze e meio vai acabar amanhã", "Ocorrência: falta de aço CA-50 12,5 mm · Impacto: 2 dias"),
        ("email_draft", "Revisar rascunho — cotação de aço", cand, "emails", uid("email:9"), 0.95, 2, "Rascunho da Atena", "Cotação de aço CA-50 12,5 mm — 12 t", "Enviar a 3 fornecedores"),
        ("email_draft", "Revisar rascunho — prazo do QGBT", cand, "emails", uid("email:10"), 0.9, 3, "Rascunho da Atena", "Prazo de entrega do QGBT", "Enviar ao fornecedor"),
        ("document_draft", "Revisar relatório técnico de Candeias", cand, "documents", uid("doc:13"), 0.88, 3, "Modelo de relatório técnico", "Período: últimos 30 dias", "Aprovar para emissão"),
        ("schedule_update", "Confirmar replanejamento do TQ-08", cand, "schedule-activities", rows("schedule-activities")[0]["id"], 0.8, 2, "Diário de obra de ontem", "Término em 3 dias após a linha de base", "Novo término: hoje"),
        ("price_update", "Atualizar preço do aço CA-50", cand, "compositions", uid("comp:aco"), 0.86, 4, "Tabela de preços do fornecedor", "R$ 8,508/kg", "Atualizar a composição CGA-0105"),
    ]  # fmt: skip
    for i, (kind, title, okey, rtype, rid, conf, prio, src, preview, suggested) in enumerate(data, start=1):
        add("review-items", f"review:{i}", kind=kind, title=title, obraId=okey, recordType=rtype, recordId=rid, confidence=conf, priority=prio,
            source={"label": src, "preview": preview}, suggestedValue=suggested, approvedValue=None, status="pending", needsYou=i <= 4)  # fmt: skip


def notes_and_activity() -> None:
    note_data = [
        ("obras", "obra:candeias", "Reunião com a fiscalização: prioridade na liberação do TQ-09."), ("tasks", "task:1", "Revisar principalmente os itens de armação, com confiança menor."),
        ("budgets", "budget:gerador", "Levantamento feito a partir da revisão 02 do projeto; conferir a base do gerador."), ("measurements", "measurement:cuiaba:4", "Fiscal pediu relatório fotográfico por frente."),
        ("obras", "obra:osasco", "CNO deve ser protocolado antes do início da mobilização."), ("obras", "obra:cuiaba", "Contrato prevê reajuste anual pelo INCC-M."),
        ("contracts", "contract:lease:locamax", "Negociar horas adicionais do guindaste antes da montagem dos tanques."), ("obras", "obra:vertice", "Piso antecipado em uma semana, conforme combinado."),
        ("tasks", "task:4", "Preferência pelo fornecedor com entrega em até 4 dias."), ("obras", "obra:paulinia", "As built aguardando aprovação do contratante."),
        ("documents", "doc:13", "Incluir o desvio do TQ-08 e o plano de recuperação."), ("compliance-items", "compliance:19", "Relatório trimestral já está em elaboração pelo laboratório."),
    ]  # fmt: skip
    for i, (rtype, rkey, body) in enumerate(note_data, start=1):
        add("notes", f"note:{i}", recordType=rtype, recordId=uid(rkey), body=body, authorId=uid("user:owner" if i % 2 else "user:engineer"), pinned=i in (1, 5))
    acts = [
        ("measurements", "measurement:cuiaba:4", "approved", "Medição nº 4 aprovada internamente"), ("budgets", "budget:gerador", "updated", "Quantitativo da Casa de Gerador gerado a partir do projeto"),
        ("tasks", "task:8", "completed", "Tarefa concluída: conferir ensaio do TQ-07"), ("documents", "doc:8", "issued", "Ata de reunião emitida"),
        ("obras", "obra:candeias", "updated", "Avanço físico atualizado a partir do diário"), ("emails", "email:11", "drafted", "A Atena redigiu o e-mail da medição nº 4"),
        ("compliance-items", "compliance:5", "updated", "Protocolo das condicionantes da LI registrado"), ("purchase-requests", "req:steel", "drafted", "A Atena redigiu a requisição de aço"),
    ]  # fmt: skip
    for i in range(40):
        rtype, rkey, action, summary = acts[i % len(acts)]
        add("activity", f"act:{i + 1}", recordType=rtype, recordId=uid(rkey), userId=uid("user:engineer" if i % 3 else "user:owner"), action=action, summary=summary,
            at=h(-(i * 5 + 1)))  # fmt: skip


def LOW_COUNT() -> int:  # noqa: N802
    budget = uid("budget:gerador")
    return len([i for i in rows("budget-items") if i["budgetId"] == budget and i["confidence"] < 0.7])


def notifications() -> None:
    data = [
        ("Medição nº 4 aprovada", "A medição nº 4 de Cuiabá está pronta para envio.", "approval", "/measurements", 2), ("2 exames vencem em 7 dias", "Veja os colaboradores com ASO vencendo.", "deadline", "/safety", 4),
        ("Novo apontamento do Olhar de Atena", "Falta de aço CA-50 12,5 mm em Candeias.", "insight", "/athena-watch", 6), ("Mensagem de Jorge Taveira", "Mantenho o preço até amanhã às 17h.", "message", "/conversations", 2),
        ("Orçamento aguardando conferência", f"Casa de Gerador — {LOW_COUNT()} itens com confiança baixa.", "review", "/review", 8), ("Licença: condicionante em 20 dias", "Relatório de monitoramento — LO de Cuiabá.", "deadline", "/compliance", 30),
        ("Rascunho de e-mail pronto", "Cotação de aço CA-50 12,5 mm.", "draft", "/email", 3), ("Conflito de equipe detectado", "Equipe de armação em duas obras na mesma semana.", "insight", "/planning", 6),
    ]  # fmt: skip
    for i, (title, body, kind, link, ago) in enumerate(data, start=1):
        add("notifications", f"notif:{i}", userId=uid("user:owner"), title=title, body=body, kind=kind, link=link, readAt=h(-ago + 1) if i > 5 else None, createdAt=h(-ago))


def calendar() -> None:
    cand, cui, osa, ver = (uid(f"obra:{k}") for k in ("candeias", "cuiaba", "osasco", "vertice"))
    data = [
        ("Reunião de alinhamento com a fiscalização — Candeias", "meeting", 2, "09:00", "10:30", cand, "Obra Candeias"), ("Inspeção do piso industrial — Cuiabá", "inspection", 1, "14:00", "16:00", cui, "Obra Cuiabá"),
        ("Concretagem da base do TQ-09", "work", 1, "07:30", "15:00", cand, "Obra Candeias"), ("Viagem a Osasco — vistoria da área", "travel", 5, "06:00", "18:00", osa, "Osasco/SP"),
        ("Reunião semanal de planejamento", "meeting", 0, "08:00", "09:00", None, "Escritório"), ("Reunião com o contador — fechamento do mês", "meeting", 7, "15:00", "16:00", None, "Escritório"),
        ("Liberação da área sul — Vértice", "work", 3, "13:00", "14:00", ver, "Obra Vértice"), ("Entrega do QGBT (previsão)", "delivery", 18, "08:00", "12:00", cand, "Obra Candeias"),
        ("Treinamento NR-35 — reciclagem", "training", 14, "08:00", "17:00", cand, "Centro de treinamento"), ("Protocolo do relatório da LO — prazo", "deadline", 20, None, None, cui, ""),
        ("Entrega do aço CA-50 (previsão)", "delivery", 4, "10:00", "12:00", cand, "Obra Candeias"), ("Vistoria do corpo de bombeiros — Cuiabá", "inspection", 9, "09:00", "11:00", cui, "Obra Cuiabá"),
        ("DDS — içamento de cargas", "meeting", 0, "07:00", "07:20", cand, "Obra Candeias"), ("Reunião de abertura — Osasco", "meeting", 50, "10:00", "11:30", osa, "Escritório"),
        ("Feriado municipal — Candeias", "holiday", 11, None, None, None, ""), ("Teste hidrostático — rede de hidrantes", "work", 25, "08:00", "17:00", cand, "Obra Candeias"),
        ("Medição nº 4 — envio ao contratante", "deadline", 4, None, None, cui, ""), ("Reunião com a Vértice — cronograma do parque", "meeting", 6, "11:00", "12:00", ver, "Videoconferência"),
        ("Visita técnica — Base Salvador (proposta)", "travel", 12, "07:00", "19:00", None, "Salvador/BA"), ("Apresentação da proposta — Base Uberaba", "meeting", 16, "15:00", "16:30", None, "Videoconferência"),
        ("Conferência de materiais — telhas Cuiabá", "work", -2, "09:00", "10:00", cui, "Obra Cuiabá"), ("Fechamento da folha", "deadline", 9, None, None, None, ""),
        ("Auditoria interna de SST — Candeias", "inspection", 22, "08:00", "12:00", cand, "Obra Candeias"), ("Aniversário da empresa", "holiday", 30, None, None, None, ""),
        ("Reunião com a Atlas — encerramento de Paulínia", "meeting", 13, "10:00", "11:00", None, "Videoconferência"),
    ]  # fmt: skip
    for i, (title, kind, day, start, end, okey, place) in enumerate(data, start=1):
        add("calendar-events", f"cal:{i}", title=title, kind=kind, date=d(day), startTime=start, endTime=end, allDay=start is None, obraId=okey, location=place, attendees=[])


def versions() -> None:
    targets = [("documents", "doc:1"), ("documents", "doc:4"), ("documents", "doc:13"), ("budgets", "budget:gerador"), ("budgets", "budget:cuiaba")]
    for rtype, rkey in targets:
        rec = by_id(rtype, uid(rkey))
        for number in range(1, rec.get("version", 2) + 1):
            add("versions", f"version:{rkey}:{number}", recordType=rtype, recordId=rec["id"], number=number, authorId=uid("user:engineer"),
                reason="Versão inicial" if number == 1 else "Revisão após conferência", summary="", createdAt=h(-24 * (30 - number * 7)))  # fmt: skip


def scripts() -> None:
    budget = uid("budget:gerador")
    write_script("_job-scripts", {
        "budget-takeoff": {"stages": [
            {"label": "Lendo o arquivo", "durationMs": 1800}, {"label": "Identificando elementos", "durationMs": 2400},
            {"label": "Calculando quantitativos", "durationMs": 2800}, {"label": "Verificação cruzada", "durationMs": 2000}],
            "result": {"budgetId": budget, "itemCount": 38, "lowConfidenceCount": len([i for i in rows("budget-items") if i["budgetId"] == budget and i["confidence"] < 0.7]), "crossCheckCount": 2}},
        "document-fill": {"stages": [{"label": "Reunindo dados da obra", "durationMs": 1200}, {"label": "Preenchendo o modelo", "durationMs": 2200}, {"label": "Conferindo campos obrigatórios", "durationMs": 1200}], "result": {"fieldsFilled": 14, "fieldsToReview": 2}},
        "template-import": {"stages": [{"label": "Lendo o modelo enviado", "durationMs": 1500}, {"label": "Identificando campos", "durationMs": 2600}, {"label": "Montando o modelo", "durationMs": 1800}], "result": {"fieldsDetected": 11}},
        "file-analysis": {"stages": [{"label": "Lendo o arquivo", "durationMs": 1400}, {"label": "Resumindo o conteúdo", "durationMs": 2200}, {"label": "Apontando prazos e riscos", "durationMs": 1800}], "result": {"summary": "Documento analisado: 3 prazos e 2 pontos de atenção identificados.",
                                                                                                                                         "deadlines": ["Entrega do relatório de monitoramento em 20 dias", "Renovação da licença em 210 dias", "Resposta ao órgão em 15 dias"],
                                                                                                                                         "risks": ["Multa por descumprimento de condicionante (cláusula 7)", "Exigência de seguro específico para o armazenamento"]}},
        "export-package": {"stages": [{"label": "Reunindo dados", "durationMs": 1500}, {"label": "Compactando arquivos", "durationMs": 2000}], "result": {"fileName": "atena-exportacao-demo.zip"}},
        "norm-upload": {"stages": [{"label": "Lendo a norma", "durationMs": 1600}, {"label": "Indexando o conteúdo", "durationMs": 2000}], "result": {"indexedPages": 48}},
    })  # fmt: skip
    cui_hotel = next(c for c in rows("cost-entries") if c["obraId"] == uid("obra:cuiaba") and "Hospedagem" in c["description"])
    exams = [by_id("employees", e["employeeId"]) for e in rows("health-exams") if e["validUntil"] == "@d+7"]
    cand = by_id("obras", uid("obra:candeias"))
    low_count = LOW_COUNT()
    write_script("_atena-intents", {
        "intents": [
            {"keywords": ["hospedagem", "cuiabá"], "reply": f"Em Cuiabá, o gasto com hospedagem lançado até hoje é de {money(cui_hotel['amountCents'])} (Hotel Pantanal Palace, 1 lançamento).",
             "actions": [{"type": "navigate", "label": "Abrir os custos de Cuiabá", "to": "/finance"}], "sources": [{"label": "Lançamento de custo — hospedagem", "recordType": "cost-entries", "recordId": cui_hotel["id"]}]},
            {"keywords": ["orçamento", "gerador"], "reply": f"O orçamento da Casa de Gerador (Candeias) está em revisão: 38 itens levantados do projeto, {low_count} com confiança baixa e 2 itens esquecidos apontados.",
             "actions": [{"type": "open-record", "label": "Abrir o orçamento", "recordType": "budgets", "recordId": budget}], "sources": [{"label": "Orçamento — Casa de Gerador", "recordType": "budgets", "recordId": budget}]},
            {"keywords": ["aso", "vencem"], "reply": f"Há 2 exames ocupacionais vencendo em 7 dias: {exams[0]['name']} e {exams[1]['name']}.",
             "actions": [{"type": "navigate", "label": "Ver exames", "to": "/safety?tab=exams"}], "sources": [{"label": "Controle de ASO", "recordType": "health-exams", "recordId": None}]},
            {"keywords": ["medição", "cuiabá"], "reply": "A medição nº 4 de Cuiabá está aprovada internamente e pronta para envio ao contratante.",
             "actions": [{"type": "open-record", "label": "Abrir a medição", "recordType": "measurements", "recordId": uid("measurement:cuiaba:4")}], "sources": [{"label": "Medição nº 4", "recordType": "measurements", "recordId": uid("measurement:cuiaba:4")}]},
            {"keywords": ["atras"], "reply": "A atividade crítica Concretagem da base do TQ-08 está 3 dias atrasada em relação à linha de base. O restante do caminho crítico está dentro do previsto.",
             "actions": [{"type": "navigate", "label": "Abrir o Gantt", "to": "/planning?tab=gantt"}], "sources": [{"label": "Cronograma de Candeias", "recordType": "schedule-activities", "recordId": None}]},
            {"keywords": ["conflito", "equipe"], "reply": "A equipe de armação (5 colaboradores) está alocada em Candeias e em Cuiabá na mesma semana. Sugiro manter 3 em Candeias e deslocar 2 para Cuiabá.",
             "actions": [{"type": "navigate", "label": "Ver recursos", "to": "/planning?tab=resources"}], "sources": [{"label": "Alocações", "recordType": "allocations", "recordId": None}]},
            {"keywords": ["custo", "candeias"], "reply": f"Candeias está com custo {abs(cand['costVariancePct'])}% acima do orçado até aqui, concentrado em concreto usinado e locação de equipamentos.",
             "actions": [{"type": "navigate", "label": "Ver custos", "to": "/finance"}], "sources": [{"label": "Custos de Candeias", "recordType": "cost-entries", "recordId": None}]},
            {"keywords": ["licença", "venc"], "reply": "Nos próximos 30 dias vence a condicionante da LO de Cuiabá (em 20 dias). Há também o CNO de Osasco pendente.",
             "actions": [{"type": "navigate", "label": "Ver regularização", "to": "/compliance"}], "sources": [{"label": "Regularização", "recordType": "compliance-items", "recordId": None}]},
            {"keywords": ["osasco"], "reply": "Osasco está em mobilização: LI emitida, CNO pendente e início previsto em 58 dias. A hospedagem da equipe ainda não está no orçamento.",
             "actions": [{"type": "navigate", "label": "Abrir a obra", "to": "/works"}], "sources": [{"label": "Obra Osasco", "recordType": "obras", "recordId": uid("obra:osasco")}]},
            {"keywords": ["tarefa", "criar"], "reply": "Posso criar a tarefa. Confirme o título e o responsável.", "actions": [{"type": "navigate", "label": "Abrir tarefas", "to": "/tasks"}], "sources": []},
        ],
        "fallback": {"reply": "Ainda não sei responder a isso na demonstração, mas posso: consultar custos e prazos das obras, listar vencimentos e exames, abrir orçamentos e medições, e criar tarefas.",
                     "actions": [], "sources": []},
        "suggestions": ["Quanto gastei com hospedagem em Cuiabá?", "Abrir orçamento da Casa de Gerador", "Quais ASO vencem este mês?", "Quais atividades estão atrasadas?", "Como está Osasco?"],
    })  # fmt: skip
    write_script("_event-script", [
        {"afterSeconds": 14, "notification": {"title": "Mensagem de Ricardo Menezes", "body": "Pode confirmar o envio da medição nº 4?", "kind": "message", "link": "/conversations"}},
        {"afterSeconds": 38, "notification": {"title": "Novo apontamento do Olhar de Atena", "body": "Previsão de chuva forte na quinta-feira.", "kind": "insight", "link": "/athena-watch"}},
        {"afterSeconds": 75, "notification": {"title": "Cotação recebida", "body": "Aço Brasil respondeu à requisição de CA-50 12,5 mm.", "kind": "message", "link": "/procurement"}},
    ])  # fmt: skip


def build() -> None:
    files()
    deadlines()
    insights()
    review_items()
    notes_and_activity()
    notifications()
    calendar()
    versions()
    scripts()
