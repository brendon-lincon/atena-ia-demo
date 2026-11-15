"""Diário de obra, fotos, imprevistos e tarefas."""

from .common import add, brl, d, h, pick, rng, rows, uid

WEATHER = [("Ensolarado", 31, 0), ("Parcialmente nublado", 29, 0), ("Nublado", 27, 0), ("Chuva leve", 25, 6), ("Chuva forte", 23, 22)]
WEATHER_BY_OBRA = {"candeias": [0, 0, 1, 1, 2, 3, 4], "cuiaba": [0, 0, 0, 1, 1, 2], "vertice": [0, 1, 1, 2, 3]}
ICONS = ["tank", "wall", "truck", "rebar", "building", "crane"]
# (entradas de diário, efetivo próprio, efetivo de terceiros na entrada mais recente) — soma = efetivo da obra.
ENTRIES = {"candeias": (25, 18, 28), "cuiaba": (12, 9, 9), "vertice": (8, 7, 7)}
PHOTOS = {"candeias": 70, "cuiaba": 30, "vertice": 20}

NOTES = {
    ("candeias", 1): "Armadores aguardando aço CA-50 12,5 mm: o estoque no canteiro cobre apenas mais 1 dia de serviço. Necessário pedido urgente ao fornecedor.",
    ("candeias", 2): "Concretagem da base do TQ-08 interrompida por 3 h devido à chuva forte; retomada às 14h30. Cura úmida mantida.",
    ("candeias", 4): "Visita da fiscalização do contratante à frente de tanques. Sem apontamentos de não conformidade.",
    ("candeias", 6): "Entrega do concreto fck 30 MPa atrasou 2 h; equipe de lançamento ficou ociosa.",
    ("candeias", 9): "Início da armação da base do TQ-09. Liberação do projeto de formas com revisão 02.",
    ("cuiaba", 1): "Piso polido: 3ª faixa concluída. Aguardando cura para início do corte de juntas.",
    ("cuiaba", 3): "Reforço do pilar P12 com encamisamento: armadura corroída além do previsto, projetista acionado.",
    ("vertice", 1): "Canaletas do eixo C entregues para teste de estanqueidade.",
}
GENERIC = {
    "candeias": ["Frentes de tanques e bacia com ritmo normal.", "Descarga de aço e conferência de romaneio.", "DDS sobre trabalho em altura e içamento de cargas.", "Terceiro de hidrantes iniciou a abertura de valas.", "Ensaio de rompimento de corpos de prova: resultados dentro do fck especificado."],
    "cuiaba": ["Frentes de piso e cobertura com ritmo normal.", "Inspeção das calhas com o fiscal do contratante.", "DDS sobre trabalho em altura.", "Entrega de telhas e rufos conferida."],
    "vertice": ["Frentes de canaletas e piso com ritmo normal.", "DDS sobre escavações e interferências.", "Conferência de armaduras antes da concretagem."],
}  # fmt: skip


def off(token: str) -> int:
    return int(token[2:])


def _active_leaves(okey: str, day: int) -> list[dict]:
    oid = uid(f"obra:{okey}")
    return [a for a in rows("schedule-activities") if a["obraId"] == oid and a["eapItemId"] and off(a["startDate"]) <= day <= off(a["endDate"])]


def diary_and_photos() -> None:
    counter = 0
    for okey, (count, own, third) in ENTRIES.items():
        oid = uid(f"obra:{okey}")
        photos_left = PHOTOS[okey]
        for index in range(count):
            day = -(index + 1)
            active = _active_leaves(okey, day) or _active_leaves(okey, 0)
            services = []
            for act in active[:3]:
                leaf = next(r for r in rows("eap-items") if r["id"] == act["eapItemId"])
                span = max(off(act["endDate"]) - off(act["startDate"]), 1)
                qty = round(leaf["quantity"] / span * rng.uniform(0.6, 1.3), 1)
                services.append({"eapItemId": leaf["id"], "description": leaf["name"], "quantity": max(qty, 1), "unit": leaf["unit"]})
            weather = WEATHER[pick(WEATHER_BY_OBRA[okey])]
            own_n, third_n = (own, third) if index == 0 else (max(own - rng.randint(0, 2), 1), max(third - rng.randint(0, 5), 1))
            n_photos = photos_left if index == count - 1 else min(photos_left, 3 if index % 2 == 0 else 2)
            diary_key = f"diary:{okey}:{index + 1}"
            photo_ids = []
            for _ in range(n_photos):
                counter += 1
                svc = services[counter % len(services)] if services else None
                photo_ids.append(add("photos", f"photo:{counter}", obraId=oid, diaryEntryId=uid(diary_key),
                                     eapItemId=svc["eapItemId"] if svc else None, takenAt=h(day * 24 + rng.randint(9, 15)),
                                     caption=svc["description"] if svc else "Vista geral do canteiro", file=f"photo-{counter:03d}.svg",
                                     takenBy=uid("user:foreman"), tags=["registro do dia"], icon=ICONS[counter % len(ICONS)], hue=counter % 5))  # fmt: skip
            photos_left -= n_photos
            add("diary-entries", diary_key, obraId=oid, date=d(day),
                weather={"condition": weather[0], "tempC": weather[1] + rng.randint(-2, 2), "rainMm": weather[2]},
                headcountOwn=own_n, headcountThird=third_n, startTime="07:00", endTime="17:00", services=services,
                incidents="Paralisação por chuva de 3 h." if weather[2] > 20 else None,
                notes=NOTES.get((okey, index + 1)) or pick(GENERIC[okey]), photoIds=photo_ids, authorId=uid("user:foreman"),
                dayCostCents=brl(rng.randint(28, 64) * 1000 if okey == "candeias" else rng.randint(9, 22) * 1000))  # fmt: skip


def incidents() -> None:
    rows_ = [
        ("candeias", "Chuva intensa interrompeu a concretagem da base do TQ-08", "weather", "medium", "resolved", -2, -1, 0, 0, "1.8"),
        ("candeias", "Falta de aço CA-50 12,5 mm no canteiro", "supply", "high", "open", -1, None, 2, 0, "2.9"),
        ("candeias", "Interferência com tubulação existente da concessionária na bacia", "interference", "medium", "mitigating", -9, None, 4, 38000, "3.2"),
        ("candeias", "Atraso do fabricante na entrega do QGBT", "supply", "medium", "open", -6, None, 10, 0, "6.1"),
        ("cuiaba", "Armadura corroída além do previsto no pilar P12", "design", "high", "resolved", -28, -12, 3, 64000, "2.1"),
        ("cuiaba", "Interdição parcial do pátio pelo contratante", "interference", "low", "resolved", -40, -37, 1, 0, "3.2"),
        ("vertice", "Vazamento na linha de dreno existente durante a escavação", "interference", "medium", "resolved", -33, -30, 3, 21000, "2.1"),
        ("osasco", "Pendência do CNO atrasa as contratações da mobilização", "regulatory", "medium", "open", -5, None, 0, 0, None),
    ]  # fmt: skip
    for i, (okey, title, cat, sev, status, opened, closed, days, cost, code) in enumerate(rows_, start=1):
        oid = uid(f"obra:{okey}")
        eap = next((r["id"] for r in rows("eap-items") if r["obraId"] == oid and r["code"] == code), None) if code else None
        add("incidents-site", f"incident:{i}", obraId=oid, title=title, description=f"{title}. Registrado no diário de obra e acompanhado pela engenharia.",
            category=cat, severity=sev, status=status, openedAt=d(opened), resolvedAt=d(closed) if closed else None, impactDays=days,
            impactCostCents=cost * 100, eapItemId=eap, ownerId=uid("user:engineer"))  # fmt: skip


def tasks() -> None:
    owner, eng, foreman, admin = (uid(f"user:{r}") for r in ("owner", "engineer", "foreman", "admin"))
    obra = {k: uid(f"obra:{k}") for k in ("candeias", "cuiaba", "vertice", "osasco", "paulinia")}
    items = [
        ("Aprovar o quantitativo da Casa de Gerador", "Conferir os 38 itens levantados e aprovar para gerar a linha de base.", "todo", "urgent", 1, owner, "candeias", "atena"),
        ("Enviar a medição nº 4 de Cuiabá", "Boletim aprovado internamente; falta o envio ao fiscal do contratante.", "todo", "urgent", 0, eng, "cuiaba", "manual"),
        ("Renovar os 2 ASO que vencem em 7 dias", "Agendar exame periódico dos colaboradores com ASO vencendo.", "todo", "high", 3, admin, None, "atena"),
        ("Solicitar cotação de aço CA-50 12,5 mm", "Origem: nota do diário de ontem. Três fornecedores.", "doing", "urgent", 1, eng, "candeias", "diary"),
        ("Protocolar o relatório da condicionante da LO", "Condicionante com vencimento em 20 dias.", "todo", "high", 14, eng, "cuiaba", "manual"),
        ("Definir hospedagem da mobilização de Osasco", "Não consta no orçamento: levantar custo e incluir.", "todo", "high", 10, admin, "osasco", "atena"),
        ("Reprogramar equipe de armação (Candeias × Cuiabá)", "Conflito na próxima semana: decidir quem reforça Cuiabá.", "todo", "high", 4, owner, "candeias", "atena"),
        ("Conferir ensaio de rompimento de corpos de prova do TQ-07", "", "done", "medium", -3, eng, "candeias", "manual"),
        ("Atualizar cronograma com o replanejamento do TQ-08", "", "doing", "medium", 2, eng, "candeias", "manual"),
        ("Emitir memorial descritivo da Casa de Gerador", "Gerar a partir do orçamento aprovado.", "todo", "medium", 6, eng, "candeias", "manual"),
        ("Cobrar o fabricante sobre o prazo do QGBT", "Prazo informado: 10 dias além do contratual.", "blocked", "high", 2, admin, "candeias", "conversation"),
        ("Fechar pendências de as built de Paulínia", "", "doing", "medium", 12, eng, "paulinia", "manual"),
        ("Elaborar termo de recebimento definitivo de Paulínia", "", "todo", "medium", 20, eng, "paulinia", "manual"),
        ("Revisar PCMSO da obra de Osasco", "", "todo", "medium", 25, admin, "osasco", "manual"),
        ("Conferir folha de vales do mês", "", "todo", "low", 5, admin, None, "manual"),
        ("Enviar pacote mensal ao contador", "Lançamentos, notas e vales por obra.", "todo", "high", 7, admin, None, "manual"),
        ("Renovar certidão negativa trabalhista", "", "todo", "medium", 18, admin, None, "manual"),
        ("Reunião de alinhamento com o fiscal da Atlas", "Pauta: replanejamento do TQ-08 e medição nº 4.", "todo", "medium", 2, owner, "candeias", "manual"),
        ("Validar proposta do serviço adicional de drenagem", "", "doing", "medium", 4, owner, "vertice", "manual"),
        ("Programar DDS semanal sobre içamento de cargas", "", "todo", "low", 1, foreman, "candeias", "manual"),
        ("Inspecionar andaimes da frente de muros", "", "done", "medium", -1, foreman, "candeias", "manual"),
        ("Pedir liberação da área de bota-fora", "", "done", "low", -8, eng, "vertice", "manual"),
        ("Revisar contrato de locação de guindaste", "", "todo", "medium", 9, owner, None, "manual"),
        ("Atualizar tabela de preços de insumos (SINAPI)", "", "todo", "low", 15, eng, None, "manual"),
        ("Acompanhar entrega de telhas — Cuiabá", "", "done", "low", -5, foreman, "cuiaba", "manual"),
    ]  # fmt: skip
    for i, (title, desc, status, prio, due, who, okey, origin) in enumerate(items, start=1):
        add("tasks", f"task:{i}", title=title, description=desc, status=status, priority=prio, dueDate=d(due), assigneeId=who,
            obraId=obra[okey] if okey else None, eapItemId=None, origin=origin, tags=[])  # fmt: skip


def build() -> None:
    diary_and_photos()
    incidents()
    tasks()
