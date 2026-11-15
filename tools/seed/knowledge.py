"""Biblioteca, modelos e documentos emitidos, arquivos e relatórios."""

import re

from .common import add, brl, by_id, d, h, rng, rows, uid

# área: (rótulo, [(subárea, código, título, emissor, tipo, fonte, resumo, aplica a tipos de obra)])
ALL = ["industrial_new", "renovation", "subcontract"]
LIBRARY = [
    ("technical", "Técnica", "Orçamento e custos", "NBR 16633", "Orçamento e formação de preços em infraestrutura", "ABNT", "norm", "Enviada pelo usuário", "Níveis de orçamento, dados de entrada e precisão para obras de infraestrutura.", ALL),
    ("technical", "Técnica", "Orçamento e custos", "NBR 12721", "Custos de construção de edificações", "ABNT", "norm", "Enviada pelo usuário", "Critérios de avaliação de custos de construção de edificações.", ["industrial_new", "renovation"]),
    ("technical", "Técnica", "Inflamáveis e combustíveis", "NBR 17505", "Armazenamento de líquidos inflamáveis e combustíveis", "ABNT", "norm", "Enviada pelo usuário", "Requisitos de armazenamento: tanques, bacias de contenção, distâncias e proteção.", ["industrial_new", "subcontract"]),
    ("technical", "Técnica", "Reformas", "NBR 16280", "Reforma em edificações — sistema de gestão", "ABNT", "norm", "Enviada pelo usuário", "Gestão de reformas: planejamento, projeto, execução e responsabilidade técnica.", ["renovation"]),
    ("technical", "Técnica", "Perícias", "NBR 13752", "Perícias de engenharia na construção civil", "ABNT", "norm", "Enviada pelo usuário", "Diretrizes para perícias, laudos e pareceres técnicos.", ALL),
    ("technical", "Técnica", "Documentação técnica", "NBR 10719", "Apresentação de relatório técnico", "ABNT", "norm", "Enviada pelo usuário", "Estrutura e apresentação de relatórios técnicos.", ALL),
    ("technical", "Técnica", "Estruturas", "NBR 6118", "Projeto de estruturas de concreto", "ABNT", "norm", "Enviada pelo usuário", "Requisitos de projeto de estruturas de concreto simples, armado e protendido.", ALL),
    ("technical", "Técnica", "Instalações", "NBR 5410", "Instalações elétricas de baixa tensão", "ABNT", "norm", "Enviada pelo usuário", "Projeto, execução e verificação de instalações elétricas de baixa tensão.", ALL),
    ("technical", "Técnica", "Instalações", "NBR 5419", "Proteção contra descargas atmosféricas", "ABNT", "norm", "Enviada pelo usuário", "Proteção de estruturas e aterramento contra descargas atmosféricas.", ALL),
    ("technical", "Técnica", "Incêndio", "NBR 13714", "Sistemas de hidrantes e de mangotinhos", "ABNT", "norm", "Enviada pelo usuário", "Requisitos de sistemas de hidrantes para combate a incêndio.", ["industrial_new", "renovation"]),
    ("technical", "Técnica", "Estruturas", "NBR 14653-1", "Avaliação de bens — procedimentos gerais", "ABNT", "norm", "Enviada pelo usuário", "Procedimentos gerais de avaliação de bens.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-1", "Disposições gerais e gerenciamento de riscos ocupacionais", "MTE", "regulation", "Portal do Ministério do Trabalho", "Base do gerenciamento de riscos (PGR) e das obrigações do empregador.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-5", "Comissão interna de prevenção de acidentes e de assédio (CIPA)", "MTE", "regulation", "Portal do Ministério do Trabalho", "Constituição e funcionamento da CIPA e do designado.", ALL),
    ("technical", "Técnica", "Manutenção", "NBR 16747", "Inspeção predial — diretrizes, conceitos e procedimentos", "ABNT", "norm", "Enviada pelo usuário", "Procedimentos de inspeção predial e classificação de anomalias.", ["renovation"]),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-6", "Equipamento de proteção individual", "MTE", "regulation", "Portal do Ministério do Trabalho", "Fornecimento, uso e certificado de aprovação (CA) dos EPI.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-7", "Programa de controle médico de saúde ocupacional", "MTE", "regulation", "Portal do Ministério do Trabalho", "Exames médicos ocupacionais e ASO.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-10", "Segurança em instalações e serviços em eletricidade", "MTE", "regulation", "Portal do Ministério do Trabalho", "Requisitos para trabalho com instalações elétricas.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-12", "Segurança no trabalho em máquinas e equipamentos", "MTE", "regulation", "Portal do Ministério do Trabalho", "Proteções, dispositivos e capacitação para máquinas e equipamentos.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-18", "Segurança e saúde no trabalho na indústria da construção", "MTE", "regulation", "Portal do Ministério do Trabalho", "Condições do canteiro, PGR da obra, andaimes, escavações e fundações.", ALL),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-20", "Segurança com inflamáveis e combustíveis", "MTE", "regulation", "Portal do Ministério do Trabalho", "Requisitos de segurança em instalações com inflamáveis e combustíveis.", ["industrial_new", "subcontract"]),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-33", "Segurança e saúde em espaços confinados", "MTE", "regulation", "Portal do Ministério do Trabalho", "Identificação, permissão de entrada e capacitação para espaços confinados.", ["industrial_new", "subcontract"]),
    ("regulatory", "Regulatória", "Segurança e saúde", "NR-35", "Trabalho em altura", "MTE", "regulation", "Portal do Ministério do Trabalho", "Planejamento, capacitação e proteção contra quedas.", ALL),
    ("legal", "Legal", "Responsabilidade técnica", "Lei 6.496/1977", "Anotação de responsabilidade técnica (ART)", "Governo Federal", "law", "Planalto — legislação federal", "Institui a ART nos contratos de obras e serviços de engenharia.", ALL),
    ("legal", "Legal", "Empreitada", "Código Civil, arts. 610–626", "Contrato de empreitada", "Governo Federal", "law", "Planalto — legislação federal", "Regras da empreitada: preço, materiais, recebimento, garantia e responsabilidade.", ALL),
    ("legal", "Legal", "Previdenciário", "IN RFB 2.061/2021", "Cadastro Nacional de Obras (CNO)", "Receita Federal", "regulation", "Receita Federal", "Inscrição da obra no CNO, em até 30 dias do início.", ALL),
    ("legal", "Legal", "Previdenciário", "IN RFB 2.021/2021", "Aferição e regularização de obra (SERO)", "Receita Federal", "regulation", "Receita Federal", "Procedimentos de aferição de obra e certidão de regularidade.", ALL),
    ("legal", "Legal", "Ambiental", "CONAMA 237/1997", "Licenciamento ambiental (LP, LI, LO)", "CONAMA", "regulation", "Ministério do Meio Ambiente", "Define as licenças ambientais e o procedimento de licenciamento.", ["industrial_new", "renovation"]),
    ("legal", "Legal", "Ambiental", "CONAMA 273/2000", "Instalações de combustíveis — prevenção e controle da poluição", "CONAMA", "regulation", "Ministério do Meio Ambiente", "Licenciamento e controle de instalações que armazenam combustíveis.", ["industrial_new", "renovation"]),
    ("legal", "Legal", "Previdenciário", "Lei 8.213/1991", "Benefícios da Previdência — CAT", "Governo Federal", "law", "Planalto — legislação federal", "Define a comunicação de acidente de trabalho (CAT) e seus prazos.", ALL),
    ("legal", "Legal", "Dados pessoais", "Lei 13.709/2018", "Lei Geral de Proteção de Dados (LGPD)", "Governo Federal", "law", "Planalto — legislação federal", "Tratamento de dados pessoais: consentimento, retenção e direitos do titular.", ALL),
    ("checklist", "Acervo e checklists", "Abertura de obra", "CHK-001", "Checklist de abertura de obra", "CGA Acabamentos", "checklist", "Redigido pela equipe", "CNO, ART, alvará, licenças, comunicação prévia e documentos de SST.", ALL),
    ("checklist", "Acervo e checklists", "Encerramento", "CHK-002", "Checklist de encerramento de obra", "CGA Acabamentos", "checklist", "Redigido pela equipe", "Pendências, termo de recebimento, as built, manual e desmobilização.", ALL),
    ("checklist", "Acervo e checklists", "Projetos", "CHK-003", "Checklist de análise crítica de projeto estrutural", "CGA Acabamentos", "checklist", "Redigido pela equipe", "Verificações de compatibilidade, cargas, detalhamento e normas.", ["industrial_new", "renovation"]),
    ("checklist", "Acervo e checklists", "SST", "CHK-004", "Checklist de SST na mobilização", "CGA Acabamentos", "checklist", "Redigido pela equipe", "PGR, PCMSO, ASO, treinamentos e EPI exigidos na mobilização.", ALL),
    ("checklist", "Acervo e checklists", "Ambiental", "CHK-005", "Checklist de licenciamento ambiental de combustíveis", "CGA Acabamentos", "checklist", "Redigido pela equipe", "LP, LI, LO, condicionantes e renovações.", ["industrial_new", "renovation"]),
    ("checklist", "Acervo e checklists", "Suprimentos", "CHK-006", "Checklist de recebimento de materiais", "CGA Acabamentos", "checklist", "Redigido pela equipe", "Conferência de romaneio, lote, certificado e armazenagem.", ALL),
    ("company", "Acervo da empresa", "Procedimentos", "PRO-001", "Procedimento interno de medição de obra", "CGA Acabamentos", "procedure", "Acervo da empresa", "Fluxo de levantamento, conferência, boletim e envio ao contratante.", ALL),
    ("company", "Acervo da empresa", "Procedimentos", "PRO-002", "Padrão do diário de obra", "CGA Acabamentos", "procedure", "Acervo da empresa", "Campos obrigatórios e rotina de preenchimento do diário.", ALL),
    ("company", "Acervo da empresa", "Procedimentos", "PRO-003", "Política de EPI e uniformes", "CGA Acabamentos", "procedure", "Acervo da empresa", "Entrega, troca e controle de EPI por função.", ALL),
    ("company", "Acervo da empresa", "Procedimentos", "PRO-004", "Manual de integração de colaboradores", "CGA Acabamentos", "procedure", "Acervo da empresa", "Roteiro de integração, treinamentos iniciais e regras de conduta.", ALL),
]  # fmt: skip

TEMPLATES = {
    "memorial": ("Memorial descritivo", "engineering", "Descrição do objeto, serviços por frente, materiais e normas aplicáveis.", [
        ("heading", "MEMORIAL DESCRITIVO — {{obra}}"),
        ("paragraph", "1. OBJETO\nO presente memorial descreve os serviços de {{escopo}} da obra {{obra}}, localizada em {{cidade}}/{{uf}}, contratada por {{contratante}}."),
        ("paragraph", "2. DESCRIÇÃO DOS SERVIÇOS\n{{servicos}}"),
        ("paragraph", "3. NORMAS APLICÁVEIS\nOs serviços serão executados conforme as normas da ABNT aplicáveis, com destaque para NBR 6118, NBR 17505 e NBR 5410, e as Normas Regulamentadoras de segurança e saúde no trabalho, em especial a NR-18."),
        ("paragraph", "4. MATERIAIS E CONTROLE TECNOLÓGICO\nOs materiais serão recebidos mediante conferência de nota fiscal e certificado. O concreto estrutural terá controle de resistência por corpos de prova, conforme o plano de controle tecnológico da obra."),
        ("paragraph", "5. RESPONSABILIDADE TÉCNICA\nResponsável técnico: {{responsavel}} — {{conselho}} {{registro}}."),
        ("signature", "{{responsavel}}\nResponsável técnico"),
    ]),
    "contract": ("Contrato de empreitada", "legal", "Contrato de empreitada de obra industrial com preço global.", [
        ("heading", "CONTRATO DE EMPREITADA Nº {{numero}}"),
        ("paragraph", "CONTRATANTE: {{contratante}}.\nCONTRATADA: {{empresa}}, CNPJ {{cnpj}}, com sede em {{sede}}."),
        ("paragraph", "CLÁUSULA 1ª — DO OBJETO\nA CONTRATADA executará, em regime de empreitada por preço global, a obra {{obra}}, em {{cidade}}/{{uf}}, conforme projetos, memoriais e planilha contratual."),
        ("paragraph", "CLÁUSULA 2ª — DO PREÇO E DO PAGAMENTO\nO preço global é de {{valor}}. O pagamento será feito por medição mensal, em até 30 (trinta) dias após a emissão da nota fiscal, com retenção contratual de {{retencao}}%."),
        ("paragraph", "CLÁUSULA 3ª — DO PRAZO\nA obra será executada entre {{inicio}} e {{termino}}, salvo prorrogações formalizadas por aditivo."),
        ("paragraph", "CLÁUSULA 4ª — DO REAJUSTE\nO preço será reajustado anualmente pelo índice {{indice}}, a contar da data-base da proposta."),
        ("paragraph", "CLÁUSULA 5ª — DA RESPONSABILIDADE TÉCNICA E DA SEGURANÇA\nA CONTRATADA manterá responsável técnico habilitado, com ART registrada, e cumprirá as Normas Regulamentadoras de segurança e saúde no trabalho aplicáveis."),
        ("paragraph", "CLÁUSULA 6ª — DA GARANTIA\nA CONTRATADA oferece garantia de {{garantia}}% do valor do contrato, nos termos da lei civil para o contrato de empreitada."),
        ("signature", "{{empresa}}\nContratada"),
        ("signature", "{{contratante}}\nContratante"),
    ]),
    "calc": ("Memorial de cálculo", "engineering", "Memória de cálculo de quantitativos ou dimensionamentos.", [("heading", "MEMORIAL DE CÁLCULO — {{obra}}"), ("paragraph", "Este memorial apresenta as premissas, fórmulas e resultados do cálculo de {{escopo}}, em {{cidade}}/{{uf}}."), ("signature", "{{responsavel}}\nResponsável técnico")]),
    "report": ("Relatório técnico", "engineering", "Relatório técnico periódico da obra.", [("heading", "RELATÓRIO TÉCNICO — {{obra}}"), ("paragraph", "Período: {{periodo}}. Avanço físico acumulado: {{avanco}}%. Efetivo médio: {{efetivo}} colaboradores."), ("paragraph", "Principais ocorrências: {{ocorrencias}}"), ("signature", "{{responsavel}}\nResponsável técnico")]),
    "expert": ("Laudo técnico", "engineering", "Laudo de vistoria e conclusão técnica.", [("heading", "LAUDO TÉCNICO — {{obra}}"), ("paragraph", "Vistoria realizada em {{data}} em {{cidade}}/{{uf}}. Constatações: {{constatacoes}}"), ("paragraph", "Conclusão: {{conclusao}}"), ("signature", "{{responsavel}}\nResponsável técnico")]),
    "opinion": ("Parecer técnico", "engineering", "Parecer sobre consulta técnica.", [("heading", "PARECER TÉCNICO Nº {{numero}}"), ("paragraph", "Consulta: {{consulta}}\nParecer: {{parecer}}"), ("signature", "{{responsavel}}\nResponsável técnico")]),
    "minutes": ("Ata de reunião", "obra", "Ata com pauta, participantes e encaminhamentos.", [("heading", "ATA DE REUNIÃO — {{obra}}"), ("paragraph", "Data: {{data}}. Pauta: {{pauta}}"), ("paragraph", "Encaminhamentos: {{encaminhamentos}}")]),
    "workorder": ("Ordem de serviço", "obra", "Ordem de serviço para execução de atividade.", [("heading", "ORDEM DE SERVIÇO Nº {{numero}}"), ("paragraph", "Fica autorizada a execução de {{servico}} na obra {{obra}}, a partir de {{data}}."), ("signature", "{{responsavel}}\nResponsável técnico")]),
    "declaration": ("Declaração", "avulso", "Declaração avulsa.", [("heading", "DECLARAÇÃO"), ("paragraph", "A {{empresa}}, CNPJ {{cnpj}}, declara para os devidos fins que {{declaracao}}."), ("signature", "{{responsavel}}\n{{empresa}}")]),
    "receipt": ("Recibo", "avulso", "Recibo de pagamento.", [("heading", "RECIBO"), ("paragraph", "Recebemos de {{contratante}} a importância de {{valor}}, referente a {{referencia}}."), ("signature", "{{empresa}}")]),
    "letter": ("Ofício", "avulso", "Ofício a contratante ou órgão.", [("heading", "OFÍCIO Nº {{numero}}"), ("paragraph", "Prezado(a) {{contratante}}, {{texto}}"), ("signature", "{{responsavel}}\n{{empresa}}")]),
    "handover": ("Termo de recebimento", "obra", "Termo de recebimento provisório ou definitivo.", [("heading", "TERMO DE RECEBIMENTO {{tipo}} — {{obra}}"), ("paragraph", "As partes reconhecem o recebimento {{tipo}} da obra {{obra}}, em {{data}}, com as pendências listadas em anexo."), ("signature", "{{contratante}}\nContratante"), ("signature", "{{empresa}}\nContratada")]),
}  # fmt: skip

# tipo de documento: (modelo, obra, status, dias atrás, título complementar)
DOCS = [
    ("memorial", "cuiaba", "issued", 120, "Reforma da Base Cuiabá"), ("memorial", "vertice", "issued", 70, "Serviços civis do parque de tanques"),
    ("memorial", "paulinia", "issued", 400, "Base de Distribuição Paulínia"), ("contract", "candeias", "issued", 125, ""), ("contract", "cuiaba", "issued", 95, ""),
    ("contract", "vertice", "issued", 70, ""), ("contract", "osasco", "approved", 62, ""), ("minutes", "candeias", "issued", 14, ""), ("minutes", "cuiaba", "issued", 9, ""),
    ("minutes", "vertice", "issued", 21, ""), ("workorder", "candeias", "issued", 30, ""), ("workorder", "cuiaba", "issued", 40, ""), ("report", "candeias", "in_review", 3, ""),
    ("report", "cuiaba", "issued", 16, ""), ("expert", "cuiaba", "issued", 26, "Pilar P12"), ("declaration", None, "issued", 50, ""), ("declaration", None, "draft", 2, ""),
    ("letter", "candeias", "issued", 11, ""), ("letter", "osasco", "in_review", 5, ""), ("handover", "paulinia", "in_review", 8, ""),
]  # fmt: skip


def money(cents: int) -> str:
    reais = f"{cents / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {reais}"


def fill(text: str, ctx: dict[str, str]) -> str:
    return re.sub(r"\{\{(\w+)\}\}", lambda m: ctx.get(m.group(1), f"[{m.group(1)}]"), text)


def library() -> None:
    for i, (area, label, sub, code, title, issuer, kind, source, summary, types) in enumerate(LIBRARY, start=1):
        add("library-items", f"lib:{i}", area=area, areaLabel=label, subarea=sub, code=code, title=title, issuer=issuer, kind=kind, source=source, summary=summary,
            version="Vigente", effectiveFrom=d(-rng.randint(400, 9000)), status="current", hasFile=kind in ("checklist", "procedure") or source == "Enviada pelo usuário",
            appliesTo={"obraTypes": types, "states": []}, updatedBy=uid("user:engineer"))  # fmt: skip


def templates() -> None:
    for key, (name, category, desc, blocks) in TEMPLATES.items():
        fields = sorted({v for _, t in blocks for v in re.findall(r"\{\{(\w+)\}\}", t)})
        add("document-templates", f"doctpl:{key}", name=name, category=category, description=desc, blocks=[{"type": t, "text": x} for t, x in blocks],
            fields=[{"key": f, "label": f.capitalize()} for f in fields], system=True, version=1)  # fmt: skip


def documents() -> None:
    company = rows("company")[0]
    for i, (tpl, okey, status, ago, extra) in enumerate(DOCS, start=1):
        obra = by_id("obras", uid(f"obra:{okey}")) if okey else None
        client = by_id("contacts", obra["clientId"]) if obra else None
        contract = next((c for c in rows("contracts") if obra and c["obraId"] == obra["id"] and c["kind"] == "client"), None)
        services = ""
        if obra and tpl == "memorial":
            services = "\n".join(f"{r['code']}. {r['name']}" for r in rows("eap-items") if r["obraId"] == obra["id"] and r["level"] == "front")
        ctx = {
            "obra": obra["name"] if obra else company["name"], "cidade": obra["city"] if obra else "Campo Grande", "uf": obra["state"] if obra else "MS",
            "contratante": client["name"] if client else "Destinatário", "empresa": company["legalName"], "cnpj": company["cnpj"],
            "sede": "Campo Grande/MS", "responsavel": company["technicalResponsible"]["name"], "conselho": company["technicalResponsible"]["council"],
            "registro": company["technicalResponsible"]["registration"], "escopo": extra or (obra["description"].split(":")[0].lower() if obra else "serviços de engenharia"),
            "servicos": services, "numero": f"{i:03d}/2026", "valor": money(contract["valueCents"]) if contract else money(brl(15000)), "retencao": "5", "garantia": "5",
            "indice": "INCC-M", "inicio": "conforme cronograma", "termino": "conforme cronograma", "data": "conforme registro", "periodo": "últimos 30 dias",
            "avanco": str(obra["actualPhysicalPct"]) if obra else "—", "efetivo": str(obra["headcount"]) if obra else "—", "tipo": "provisório",
        }  # fmt: skip
        name = TEMPLATES[tpl][0]
        blocks = [{"type": t, "text": fill(x, ctx)} for t, x in TEMPLATES[tpl][3]]
        add("documents", f"doc:{i}", templateId=uid(f"doctpl:{tpl}"), obraId=obra["id"] if obra else None, type=tpl, title=f"{name} — {extra or ctx['obra']}",
            number=f"{tpl[:3].upper()}-2026-{i:03d}", version=1 + i % 3, status=status, issuedAt=d(-ago) if status == "issued" else None, authorId=uid("user:engineer"),
            blocks=blocks, fileId=None, createdAt=h(-ago * 24))  # fmt: skip


def reports() -> None:
    items = [("Relatório gerencial de obras", "Gerencial", "Avanço, prazo, custo e efetivo de todas as obras."), ("Curva S consolidada", "Planejamento", "Previsto × realizado por obra e consolidado."),
             ("Extrato financeiro por obra", "Financeiro", "Receitas, custos e saldo por obra e por período."), ("Vencimentos do mês", "Prazos", "Licenças, exames, treinamentos, certidões e contratos."),
             ("Efetivo e mão de obra", "Pessoas", "Histograma de efetivo por função e por obra."), ("Orçado × realizado", "Custos", "Desvio de custo por frente da EAP."),
             ("Diário de obra consolidado", "Obras", "Resumo semanal dos diários com fotos selecionadas."), ("Indicadores de SST", "SST", "Taxas de frequência e gravidade, exames e treinamentos.")]  # fmt: skip
    for i, (title, category, desc) in enumerate(items, start=1):
        add("reports", f"report:{i}", title=title, category=category, description=desc, formats=["pdf", "xlsx", "docx"], lastRunAt=h(-rng.randint(6, 400)),
            schedule="Toda segunda-feira, 07h00" if i in (1, 4) else None)  # fmt: skip


def build() -> None:
    library()
    templates()
    documents()
    reports()
