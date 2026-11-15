# Atena IA — Proposta de Arquitetura (v0.4, validada em 14/11/2026)

> Documento de enumeração: lista **o que** será construído. O "como" vem no manual executivo.
> Etapas: **[D]** demo (visual, dados fictícios) · **[1]…[6]** fase de construção · **[F]** futuro.
> Onde aparece "✚", o item foi incluído por pesquisa do domínio (não foi citado por você nem pelo cliente).

---

## 1. Princípios

1. **Núcleo completo, módulos encaixáveis** — o núcleo concentra tudo que é usado pelo sistema inteiro (identidade, dados, eventos, rotinas, versões, saúde, autorreparo). O que é específico de uma área vive em módulo próprio.
2. **Sistema grande e completo quando concluído** — cobre construção civil, engenharia civil, consultoria técnica e a empresa (administrativo, RH, jurídico, contábil), em nível estratégico, tático e operacional. As fases só definem a ordem de construção.
3. **Tomadas (portas e adaptadores)** — todo recurso externo entra por interface; trocar fornecedor é trocar adaptador.
4. **Determinístico primeiro** — cálculo, regra, cronograma, modelo de documento, modelo de e-mail e validação são código. IA só onde script não alcança, e sua saída é sempre dado estruturado que um script continua.
5. **Normas e leis regem a operação** — cada fluxo é desenhado sobre o procedimento legal/normativo aplicável e cita a fonte.
6. **Fonte única da verdade** — cada dado tem um dono (módulo) e é servido aos demais por uma camada de dados única; nada é duplicado.
7. **Nada sai sem revisão humana**; **tudo é rastreável** (origem, regra, versão, quem aprovou).
8. **Tudo é versionado dentro do sistema** — arquivos, peças técnicas, orçamentos, modelos e normas, além da indicação na própria peça.
9. **Intuitivo, não raso** — cada tela traz todas as opções pertinentes àquela área, organizadas por hierarquia visual; terminologia técnica da construção e da engenharia civil.
10. **Visual antes de tabela** — linhas do tempo, fluxos, esquemas, mapas e gráficos animados em vez de painéis densos; tabela é o detalhe, não a entrada.
11. **Ferramentas gratuitas e de código aberto** — pagas só em último caso e com custo previsto na mensalidade.
12. **Tudo exportável e importável** — pacote padronizado de todo o conteúdo do sistema.
13. **Código** — SOLID, enxuto, sem gambiarras; identificadores em inglês; comentários e docs em PT-BR.

---

## 2. Camadas

```
1. INTERFACE      web responsiva · barra de comando da Atena · visualizadores · sistema de movimento
2. API            porta única: consulta imediata · fila assíncrona · fluxo em tempo real
3. NÚCLEO         identidade · módulos · dados · eventos · rotinas · versões · notas · auditoria
                  saúde e autorreparo · segurança · configuração · exportação/importação
4. PLATAFORMA     motor de IA · memória e índice · pipeline de arquivos · motor de documentos
                  fila de revisão · notificações · busca · observabilidade · backup
5. MÓDULOS        31 módulos de domínio em 7 áreas (seção 5)
6. TOMADAS        IA · banco · armazenamento · e-mail · WhatsApp · mapas · bases de preço
                  fontes normativas · leitores de arquivo · calendário
```

---

## 3. Núcleo

| Submódulo | Responsabilidade | Etapa |
|---|---|---|
| **Registro de módulos** | Manifesto de cada módulo (rotas, menu, permissões, eventos, rotinas, dados que possui, modelos de documento); ligar/desligar; dependências entre módulos. | 1 |
| **Identidade e sessão** | Login, senha, recuperação, 2 fatores, sessões ativas, bloqueio por tentativas. | D/1 |
| **Perfis e permissões** | Dono · Engenheiro responsável · Encarregado · Administrativo · Contador · Advogado · Administrador técnico; por módulo, por obra e por ação. | 1/4 |
| **Empresa (multiempresa)** | Isolamento total dos dados por empresa. | 1/6 |
| **Camada de dados (API interna)** | Único caminho para ler/gravar. Três modos: *imediato* (telas), *fila* (processamento pesado), *tempo real* (painel, conversas, andamento de tarefas). Contratos versionados por módulo. | 1 |
| **Catálogo de dados** | Dicionário de todas as entidades, donos e relações — usado pelas telas, relatórios e pela IA para achar a informação sem procurar. | 1 |
| **Barramento de eventos** | Módulos se avisam sem se conhecer; entrega garantida e reprocessável. | 1 |
| **Agendador e fila de tarefas** | Rotinas com frequência, dia e hora configuráveis; reexecução; prioridade. | 1 |
| **Serviço de versões** | Versionamento genérico de qualquer registro ou arquivo: número, data, autor, motivo, comparação, restauração. | 1 |
| **Serviço de notas** | Campo de observações anexável a qualquer fluxo, tarefa, foto, documento, lançamento; alimenta o Olhar de Atena. | 1 |
| **Serviço de anexos e vínculos** | Liga qualquer registro a arquivos, conversas, e-mails e outros registros. | 1 |
| **Auditoria** | Quem, o quê, quando, antes/depois; imutável. | 1 |
| **Configurações** | Do usuário, da empresa e de cada módulo, com valores-padrão e histórico. | 1 |
| **Saúde e autorreparo** | Verificação periódica do núcleo, de cada módulo, tomada, API externa, fila e banco. Ações automáticas: nova tentativa com espera, religar conexão, reprocessar fila, isolar módulo defeituoso sem derrubar os demais, restaurar configuração válida, reconciliar dados inconsistentes, checar integridade de arquivos e backups. O que não se resolve sozinho vira alerta com diagnóstico. | 1–2 |
| **Proteções de estabilidade** | Limite de requisições, tempo máximo, disjuntor por tomada, operações idempotentes, transações. | 1 |
| **Segurança** | Criptografia em trânsito e repouso, cofre de segredos, validação de entrada, isolamento por empresa, LGPD (consentimento, retenção, direito de exclusão). | 1 |
| **Exportação e importação** | Pacote `.zip` com manifesto e esquema versionado: dados, arquivos, memória, configurações, modelos, contatos, histórico. Total ou por módulo; download ou envio por e-mail; importação com validação e prévia. | 2 |
| **Migrações e versão do sistema** | Evolução do banco versionada; registro de mudanças. | 1 |
| **Chaves de recurso e planos** | Liga funções por cliente/plano. | 6 |
| **Localização** | pt-BR, moeda, datas, unidades de medida, feriados nacionais/estaduais/municipais (afetam cronograma). | 1 |

---

## 4. Serviços de plataforma

### 4.1 Motor de IA
- Interface por *capacidade* (extrair, classificar, redigir, ver, transcrever), nunca por modelo. [1]
- Adaptadores: Claude → GPT → Google → DeepSeek; preferência configurável. [2–3]
- Roteador de modelo: o mais barato que passa na validação; sobe de nível ou troca de provedor em falha. [3]
- Roteador de ferramenta: script, consulta ao banco ou IA. [3]
- Autenticação: chave por consumo (padrão) e login por assinatura (tomada separada). [3]
- Catálogo de prompts versionado; saída estruturada e validada; cache; limite de gasto por tarefa/dia/empresa; registro de consumo por módulo. [2]
- Filtro de privacidade do que pode sair para o provedor; bateria de avaliação por tarefa. [3–6]

### 4.2 Memória e índice de conhecimento
- **Memória estruturada** (tabelas): preferências do usuário, padrões da empresa, contexto de cada obra, correções feitas em revisão — todas datadas, com origem. [3]
- **Índice de busca** (texto + semântico, no próprio banco): documentos, normas, conversas, e-mails, notas — para a IA receber só o trecho necessário. [3]
- **Contexto pronto por entidade**: resumo consolidado e atualizado de cada obra, cliente, contrato e funcionário, para a IA não reconstruir a cada pedido. [3]
- Tela de transparência: ver, editar, apagar. [3]

### 4.3 Pipeline de arquivos
1. Recebe, identifica, calcula impressão digital (evita duplicado), versiona. [1]
2. Leitura determinística: texto de PDF, camadas/blocos/cotas/textos de DXF, células de planilha. [2]
3. **DWG**: aceito, com aviso de que DXF é o recomendado; conversão automática DWG→DXF por script antes do processamento. [2]
4. OCR local para digitalizados; transcrição local de áudio. [2]
5. IA de visão só para interpretar o que sobra (ambientes, elementos por disciplina). [2]
6. Saída bruta em formato fixo, com confiança por item → validação por regra → fila de revisão. [2]

### 4.4 Motor de documentos
- Modelos com campos, tabelas, condicionais e blocos reutilizáveis; saída **PDF, DOCX, XLSX**. [3]
- Aplica automaticamente a identidade visual da empresa (módulo 5.6.3). [3]
- Numeração, controle de versão, rodapé com rastreabilidade, campo de responsável técnico. [3]
- **Compartilhar**: baixar, enviar por e-mail, WhatsApp ou outro canal ativo, com registro do envio. [3–4]

### 4.5 Fila de revisão humana — conferir, ajustar, aprovar; baixa confiança em destaque. [D/2]
### 4.6 Notificações — no sistema, e-mail, WhatsApp, Telegram, SMS; preferência por tipo de aviso. [1/4]
### 4.7 Busca global — registros, arquivos, normas, conversas, e-mails. [3]
### 4.8 Observabilidade — registros, métricas, rastreio, erros, saúde das tomadas, consumo de IA, uso por módulo; **painel visível ao usuário** em Configurações. [1–2]
### 4.9 Backup — automático, cópia externa, teste de restauração. [1]
### 4.10 Monitor de fontes externas
- Cadastro de cada fonte (lei, norma, tabela de preço, índice econômico, site de órgão) com **rotina própria: frequência, dia e hora**. [3]
- Detecta alteração, guarda nova versão, mostra o que mudou e quais obras/documentos/orçamentos são afetados. [3]
- Entrada manual: colar link ou enviar arquivo de lei, norma, resolução ou documentação técnica. [3]

---

## 5. Módulos de domínio (7 áreas · 31 módulos)

### ÁREA 1 — INÍCIO

**5.1.1 Painel** — "Precisa de você" · situação das obras em cartões visuais · alertas · linha do tempo geral da empresa · indicadores (custo, prazo, produtividade, caixa) · resumo desde o último acesso. [D/1]

**5.1.2 Central de revisão** — tudo que aguarda conferência, de qualquer módulo. [D/2]

**5.1.3 Olhar de Atena** — rotina por turno (padrão 3×/dia, configurável) que lê notas, diário, agenda, tarefas, conversas e dados brutos e aponta: pedidos de lembrete, riscos a uma obra, prazos, licenças e exames vencendo, desvios de custo, conflitos de equipe, itens esquecidos, oportunidades de melhoria. Regras determinísticas primeiro; IA para ler texto livre. Cada apontamento tem origem, gravidade e ação sugerida. [4]

**5.1.4 Agenda** — compromissos, reuniões, prazos de todos os módulos, lembretes, feriados; sincronização com calendários externos [F]. [1]

**5.1.5 Tarefas** — tarefas pessoais e da empresa (fora das de obra), delegação, cobrança, recorrência. [1]

### ÁREA 2 — OBRAS

**5.2.1 Obras**
- Cadastro: contratante, contrato, local (UF/município define legislação), tipo, responsáveis técnicos. [D/1]
- **Linha do tempo visual da obra**: fases, marcos, documentos, medições, desembolsos, efetivo e ocorrências num só eixo. [D/1]
- Estrutura analítica (EAP): fases, etapas, frentes de serviço e tipos de frente. [D/1]
- Tarefas de obra · diário de obra (clima, efetivo, serviços, ocorrências, fotos com data, início/término, custo, nº de operários, notas). [D/1]
- Relatório fotográfico · imprevistos e riscos · pleitos de aditivo · não conformidades. [2–3]
- Terceiros e subempreiteiros (escopo, interfaces, documentação exigida). [4]
- Encerramento ✚: pendências, termo de recebimento provisório/definitivo, as built, manual, desmobilização, lições aprendidas. [4]

**5.2.2 Planejamento**
- Cronograma executivo e **físico-financeiro**; **gráfico de Gantt** com dependências (término-início, início-início etc.), atividades paralelas e caminho crítico ✚. [D/2]
- Linha de base × realizado × tendência; curva S; reprogramação ao lançar avanço. [2]
- **Visão multiobra**: todas as obras sobrepostas no tempo. [D/2]
- **Recursos compartilhados**: o mesmo colaborador/equipe/equipamento em mais de uma obra; histograma de mão de obra; detecção de conflito e nivelamento. [2]
- **Dimensionamento de equipes** por produtividade (homem-hora por unidade de serviço). [2]
- Mobilização/desmobilização e logística (deslocamento, passagens, hospedagem, alimentação, transporte de equipamento). [2]
- Planejamento de curto prazo (semanal) e restrições ✚; simulação de cenários. [4]

**5.2.3 Medições**
- Levantamento do executado por item da planilha, com fotos, registros do diário e memória de cálculo. [3]
- Boletim de medição (período, acumulado, saldo), retenções, reajuste, aprovação do contratante. [3]
- Solicitação de pagamento vinculada → contas a receber; medição de subempreiteiros. [3–4]

**5.2.4 Regularização e licenças** ✚
- Checklist gerado por tipo e local da obra, com prazos, responsável e documento comprobatório.
- **CNO** (inscrição em até 30 dias do início — IN RFB 2.061/2021), aferição e regularização (SERO — IN RFB 2.021/2021), certidão da obra.
- **ART/RRT** e acervo técnico (Lei 6.496/77; resoluções do CONFEA/CAU).
- Alvará de construção/reforma, habite-se, licenças municipais.
- **Licenciamento ambiental**: LP, LI, LO (CONAMA 237/97; CONAMA 273/2000 para instalações de combustíveis), condicionantes e renovações.
- Corpo de Bombeiros: projeto aprovado e AVCB/CLCB (legislação estadual).
- Autorizações setoriais: ANP (instalações de armazenamento), outorgas, concessionárias, vigilância sanitária, órgãos de trânsito e patrimônio, conforme o caso.
- Comunicação prévia de obra e documentos de SST exigidos na abertura (liga ao módulo SST).
- Validade e alerta de vencimento de cada documento. [3]

**5.2.5 Mapa** — mapa interativo com as obras, situação, equipes alocadas, rotas e distâncias entre obras (base de mapas aberta e gratuita). [D/2]

### ÁREA 3 — ENGENHARIA

**5.3.1 Orçamentos**
- **Níveis conforme a norma** (ABNT NBR 16633 para infraestrutura; NBR 12721 para edificações): estimativa de custo · orçamento preliminar · orçamento analítico (detalhado) · orçamento sintético — cada um com dados de entrada exigidos e grau de precisão declarado. [2]
- Entrada: listagem, planilha importada ou projeto + memorial. [D/2]
- Levantamento de quantitativos rastreável, com critérios de medição. [D/2]
- Composições de custo unitário (próprias + bases de referência por UF e data-base) · insumos e cotações. [2]
- Custos diretos, indiretos (administração local, canteiro, mobilização, viagens, EPI, exames, seguros), encargos sociais e **BDI** com memória de cálculo. [2]
- Planilha sintética e analítica, curva ABC, cronograma físico-financeiro, histograma. [D/2]
- Revisão cruzada de itens omitidos; versões, cenários e comparação; reajuste por índice ✚. [2–3]
- Orçado × realizado realimenta composições e produtividades. [6]

**5.3.2 Projetos e análises** (para o engenheiro e para consultoria técnica) ✚
- Controle de projetos por disciplina e revisão; lista mestra de documentos.
- Análise crítica de projeto por checklist normativo; compatibilização entre disciplinas (sobreposição de DXF).
- Vistorias e inspeções com roteiro, fotos e laudo.
- Consultoria técnica: demandas, pareceres, horas técnicas.
- Controle de ARTs e acervo técnico do profissional.
- Ensaios e controle tecnológico (concreto, solo, aço) e rastreabilidade de materiais. [3–5]

**5.3.3 Documentos (emissão)**
- Engenharia: memorial descritivo, memorial de cálculo, laudo, relatório técnico, parecer, especificação, plano de execução, as built.
- Obra: diário consolidado, boletim de medição, ata, relatório periódico, termos de recebimento.
- Avulsos em qualquer módulo: **autorização, declaração, parecer, recibo, ofício, notificação, termo, procuração, ordem de serviço** e personalizados.
- Editor de revisão; situação (minuta → revisado → aprovado → emitido); versão; compartilhamento.
- Análise de documento recebido (resumo, pontos de atenção, prazos). [D/3]

### ÁREA 4 — EMPRESA

**5.4.1 Comercial** — contratantes e suas exigências · propostas técnica e comercial · funil de negociações · carteira de contratos (resumo) · prospecção [F]. [D/3]

**5.4.2 Suprimentos** ✚ — requisição → cotação (mapa comparativo) → pedido → recebimento → nota · fornecedores e avaliação · almoxarifado por obra · equipamentos e ferramentas (locação, manutenção, alocação) · frota e combustível. [4]

**5.4.3 Financeiro** — custos por obra e centro de custo · contas a pagar e a receber · fluxo de caixa realizado e projetado · conciliação bancária por importação de extrato ✚ · adiantamentos e prestação de contas de viagem · recibos e extratos emitíveis. [D/4]

**5.4.4 Contábil e fiscal**
- Pacote mensal do contador (lançamentos, notas, folha, vales, por obra).
- Notas fiscais emitidas e recebidas; retenções na construção civil (INSS, ISS no local da obra, IRRF, CSRF) ✚.
- Acompanhamento de regime tributário e limites (Simples, Presumido, Real), CPRB/desoneração, calendário de obrigações ✚.
- Certidões negativas (federal, estadual, municipal, FGTS, trabalhista) com validade ✚.
- Simulações e apontamentos para discutir com o contador — nunca decisão automática. [4–5]

**5.4.5 Pessoas (RH)**
- Admissão: documentos, contrato, registro, **exame admissional**, integração, entrega de EPI.
- Cadastro, função, obra, salário, dependentes; ponto e horas, extras, diárias de viagem.
- Vales e adiantamentos; prévia de folha; férias, 13º, afastamentos, atestados.
- Desligamento: aviso, **exame demissional**, rescisão (conferência), devolução de EPI.
- Convenção coletiva por região; eventos do eSocial como lista de conferência para o contador ✚. [4]

**5.4.6 Segurança e saúde do trabalho (SST)**
- **Exames**: admissional, periódico, de retorno ao trabalho, de mudança de risco e demissional (NR-7/PCMSO); ASO com validade e alerta.
- **Acidente de trabalho**: registro, investigação, CAT (prazo legal), afastamento, medidas corretivas.
- PGR e inventário de riscos (NR-1), programas por obra (NR-18).
- Treinamentos obrigatórios com validade (NR-6, 10, 11, 12, 18, 20, 33, 35 etc.), ordens de serviço.
- EPI/EPC: ficha de entrega, CA, validade. APR, permissão de trabalho, DDS, inspeções.
- CIPA/designado, SESMT (dimensionamento), indicadores (frequência e gravidade).
- Documentação de SST exigida pelo contratante na mobilização ✚. [4]

**5.4.7 Jurídico**
- **Contratos**: elaboração por modelo, cláusulas, vigência, reajuste, garantias, seguros, aditivos, distrato.
- Áreas: trabalhista · empresarial/societário · cível (empreitada — Código Civil arts. 610–626) · imobiliário · tributário · ambiental e regulatório ✚.
- Prazos e obrigações contratuais; notificações; procurações.
- Processos e demandas (acompanhamento, documentos, advogado responsável).
- Análise de contrato recebido com pontos de risco — apoio, não substitui advogado. [3–5]

**5.4.8 Administrativo**
- Dados e documentos da empresa (contrato social, alvarás, registros no CREA/CAU, seguros) com validade.
- Reuniões: pauta, ata (inclusive a partir de áudio), encaminhamentos que viram tarefas.
- Organograma e responsabilidades; procedimentos internos; patrimônio.
- Estratégia ✚: metas, indicadores da empresa, carteira de obras e capacidade, análise de viabilidade de novos contratos. [4–5]

### ÁREA 5 — COMUNICAÇÃO

**5.5.1 Conversas (WhatsApp)**
- Caixa de conversas dentro do sistema: enviar, receber, mídia, áudio (com transcrição), **agendar mensagem**, respostas-padrão, etiquetas, busca.
- Vínculo da conversa a obra, contato, fornecedor, funcionário; mensagem pode virar tarefa, nota, registro de diário, vale ou cotação.
- Envio de documentos emitidos pelo sistema.
- Tomada com três adaptadores: gateway aberto principal, gateway alternativo, API oficial. [4]

**5.5.2 E-mail**
- Contas conectadas: Gmail, Outlook, Yahoo, iCloud e qualquer provedor (padrão IMAP/SMTP; login OAuth onde houver).
- Leitura e classificação por obra/assunto; resumo e pendências; anexos vão para Arquivos.
- **Rascunhos**: o sistema cria o rascunho, o usuário avalia, ajusta e envia.
- **Padrões de e-mail** (script, sem IA): solicitar proposta · pedir revisão · pedir material · enviar cotação · enviar orçamento/proposta · cobrar pendência · enviar medição · solicitar pagamento · encaminhar documento · convocar reunião · enviar ata · notificar atraso · comunicar ocorrência · pedir documentação de subempreiteiro · responder contratante · agradecer/encerrar. Criar, editar e remover. [4]

**5.5.3 Contatos** — cadastro único de pessoas e empresas (contratantes, fornecedores, colaboradores, órgãos, profissionais), com histórico de conversas, e-mails e documentos. [1]

### ÁREA 6 — CONHECIMENTO

**5.6.1 Biblioteca**
- Organização: **área → subárea → documento → versão → fonte**. Áreas: técnica (normas ABNT, NRs, instruções técnicas), legal (federal, estadual, municipal), regulatória (órgãos e autarquias), trabalhista, contábil/tributária, jurídica, acervo da empresa.
- **Normas ABNT enviadas pelo usuário** (upload); leis e NRs públicas coletadas pelo monitor de fontes.
- Aplicabilidade por tipo e local de obra; checklists de conformidade; consulta com citação da fonte.
- Controle de versão e vigência; aviso de norma substituída. [D/3]

**5.6.2 Arquivos e visualizador**
- Organização por obra, disciplina e tipo; versões; validade; busca por conteúdo.
- **Visualizador interno**: PDF, DOCX, XLSX, DXF/DWG (camadas, medir, zoom), TXT, imagens (PNG, JPG, WEBP, TIFF), áudio e vídeo. [1–2]

**5.6.3 Padrões e identidade**
- **Identidade visual**: logotipo, cores, tipografia, cabeçalho/rodapé, carimbo de prancha, papel timbrado, assinatura de e-mail — aplicada a tudo que o sistema emite.
- **Padrões de documento**: lugar único para criar, editar e remover modelos — os dos módulos e os avulsos, padrão do sistema ou personalizados.
- **Importar modelo próprio**: o usuário envia o arquivo; a IA identifica os campos; o script monta o modelo.
- Padrões de e-mail, de mensagem e de nomenclatura/numeração. [3]

**5.6.4 Relatórios e emissões**
- Relatórios gerenciais por módulo e consolidados; históricos; extratos (financeiro, por obra, por funcionário, por contrato); recibos.
- Montador de relatório (escolher dados, período, formato); agendamento de envio periódico.
- Saída PDF/DOCX/XLSX; baixar ou compartilhar por e-mail/WhatsApp. [3–4]

### ÁREA 7 — SISTEMA

**5.7.1 Atena (assistente)** — barra de comando em todas as telas; executa só ferramentas registradas; "por que este número?"; entrada por voz; atende também por WhatsApp/Telegram. [D/3]

**5.7.2 Manual e ajuda** — manual completo dentro do sistema: por módulo e por procedimento, passo a passo com **mockups realistas** das telas nos fluxos mais trabalhosos; busca; ajuda contextual ("como faço isto?") em cada tela; trilha de primeiros passos; glossário técnico; novidades da versão. [5]

**5.7.3 Configurações** — conta · empresa · usuários e permissões · módulos · canais e avisos · contas de e-mail e WhatsApp · inteligência artificial (provedor, limite, consumo) · memória da Atena · fontes externas e rotinas · integrações · **telemetria e saúde do sistema** · backup · **exportar/importar tudo** · atividade (auditoria). [1–4]

---

## 6. Fluxo de dados

| Necessidade | Modo | Exemplos |
|---|---|---|
| Resposta na hora | Consulta imediata | abrir obra, salvar tarefa, lançar vale |
| Trabalho pesado | Fila assíncrona com andamento | ler projeto, gerar orçamento, emitir relatório, importar pacote |
| Atualização viva | Tempo real | painel, conversas, andamento de processamento, alertas |
| Reação entre módulos | Evento | orçamento aprovado → cria linha de base; medição aprovada → conta a receber |
| Rotina | Agendada | Olhar de Atena, fontes externas, backup, resumo diário |

Para a IA: catálogo de dados + contexto pronto por entidade + índice de busca → ela recebe o recorte exato, sem varrer o sistema.

---

## 7. Onde é script e onde é IA

| Tarefa | Script | IA |
|---|---|---|
| Quantitativos, custos, BDI, encargos, reajuste | ✔ | |
| Cronograma, caminho crítico, nivelamento de recursos | ✔ | |
| Documentos e e-mails por modelo | ✔ | |
| Checklists de regularização e aplicabilidade de normas | ✔ | |
| Alertas, prazos, validades, indicadores | ✔ | |
| Texto de PDF, camadas de DXF, conversão DWG→DXF, OCR | ✔ | |
| Detecção de mudança em fonte externa | ✔ | resumo do que mudou |
| Olhar de Atena | regras | leitura de texto livre |
| Interpretar desenho; ler memorial | | ✔ |
| Redigir trechos de peça técnica, contrato, parecer | | ✔ |
| Identificar campos de modelo enviado | | ✔ (script monta) |
| Classificar e-mail, mensagem, nota fiscal | regra | ✔ |
| Transcrever áudio | modelo local | |
| Entender pedido na barra de comando | | ✔ |

---

## 8. Fluxos principais

1. **Projeto → orçamento → proposta → contrato.**
2. **Contrato → obra**: EAP, cronograma, linha de base, checklist de regularização, mobilização de equipe.
3. **Abertura de obra**: CNO, ART, licenças, documentos de SST, comunicação prévia.
4. **Dia de obra**: foto/áudio/mensagem → diário → avanço → cronograma e custo → alertas.
5. **Medição → boletim → aprovação → solicitação de pagamento → recebimento.**
6. **Compra**: requisição → cotação → pedido → recebimento → nota → pagamento.
7. **Pessoa**: admissão → exames → treinamentos → alocação → ponto/vales → desligamento.
8. **Acidente**: registro → CAT → investigação → ação corretiva.
9. **Peça técnica**: modelo + dados → revisão → emissão → compartilhamento → versão.
10. **Fechamento mensal → pacote do contador.**
11. **Fonte externa mudou → nova versão → impacto → aviso.**
12. **Olhar de Atena (por turno) → apontamentos → ações.**
13. **Correção em revisão → memória → próxima entrega ajustada.**
14. **Encerramento de obra → termos → regularização final → lições aprendidas.**

---

## 9. Telas

**Estrutura:** trilho lateral com as 7 áreas (ícones); ao escolher a área, abrem-se seus módulos. Topo: barra da Atena · busca · avisos · perfil. Celular: barra inferior (Início · Obras · Conversas · Registrar · Mais) e botão de registro rápido (foto, áudio, nota, vale).

### Início
- **Painel** — faixa "Precisa de você" · cartões das obras (anel de avanço, semáforo de prazo e custo, efetivo) · linha do tempo geral · mini-mapa · apontamentos do Olhar de Atena · agenda da semana · indicadores em gráficos.
- **Central de revisão** — fila por tipo, com prévia e origem lado a lado.
- **Olhar de Atena** — linha do tempo dos turnos; apontamentos por gravidade; aceitar, adiar, descartar.
- **Agenda** — mês / semana / dia / lista.
- **Tarefas** — quadro · lista · por pessoa.

### Obras
- **Lista** — cartões · tabela · mapa.
- **Obra** (cabeçalho fixo com avanço, prazo, custo, efetivo) — abas: *Linha do tempo* · *Visão geral* · *EAP e frentes* · *Tarefas* · *Diário* · *Fotos* · *Equipe* · *Custos* · *Medições* · *Regularização* · *Imprevistos* · *Terceiros* · *Arquivos* · *Conversas* · *Encerramento*.
- **Planejamento** — abas: *Gantt* · *Físico-financeiro* · *Curva S* · *Multiobra* · *Recursos e histograma* · *Dimensionamento* · *Mobilização* · *Cenários*.
- **Medições** — abas: *Em andamento* (levantamento por item com fotos) · *Boletins* · *Solicitações de pagamento* · *Subempreiteiros*.
- **Regularização** — fluxo visual por obra (etapas em sequência com situação e prazo) · abas: *Checklist* · *CNO e aferição* · *ART/RRT* · *Licenças ambientais* · *Bombeiros* · *Outros órgãos* · *Vencimentos*.
- **Mapa** — obras com camadas (situação, equipe, rotas).

### Engenharia
- **Orçamentos** — lista · assistente: *Nível e entrada* → *Quantitativos* → *Composições e preços* → *Indiretos e logística* → *Encargos e BDI* → *Resultado* (sintético, analítico, ABC, cronograma, apontamentos). Bases: *Composições* · *Insumos* · *Cotações* · *Índices*.
- **Projetos e análises** — abas: *Lista mestra* · *Análise crítica* · *Compatibilização* · *Vistorias* · *Consultorias* · *ARTs* · *Ensaios*.
- **Documentos** — abas: *Emitidos* · *Em revisão* · *Novo* (por categoria) · *Analisar recebido*. Editor de revisão em duas colunas.

### Empresa
- **Comercial** — *Contratantes* · *Propostas* · *Negociações* (funil visual) · *Contratos*.
- **Suprimentos** — *Requisições* · *Cotações* · *Pedidos* · *Recebimento* · *Fornecedores* · *Almoxarifado* · *Equipamentos e frota*.
- **Financeiro** — *Visão geral* · *Lançamentos* · *A pagar* · *A receber* · *Fluxo de caixa* · *Conciliação* · *Viagens e adiantamentos* · *Extratos e recibos*.
- **Contábil e fiscal** — *Fechamento do mês* · *Notas fiscais* · *Retenções* · *Regime e limites* · *Obrigações* · *Certidões*.
- **Pessoas** — *Colaboradores* · *Admissão* · *Ponto e horas* · *Vales* · *Folha (prévia)* · *Férias e afastamentos* · *Desligamento*. Ficha do colaborador com linha do tempo.
- **SST** — *Exames* · *Treinamentos* · *EPI* · *Acidentes e CAT* · *PGR e programas* · *APR e permissões* · *Inspeções* · *Indicadores*.
- **Jurídico** — *Contratos* · *Prazos* · *Notificações* · *Processos* · *Procurações* · *Analisar contrato*.
- **Administrativo** — *Empresa* · *Documentos e validades* · *Reuniões e atas* · *Procedimentos* · *Patrimônio* · *Estratégia e metas*.

### Comunicação
- **Conversas** — lista de conversas · conversa aberta · painel do contato/obra · *Agendadas* · *Respostas-padrão*.
- **E-mail** — *Entrada* (por obra/assunto) · *Rascunhos da Atena* · *Enviados* · *Padrões de e-mail* · *Contas*.
- **Contatos** — lista e ficha com histórico.

### Conhecimento
- **Biblioteca** — árvore área/subárea · *Consulta* · *Aplicável à obra* · *Checklists* · *Atualizações* · *Enviar norma/lei*.
- **Arquivos** — navegação por obra/disciplina · visualizador · versões.
- **Padrões e identidade** — *Identidade visual* (com prévia ao vivo) · *Modelos de documento* · *Importar modelo* · *Padrões de e-mail e mensagem* · *Numeração*.
- **Relatórios** — galeria · montador · agendados · histórico de emissões.

### Sistema
- **Manual** — índice por módulo · procedimentos passo a passo · busca · primeiros passos.
- **Configurações** — abas da seção 5.7.3.
- **Entrada** — login · primeiro acesso guiado.

**Em todas as telas:** campo de notas · anexos · histórico de versões · compartilhar/exportar · ajuda contextual · estados de carregando/vazio/erro/sem conexão.

---

## 10. Experiência visual e movimento

- **Sistema de design próprio**: cores, tipografia, espaçamento, ícones e componentes padronizados; tema claro e escuro.
- **Organização**: hierarquia clara, divulgação progressiva (resumo visual → detalhe), densidade ajustável, mesma estrutura em todos os módulos.
- **Visualizações**: linha do tempo, Gantt, curva S, histograma, funil, fluxo de etapas, anéis de avanço, mapa, esquemas de processo, comparação antes/depois.
- **Movimento**: transições entre páginas e abas com continuidade; números que contam; gráficos que se desenham; cartões em cascata; arrastar e soltar com resposta física; microinterações em cada ação; assinatura visual da "Atena trabalhando"; celebração discreta ao concluir etapa.
- **Fluidez**: resposta instantânea com atualização otimista, esqueletos de carregamento, nada trava a tela.
- **Regras**: movimento com função, curto, respeitando a preferência de reduzir movimento; contraste e alvos de toque para uso em canteiro.

---

## 11. Ferramentas previstas (todas gratuitas; curadoria final em cada fase)

| Função | Opção principal | Observação |
|---|---|---|
| WhatsApp | Evolution API (aberta, sem plano pago) | WAHA como alternativa (núcleo gratuito com camada paga — limites a confirmar); ambas não oficiais, com risco de bloqueio do número. API oficial da Meta como terceira tomada (cobrada por mensagem). |
| E-mail | IMAP/SMTP universal | OAuth do Gmail/Outlook exige verificação do aplicativo quando o produto for público. |
| Mapas | MapLibre + base OpenStreetMap | Geocodificação gratuita limitada a ~1 consulta/s — suficiente. |
| DWG→DXF | LibreDWG / ODA File Converter | Validar fidelidade na Fase 2. |
| DXF | ezdxf (leitura) + visualizador web | — |
| PDF / OCR | PyMuPDF, pdfplumber / Tesseract ou PaddleOCR | Local, sem custo por uso. |
| Transcrição | Whisper local | Sem custo por uso. |
| Visualizadores | PDF.js, docx-preview, SheetJS | — |
| Memória e índice | Postgres + pgvector + busca textual | Sem serviço extra. |
| Fila e rotinas | fila sobre Redis/Postgres | — |
| Observabilidade | pilha aberta auto-hospedada | — |
| Gantt e gráficos | bibliotecas abertas | Curadoria na Fase 2. |
| Bases de preço | SINAPI (pública) | Outras tabelas públicas por UF. |

---

## 12. Alertas e limites

1. **ABNT** — normas entram por upload do usuário; o sistema guarda a cópia dele e os checklists redigidos por nós.
2. **WhatsApp não oficial** — gratuito, porém sujeito a bloqueio; recomenda-se número dedicado da empresa.
3. **Login por assinatura na IA** — padrão recomendado é cobrança por consumo.
4. **Responsabilidade técnica** — peças técnicas são minutas para o responsável técnico; jurídico e contábil são apoio.
5. **Leitura de projeto** — precisão a comprovar em teste real; todo item tem confiança e passa por conferência.
6. **Folha e obrigações fiscais** — o sistema confere e organiza; a transmissão oficial continua com o contador.

---

## 13. Fases

| Fase | Entrega |
|---|---|
| **0 — Demo** | Casca navegável com dados fictícios e movimento: Painel, Obra com linha do tempo, Gantt multiobra, mapa, assistente de Orçamento, emissão de memorial e contrato, Conversas, Biblioteca, Olhar de Atena, barra da Atena. |
| **1 — Fundação** | Núcleo completo, sistema de design, Obras, Painel, Agenda, Tarefas, Contatos, Arquivos e visualizador. |
| **2 — Planejamento e custos** | Planejamento, Orçamentos, pipeline de arquivos, motor de IA, fila de revisão, mapa, exportar/importar. |
| **3 — Peças e conformidade** | Documentos, Padrões e identidade, Biblioteca, monitor de fontes, Regularização, Medições, Comercial, contratos, memória, Atena, Relatórios. |
| **4 — Empresa e canais** | Conversas, E-mail, Financeiro, Pessoas, SST, Suprimentos, Olhar de Atena, perfis de acesso. |
| **5 — Engenharia e gestão** | Projetos e análises, Contábil e fiscal, Jurídico completo, Administrativo e estratégia, Manual completo. |
| **6 — Escala** | Multiempresa, planos, avaliação de modelos, realimentação por histórico. |
| **Futuro** | BIM, prospecção, app offline de canteiro, integração contábil, calendários externos. |

Cada fase começa com curadoria de projetos bem avaliados no GitHub para as ferramentas internas; o aproveitado é incorporado e renomeado.

---

## 14. Normas ABNT a fornecer

**Necessárias já para o manual executivo**
- NBR 16633 (partes 1 a 4) — orçamento e formação de preços em infraestrutura
- NBR 12721 — custos de construção de edificações
- NBR 17505 (todas as partes) — armazenamento de líquidos inflamáveis e combustíveis
- NBR 16280 — reformas em edificações
- NBR 13752 — perícias de engenharia na construção civil
- NBR 10719 — apresentação de relatório técnico

**Para as fases seguintes** (checklists de análise e peças técnicas)
- Projeto e desenho: NBR 16636 (1 e 2), NBR 6492
- Estruturas e execução: NBR 6118, 6122, 14931, 12655, 8800
- Instalações: NBR 5410, 5419, 5626, 8160, 10844
- Incêndio: NBR 13714, 12693, 17240, 9077
- Canteiro e segurança: NBR 12284, 7678
- Inspeção, manutenção e desempenho: NBR 16747, 5674, 14037, 15575
- Acessibilidade: NBR 9050
- Avaliações: NBR 14653 (1 e 2)

> Confirmar edição vigente de cada uma no catálogo da ABNT antes de comprar. Leis, NRs e resoluções públicas eu mesmo coleto.

---

## 15. Pente fino — decisões de integração (v0.4)

Revisão das interdependências entre módulos. Estas regras fecham as brechas encontradas e **valem para o front-end desde a demo**.

### 15.1 Dono único de cada dado (elimina duplicidade entre módulos)

| Dado | Dono | Quem apenas exibe/consome |
|---|---|---|
| Pessoa e empresa (qualquer papel) | **Contatos** | Comercial (contratante), Suprimentos (fornecedor), Pessoas (colaborador), Jurídico |
| Vínculo de trabalho do colaborador | **Pessoas** | SST, Planejamento, Financeiro |
| Contrato (com contratante, subempreiteiro, trabalho) | **Jurídico** | Comercial, Obras, Medições |
| Tarefa (da empresa ou de obra) | **Tarefas** — uma entidade só, com obra opcional | Obras (aba Tarefas), Agenda |
| Vale e adiantamento | **Pessoas** | Financeiro (vira lançamento por evento) |
| Exame, ASO, treinamento, EPI | **SST** | Pessoas (ficha do colaborador) |
| Lançamento financeiro | **Financeiro** | Obras (aba Custos), Contábil |
| Item de EAP | **Obras** | Orçamentos, Planejamento, Medições, Financeiro |
| Atividade de cronograma e alocação | **Planejamento** | Obras, Mapa, Painel |
| Viagem/hospedagem prevista | **Planejamento** (mobilização) | Financeiro registra o realizado |
| Licença, certidão, ART, alvará (o registro) | módulo de origem | **Prazos e validades** consolida os vencimentos |
| Arquivo | **Arquivos** | todos, por vínculo |
| Checklist (modelo) | **Biblioteca** | Regularização, SST, Projetos, Orçamentos aplicam |

### 15.2 EAP como espinha dorsal
Um mesmo item de EAP liga: linha do orçamento ↔ atividade do cronograma ↔ item de medição ↔ centro de custo ↔ registro do diário. Sem esse elo, orçado × planejado × medido × realizado não fecham. Toda tela que lista serviços usa o mesmo seletor de EAP.

### 15.3 Sentido único entre módulos (sem dependência circular)
`Orçamento aprovado → Obras/Planejamento (linha de base)` · `Diário (avanço) → Planejamento` · `Planejamento (avanço) → Medições` · `Medição aprovada → Financeiro (a receber)` · `Financeiro (realizado) → Obras (custos, leitura)` · `Vale (Pessoas) → Financeiro` · `Pedido recebido (Suprimentos) → Financeiro (a pagar)`. Nenhum módulo grava em dado de outro: emite evento e o dono reage.

### 15.4 Novo serviço do núcleo: Prazos e validades
Registro central de tudo que vence (licenças, ASO, treinamentos, certidões, contratos, seguros, ART, CA de EPI, garantias). Alimenta Agenda, Painel e Olhar de Atena. Os módulos apenas declaram "este registro vence em tal data".

### 15.5 Uma tela, dois escopos
Medições, Regularização, Custos, Tarefas, Arquivos, Conversas e Planejamento existem como módulo (todas as obras) e como aba dentro da obra. É **o mesmo componente**, com filtro de obra opcional — nunca duas implementações.

### 15.6 Padrões transversais obrigatórios em toda tela
- **Moldura de registro**: notas · anexos · versões · atividade · compartilhar/exportar · ajuda — um único componente envolve todo detalhe.
- **Ciclo de vida único**: rascunho → em revisão → aprovado → emitido → cancelado/arquivado (mesmas cores e rótulos em todos os módulos).
- **Permissão**: toda rota e toda ação passam por `can(ação, recurso)`; na demo responde sempre "sim".
- **Tarefa demorada**: todo processamento usa o mesmo acompanhador de andamento (etapas, percentual, resultado), alimentado por canal em tempo real.
- **Item de revisão**: formato único (origem, confiança, valor sugerido, valor aprovado).
- **Menu e paleta de comandos** nascem do manifesto dos módulos, nunca de lista fixa.
- **Formatação**: dinheiro em centavos, datas ISO com fuso (obras em fusos diferentes), unidades de medida — sempre pelo utilitário de localização. Textos da interface em dicionário único.
- **Marca por empresa**: cores e logotipo da interface por tokens (permite revender com outra marca).
- **Responsivo**: tabela vira cartões no celular; Gantt vira linha do tempo vertical.
- **Aplicativo instalável (PWA)** desde o início; captura sem conexão em canteiro fica para fase futura, mas a estrutura já prevê.

### 15.7 Ajuste de fases
"Custos por obra" (Fase 2) depende de lançamentos, que estavam na Fase 4. **Correção:** o registro básico de lançamentos de custo do Financeiro sobe para a Fase 2; contas a pagar/receber, caixa e conciliação continuam na Fase 4. Da mesma forma, o serviço Prazos e validades e Contatos entram na Fase 1.

### 15.8 Contrato entre front-end e back-end
O front-end fala só com `/api/v1`, por um cliente tipado por recurso. O back-end provisório da demo e o definitivo respondem ao mesmo contrato — trocar um pelo outro não toca em tela.
