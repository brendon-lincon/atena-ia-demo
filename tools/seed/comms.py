"""Conversas (WhatsApp), mensagens, e-mails e padrões de e-mail."""

import re

from .common import add, h, rows, uid

# chave, título, contato, obra, etiquetas
CONVERSATIONS = [
    ("fiscal", "Ricardo Menezes — Atlas", "atlas-fiscal", "candeias", ["contratante"]),
    ("candeias", "Obra Candeias — Equipe", None, "candeias", ["equipe"]),
    ("vertice", "Paula Siqueira — Vértice", "vertice-gerente", "vertice", ["contratante"]),
    ("aco", "Jorge Taveira — Aço Brasil", "aco-vendas", "candeias", ["fornecedor", "cotação"]),
    ("eletromaq", "Eletromaq — Projetos", "eletromaq", "candeias", ["terceiro"]),
    ("hotel", "Hotel Pantanal Palace", "hotel-cuiaba", "cuiaba", ["fornecedor"]),
    ("contador", "Hélio Bastos — Contabilidade", "contador", None, ["contabilidade"]),
    ("cuiaba", "Obra Cuiabá — Equipe", None, "cuiaba", ["equipe"]),
]
# conversa, direção, tipo, texto (ou transcrição), horas atrás, autor para grupos
MESSAGES = [
    ("fiscal", "in", "text", "Bom dia, Robson. Recebi o relatório semanal. Preciso entender o motivo do desvio na base do TQ-08.", 50),
    ("fiscal", "out", "text", "Bom dia, Ricardo. Foi a chuva de quinta: interrompemos a concretagem por 3 horas. Já replanejamos; o impacto é de 3 dias na base do TQ-08.", 49),
    ("fiscal", "in", "text", "Ok. Vocês conseguem recuperar até o marco de liberação do TQ-09?", 48),
    ("fiscal", "out", "text", "Conseguimos. Vamos reforçar a equipe de lançamento nos próximos dois dias.", 47),
    ("fiscal", "in", "text", "E a medição nº 4 de Cuiabá, quando enviam?", 20),
    ("fiscal", "out", "text", "Está fechada internamente. Envio ainda esta semana.", 19),
    ("fiscal", "in", "text", "Fico no aguardo. Obrigado.", 3),
    ("candeias", "in", "audio", "Seu Robson, o aço de doze e meio vai acabar amanhã. Os armadores já estão separando o que sobrou pra não parar a base do TQ-09.", 30),
    ("candeias", "in", "image", "Estoque de aço CA-50 12,5 mm no canteiro", 29),
    ("candeias", "out", "text", "Recebido, Jacinto. Vou pedir cotação agora.", 28),
    ("candeias", "in", "text", "Concreto do TQ-09 chega 7h30 amanhã. Equipe de lançamento confirmada.", 8),
    ("candeias", "out", "text", "Ótimo. Confirmem a bomba.", 7),
    ("candeias", "in", "text", "Bomba confirmada, lança de 36 m.", 7),
    ("candeias", "in", "image", "Armação da base do TQ-09 pronta para conferência", 2),
    ("candeias", "out", "text", "Conferi as fotos. Liberado para concretar.", 1),
    ("vertice", "in", "text", "Robson, precisamos antecipar a liberação do piso do parque em uma semana. É possível?", 26),
    ("vertice", "out", "text", "Posso verificar com a equipe e a concreteira. Retorno hoje.", 25),
    ("vertice", "out", "text", "É possível se vocês liberarem a área sul até quinta. A concreteira tem janela na sexta.", 22),
    ("vertice", "in", "text", "Combinado, libero a área na quarta à tarde.", 21),
    ("aco", "out", "text", "Jorge, preciso de 12 t de CA-50 12,5 mm para Candeias, entrega em até 3 dias. Qual o prazo e o valor?", 27),
    ("aco", "in", "text", "Robson, consigo entregar em 4 dias. R$ 8.508 por tonelada, total de R$ 102.100. Posso reservar?", 26),
    ("aco", "out", "text", "Vou fechar com você assim que a engenharia confirmar o pedido.", 3),
    ("aco", "in", "text", "Tranquilo. Mantenho o preço até amanhã às 17h.", 2),
    ("eletromaq", "in", "text", "Informo que o prazo de fabricação do QGBT foi estendido em 10 dias por falta de disjuntores do fabricante.", 120),
    ("eletromaq", "out", "text", "Isso compromete o cronograma da casa de gerador. Podem antecipar o CCM para compensar?", 118),
    ("eletromaq", "in", "text", "Vamos tentar liberar o CCM primeiro. Confirmo amanhã.", 117),
    ("eletromaq", "in", "audio", "Robson, falei com a fábrica: o CCM sai na data original e o QGBT vem dez dias depois. Mando o novo cronograma por e-mail.", 70),
    ("eletromaq", "out", "text", "Combinado. Aguardo o cronograma para atualizar o planejamento.", 69),
    ("hotel", "out", "text", "Boa tarde. Preciso de 9 apartamentos de 14 a 28 do mês, com café da manhã. Qual a tarifa corporativa?", 60),
    ("hotel", "in", "text", "Boa tarde! Tarifa corporativa de R$ 189 por apartamento, com café incluso. Podemos bloquear?", 59),
    ("hotel", "out", "text", "Pode bloquear. Envio a lista de hóspedes amanhã.", 58),
    ("hotel", "in", "text", "Reserva bloqueada. Aguardo a lista.", 57),
    ("contador", "out", "text", "Hélio, bom dia. O pacote do mês sai na sexta, com folha, vales e notas por obra.", 80),
    ("contador", "in", "text", "Bom dia, Robson. Perfeito. Confirme também as retenções das medições de Cuiabá.", 79),
    ("contador", "out", "text", "Confirmo. As retenções de INSS e ISS seguem no pacote.", 78),
    ("contador", "in", "text", "Recebi as notas de Candeias. Faltam duas de Cuiabá.", 12),
    ("contador", "out", "text", "Peço ao administrativo hoje.", 11),
    ("cuiaba", "in", "audio", "Seu Robson, no pilar P12 a armadura tá bem mais comida de ferrugem do que o projeto previu. O Paulo já ligou pro projetista.", 700),
    ("cuiaba", "out", "text", "Entendi. Registrem tudo com foto e medição da perda de seção.", 699),
    ("cuiaba", "in", "image", "Armadura do pilar P12 após remoção do cobrimento", 698),
    ("cuiaba", "in", "text", "Piso: terceira faixa concluída. Corte das juntas amanhã cedo.", 9),
    ("cuiaba", "out", "text", "Ótimo. Lembrem do selante nas juntas.", 8),
    ("cuiaba", "in", "text", "Chegaram as telhas do último lote. Conferidas.", 4),
    ("cuiaba", "in", "image", "Telhas do último lote conferidas", 4),
    ("fiscal", "in", "text", "Preciso do relatório fotográfico de Cuiabá para o boletim.", 150),
    ("fiscal", "out", "text", "Envio hoje. Já está organizado por frente.", 149),
    ("fiscal", "in", "text", "Recebido. Obrigado, Robson.", 148),
    ("candeias", "out", "text", "Equipe, atenção ao DDS de amanhã: içamento de cargas e sinalização de área.", 55),
    ("candeias", "in", "text", "Entendido. Todos avisados.", 54),
    ("vertice", "in", "text", "Precisamos do cronograma atualizado do parque até quarta.", 100),
    ("vertice", "out", "text", "Envio na terça. Já incorporei o piso antecipado.", 99),
    ("aco", "in", "text", "Segue a tabela atualizada do mês.", 200),
    ("aco", "out", "text", "Recebi, Jorge. Obrigado.", 199),
    ("hotel", "in", "text", "Segue o comprovante da última fatura.", 400),
    ("contador", "in", "text", "Lembrete: certidão negativa trabalhista vence no mês que vem.", 30),
    ("cuiaba", "out", "text", "Enviem o relatório do dia até as 17h.", 33),
    ("cuiaba", "in", "text", "Enviado.", 32),
    ("eletromaq", "out", "text", "Preciso do desenho de montagem do CCM para a Casa de Gerador.", 150),
    ("eletromaq", "in", "text", "Envio hoje à tarde, em PDF e DXF.", 149),
    ("candeias", "in", "audio", "Mestre falando: o terceiro da hidrante abriu mais uns trinta metros de vala hoje, tudo certo.", 52),
    ("fiscal", "out", "text", "Ricardo, segue a medição nº 4 de Cuiabá para análise.", -20),
]  # fmt: skip


def conversations() -> None:
    for key, title, contact, okey, labels in CONVERSATIONS:
        last = min(m[4] for m in MESSAGES if m[0] == key and m[4] >= 0)
        add("conversations", f"conv:{key}", channel="whatsapp", title=title, contactId=uid(f"contact:{contact}") if contact else None,
            obraId=uid(f"obra:{okey}") if okey else None, labels=labels, isGroup=contact is None, unread=1 if key in ("candeias", "aco", "eletromaq") else 0,
            lastMessageAt=h(-last))  # fmt: skip
    photos = [p for p in rows("photos") if p["obraId"] == uid("obra:candeias")]
    for i, (conv, direction, kind, text, ago) in enumerate(MESSAGES, start=1):
        scheduled = ago < 0
        add("messages", f"msg:{i}", conversationId=uid(f"conv:{conv}"), direction=direction, type=kind, body=text if kind != "audio" else None,
            transcript=text if kind == "audio" else None, caption=text if kind == "image" else None, photoId=photos[i % len(photos)]["id"] if kind == "image" else None,
            durationSec=18 + i % 20 if kind == "audio" else None, sentAt=h(-ago), status="scheduled" if scheduled else ("read" if direction == "out" else "delivered"))  # fmt: skip
    assert len(rows("messages")) >= 60


EMAILS = [
    ("inbox", "atlas-fiscal", "Solicitação de relatório fotográfico — Base Cuiabá", "Prezados, solicito o relatório fotográfico da frente de piso industrial referente ao período da medição nº 4, para análise do boletim.", 6, "cuiaba", ["Medições"], [], False),
    ("inbox", "cetesb", "Protocolo recebido — condicionantes da LI de Osasco", "Informamos o recebimento do cronograma de atendimento às condicionantes da Licença de Instalação. O protocolo segue anexo.", 20, "osasco", ["Regularização"], [("protocolo-li.pdf", 214)], True),
    ("inbox", "vertice-gerente", "Antecipação da liberação do piso — parque de tanques", "Robson, confirmo a liberação da área sul na quarta à tarde, conforme combinado. Segue o croqui com as frentes.", 22, "vertice", ["Obras"], [("croqui-area-sul.pdf", 480)], True),
    ("inbox", "aco-vendas", "Tabela de preços — CA-50 (validade 48 h)", "Segue a tabela atualizada para CA-50 nos diâmetros de 8 a 20 mm, com entrega na obra de Candeias.", 27, "candeias", ["Suprimentos"], [("tabela-ca50.xlsx", 38)], True),
    ("inbox", "contador", "Documentos pendentes do fechamento do mês", "Faltam duas notas fiscais de Cuiabá e o comprovante de recolhimento do FGTS de uma competência.", 12, None, ["Contábil"], [], False),
    ("inbox", "pref-osasco", "Exigências para análise do alvará de construção", "Após análise preliminar, solicitamos: memorial descritivo atualizado, ART de projeto e laudo de sondagem.", 40, "osasco", ["Regularização"], [], False),
    ("inbox", "inema", "Comprovante de protocolo — pedido de LO de Candeias", "Registramos o recebimento da solicitação de Licença de Operação. Prazo estimado de análise: 120 dias.", 100, "candeias", ["Regularização"], [("comprovante-lo.pdf", 156)], True),
    ("inbox", "eletromaq", "Novo cronograma de fornecimento — QGBT e CCM", "Conforme conversa, segue o cronograma revisado: CCM na data original e QGBT com 10 dias de acréscimo.", 68, "candeias", ["Suprimentos"], [("cronograma-qgbt.pdf", 98)], True),
    ("drafts", "aco-vendas", "Cotação de aço CA-50 12,5 mm — 12 t — Candeias", "Prezado Jorge, solicitamos cotação de 12 t de aço CA-50 12,5 mm, barras de 12 m, com entrega na obra de Candeias em até 4 dias. Condição de pagamento: 28 dias.", 1, "candeias", ["Suprimentos"], [], False),
    ("drafts", "eletromaq", "Prazo de entrega do QGBT — impacto no cronograma", "Prezados, o atraso de 10 dias no QGBT impacta a energização da Casa de Gerador. Solicitamos plano de recuperação e data firme de entrega.", 2, "candeias", ["Suprimentos"], [], False),
    ("drafts", "atlas-fiscal", "Medição nº 4 — Reforma da Base Cuiabá", "Prezado Ricardo, encaminhamos a medição nº 4 da Reforma da Base Cuiabá, com boletim e relatório fotográfico anexos, para análise e aprovação.", 3, "cuiaba", ["Medições"], [("boletim-medicao-04.pdf", 612)], True),
    ("drafts", "vertice-gerente", "Documentação do subempreiteiro — parque de tanques", "Solicitamos a documentação de SST do subempreiteiro responsável pelo piso: PGR, PCMSO, ASO e treinamentos das equipes.", 5, "vertice", ["SST"], [], False),
    ("sent", "atlas-fiscal", "Relatório semanal — Base Candeias (semana 14)", "Segue o relatório semanal com avanço físico, efetivo, ocorrências e registro fotográfico da semana.", 120, "candeias", ["Obras"], [("relatorio-semanal-14.pdf", 1280)], True),
    ("sent", "contador", "Pacote mensal — lançamentos, folha e vales", "Segue o pacote mensal com os lançamentos por obra, folha, vales e notas fiscais emitidas e recebidas.", 300, None, ["Contábil"], [("pacote-mensal.zip", 3400)], True),
    ("sent", "hotel-cuiaba", "Lista de hóspedes — equipe Cuiabá", "Seguem os nomes da equipe para a reserva dos 9 apartamentos no período combinado.", 56, "cuiaba", ["Logística"], [], False),
]  # fmt: skip

TEMPLATES = [
    ("rfp", "Solicitar proposta", "Solicitação de proposta — {{obra}}", "Prezados, solicitamos proposta técnica e comercial para {{escopo}}, conforme documentação anexa. Prazo para resposta: {{prazo}}."),
    ("review", "Pedir revisão", "Solicitação de revisão — {{documento}}", "Prezado(a) {{destinatario}}, encaminhamos {{documento}} para revisão. Agradecemos o retorno até {{prazo}}."),
    ("material", "Pedir material", "Solicitação de material — {{obra}}", "Prezados, solicitamos o fornecimento de {{material}} para a obra {{obra}}, com entrega até {{prazo}}."),
    ("quote", "Enviar cotação", "Cotação — {{material}}", "Prezados, solicitamos cotação de {{material}} (quantidade: {{quantidade}}), entrega em {{local}}. Condição de pagamento: {{pagamento}}."),
    ("budget", "Enviar orçamento ou proposta", "Proposta — {{obra}}", "Prezado(a) {{destinatario}}, encaminhamos a proposta para {{obra}}, válida por {{validade}} dias."),
    ("chase", "Cobrar pendência", "Pendência — {{assunto}}", "Prezado(a) {{destinatario}}, reforçamos a pendência referente a {{assunto}}, com prazo original em {{prazo}}. Pedimos retorno."),
    ("measurement", "Enviar medição", "Medição nº {{numero}} — {{obra}}", "Prezado(a) {{destinatario}}, encaminhamos a medição nº {{numero}} da obra {{obra}}, com boletim e relatório fotográfico, para análise e aprovação."),
    ("payment", "Solicitar pagamento", "Solicitação de pagamento — Medição nº {{numero}}", "Prezados, solicitamos o pagamento da medição nº {{numero}} aprovada, no valor de {{valor}}, conforme nota fiscal anexa."),
    ("forward", "Encaminhar documento", "Encaminhamento — {{documento}}", "Prezado(a) {{destinatario}}, encaminhamos {{documento}} para conhecimento e providências."),
    ("meeting", "Convocar reunião", "Convocação — reunião de {{assunto}}", "Prezados, convocamos reunião de {{assunto}} em {{data}}, às {{hora}}, em {{local}}. Pauta em anexo."),
    ("minutes", "Enviar ata", "Ata da reunião de {{data}}", "Prezados, segue a ata da reunião de {{data}}, com os encaminhamentos e responsáveis. Solicitamos conferência em até 2 dias."),
    ("delay", "Notificar atraso", "Comunicação de atraso — {{obra}}", "Prezados, comunicamos atraso de {{dias}} dia(s) em {{atividade}}, motivado por {{motivo}}. Plano de recuperação em anexo."),
    ("incident", "Comunicar ocorrência", "Comunicação de ocorrência — {{obra}}", "Prezados, comunicamos a seguinte ocorrência registrada em {{data}}: {{descricao}}. Providências em andamento."),
    ("subdocs", "Pedir documentação de subempreiteiro", "Documentação de SST — {{subempreiteiro}}", "Prezados, solicitamos a documentação de SST e trabalhista de {{subempreiteiro}} para liberação de acesso à obra {{obra}}."),
    ("reply", "Responder contratante", "Re: {{assunto}}", "Prezado(a) {{destinatario}}, em resposta ao assunto {{assunto}}, informamos que {{resposta}}. Permanecemos à disposição."),
    ("thanks", "Agradecer e encerrar", "Agradecimento — {{obra}}", "Prezado(a) {{destinatario}}, agradecemos a parceria durante a obra {{obra}}. Colocamo-nos à disposição para novas oportunidades."),
]  # fmt: skip


def emails() -> None:
    for i, (folder, contact, subject, body, ago, okey, labels, attachments, has_att) in enumerate(EMAILS, start=1):
        add("emails", f"email:{i}", folder=folder, contactId=uid(f"contact:{contact}"), direction="out" if folder in ("sent", "drafts") else "in", subject=subject,
            body=body, obraId=uid(f"obra:{okey}") if okey else None, labels=labels, attachments=[{"name": n, "sizeKb": s} for n, s in attachments],
            hasAttachments=has_att, receivedAt=h(-ago), read=folder != "inbox" or ago > 24, draftedBy="atena" if folder == "drafts" else None)  # fmt: skip


def email_templates() -> None:
    for key, name, subject, body in TEMPLATES:
        add("email-templates", f"emailtpl:{key}", name=name, subject=subject, body=body, system=True, variables=sorted({v.strip("{}") for v in _vars(subject + body)}))


def _vars(text: str) -> list[str]:
    return re.findall(r"\{\{\w+\}\}", text)


def build() -> None:
    conversations()
    emails()
    email_templates()
