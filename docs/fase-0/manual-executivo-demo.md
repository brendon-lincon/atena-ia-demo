# Atena IA — Manual Executivo da Fase 0 (Demo)

> **Para o agente executor.** Siga este manual na ordem. Não improvise arquitetura; em caso de dúvida, releia `docs/01-arquitetura-proposta.md` (principalmente a seção 15). Se algo aqui for impossível, pare e registre em `docs/fase-0/pendencias.md` em vez de contornar com gambiarra.

## 0. Missão

Construir, no repositório `atena-ia`:

1. **O front-end definitivo** do sistema — estrutura, sistema de design, movimento e todas as telas. Ele não será refeito: nas fases seguintes só troca a fonte de dados.
2. **Um back-end provisório mínimo** (`apps/demo-api`) que responde ao contrato `/api/v1` — será descartado.
3. **Um banco temporário (SQLite)** povoado com dados fictícios realistas.

Objetivo de negócio: o cliente (mestre de obras, dono de construtora de obras industriais, nunca usou IA, perfeccionista, hoje vira noites em Word e Excel) deve abrir o link, clicar livremente e **se impressionar**: tudo sob controle num lugar só, visual, fluido, rápido.

**Não faz parte desta fase:** IA real, WhatsApp/e-mail reais, leitura real de arquivos, cálculo normativo real, multiempresa, testes de carga.

## 1. Regras invioláveis

1. Identificadores, nomes de arquivo, rotas e chaves em **inglês**. Comentários, documentação e **todo texto visível** em **português do Brasil**, com terminologia técnica de construção e engenharia civil (não coloquial).
2. SOLID, código enxuto, sem gambiarra, sem código morto, sem `any`, sem `// TODO` solto (pendência vai para `pendencias.md`).
3. **Módulo não importa de outro módulo.** Só de `core/` e `design/`. Integração entre módulos é por registro de contribuições (seção 5.3).
4. **Componente não busca dado direto.** Tela → hook do módulo → cliente da API. Nenhum `fetch` em componente.
5. **Nada fixo no código**: cores, espaçamentos, durações e textos vêm de tokens e do dicionário; menu vem dos manifestos.
6. Regra de negócio e cálculo ficam em funções puras em `lib/` do módulo, nunca dentro de componente.
7. `localStorage` só para preferência de interface (tema, densidade, última aba). Dado de negócio sempre via API.
8. Sem `lorem ipsum`, sem nome de empresa real como contratante, sem imagem externa por link.
9. Cada etapa termina com: `typecheck`, `lint` e `build` limpos, zero erro no console, e a aplicação demonstrável.
10. Git: trabalhar no ramo `fase-0/demo`; commits pequenos em português no padrão `tipo(escopo): descrição`; um PR por etapa para `main`, mesclado após as verificações passarem.

## 2. Estrutura do repositório

```
atena-ia/
├─ apps/
│  ├─ web/            # front-end definitivo
│  └─ demo-api/       # back-end provisório (descartável)
├─ brand/             # identidade e comunicação visual (ver brand/README.md)
├─ seed/              # dados fictícios em JSON (fonte do banco temporário)
├─ docs/
├─ README.md          # como rodar (PT-BR)
└─ package.json       # scripts raiz: dev, build, lint, typecheck, seed
```

`npm run dev` na raiz deve subir API (porta 8787) e web (porta 5173, com proxy de `/api` para a API).

## 3. Tecnologias

**Web:** Vite · React · TypeScript (modo estrito) · React Router · TanStack Query (dados do servidor) · Zustand (estado de interface) · Tailwind CSS v4 · shadcn/ui (Radix) · Motion (`motion/react`) · TanStack Table · React Hook Form + Zod · date-fns (pt-BR) · Recharts · MapLibre GL · cmdk · lucide-react · vite-plugin-pwa.

**Demo API:** Python 3.12 · FastAPI · Uvicorn · `sqlite3` da biblioteca padrão (sem ORM). Gerenciar com `uv`.

Use sempre a versão estável mais recente e fixe no arquivo de travamento. Não adicione biblioteca fora desta lista sem registrar o motivo em `pendencias.md`. Todas devem ser gratuitas e de código aberto.

## 4. Contrato da API (`/api/v1`)

Este contrato é o que sobrevive à demo. O front-end fala com ele por um cliente tipado; o back-end definitivo responderá igual.

**Convenções:** JSON; campos em `camelCase`; `id` texto (UUID); `createdAt`/`updatedAt` ISO 8601 com fuso; dinheiro em **centavos inteiros** (`amountCents`); percentuais de 0 a 100; erro sempre `{ "error": { "code", "message" } }`; autenticação por `Authorization: Bearer`.

| Rota | Função |
|---|---|
| `POST /auth/login` · `GET /auth/me` · `POST /auth/logout` | Sessão (token de demonstração) |
| `GET /modules` | Módulos habilitados e permissões do usuário |
| `GET /{resource}` | Lista. Parâmetros: `q`, `filter[campo]=valor`, `sort=campo,-campo`, `page`, `pageSize`. Resposta `{ data, meta: { total, page, pageSize } }` |
| `GET /{resource}/{id}` · `POST /{resource}` · `PATCH /{resource}/{id}` · `DELETE /{resource}/{id}` | Registro |
| `POST /jobs` · `GET /jobs/{id}` | Tarefa demorada: `{ id, type, status, progress, stageIndex, stages[], result }` |
| `GET /events` | Canal em tempo real (SSE). O front-end deve funcionar também por consulta periódica |
| `POST /atena/command` | `{ text, context }` → `{ reply, actions[], sources[] }` |
| `GET /search?q=` | Busca global agrupada por tipo |
| `POST /demo/reset` | Recria o banco a partir de `seed/` |

**Recursos (coleções):** `company`, `users`, `contacts`, `obras`, `eap-items`, `schedule-activities`, `allocations`, `tasks`, `diary-entries`, `photos`, `incidents-site` (imprevistos), `measurements`, `measurement-items`, `compliance-items`, `budgets`, `budget-items`, `compositions`, `documents`, `document-templates`, `proposals`, `contracts`, `cost-entries`, `receivables`, `payables`, `employees`, `advances`, `health-exams`, `trainings`, `work-accidents`, `purchase-requests`, `quotes`, `conversations`, `messages`, `emails`, `email-templates`, `library-items`, `files`, `deadlines`, `insights`, `review-items`, `notes`, `activity`, `notifications`, `calendar-events`, `reports`.

Todo registro pode ter `obraId`, `status` e `eapItemId`. Notas, anexos, versões e atividade são recursos comuns filtrados por `recordType` + `recordId`.

### 4.1 Back-end provisório — implementação

- Uma tabela: `records(collection TEXT, id TEXT, data JSON, PRIMARY KEY(collection,id))`. As rotas genéricas leem e gravam nela; filtros, busca e ordenação em Python sobre o JSON.
- Na subida: se o banco não existir, cria e carrega todos os `seed/*.json` (um arquivo por coleção).
- **Datas relativas:** no seed, datas são escritas como `"@d-12"`, `"@d+30"`, `"@h-3"` (dias/horas em relação a agora) e convertidas no carregamento — a demo nunca fica "velha".
- `jobs`: o andamento é calculado pelo tempo decorrido sobre um roteiro em `seed/_job-scripts.json` (etapas, duração de cada uma, resultado final). Nada é processado de verdade.
- `atena/command`: casa palavras-chave com `seed/_atena-intents.json`; sem correspondência, devolve resposta-padrão educada indicando o que a Atena sabe fazer.
- `events`: envia batimento e as notificações roteirizadas.
- Alvo: até ~300 linhas. Sem camadas, sem abstração — é descartável. O que **não** é descartável é o contrato.

## 5. Arquitetura do front-end

```
apps/web/src/
├─ app/        # provedores, roteador, casca (layout), tratamento de erro
├─ core/       # api (cliente tipado), auth, permissions (can), module-registry,
│              # i18n (dicionário pt-BR), format (moeda, data, unidade), realtime, jobs, theme
├─ design/
│  ├─ tokens.css          # cores, tipografia, raio, sombra, espaçamento, movimento
│  ├─ ui/                 # componentes-base (shadcn)
│  └─ patterns/           # padrões da Atena (seção 6.3)
└─ modules/<area>/<module>/
   ├─ manifest.ts   # id, área, rótulo, ícone, rotas, abas, permissões, comandos, contribuições
   ├─ api.ts        # hooks de dados (TanStack Query)
   ├─ schemas.ts    # esquemas Zod = tipos
   ├─ lib/          # funções puras
   ├─ pages/ · components/
```

### 5.1 Casca
- **Computador:** trilho lateral com as 7 áreas (ícone + rótulo ao passar o mouse); painel secundário com os módulos da área; barra superior com barra da Atena (também `Ctrl/⌘+K`), busca, avisos e perfil; área de conteúdo com cabeçalho de página e trilha de navegação.
- **Celular:** barra inferior (Início · Obras · Conversas · Registrar · Mais); "Registrar" abre folha com foto, áudio, nota e vale; cabeçalhos compactos.
- Menu, rotas e paleta de comandos são gerados a partir dos manifestos.

### 5.2 Áreas e módulos (ids)
`inicio`: `dashboard`, `review`, `athena-watch`, `agenda`, `tasks` · `obras`: `works`, `planning`, `measurements`, `compliance`, `map` · `engenharia`: `budgets`, `engineering`, `documents` · `empresa`: `commercial`, `procurement`, `finance`, `accounting`, `people`, `safety`, `legal`, `admin` · `comunicacao`: `conversations`, `email`, `contacts` · `conhecimento`: `library`, `files`, `standards`, `reports` · `sistema`: `athena`, `manual`, `settings`.

### 5.3 Contribuições entre módulos
O manifesto declara `contributes`. Exemplo: `measurements` contribui com a aba "Medições" para `work.tabs`; `compliance`, `planning`, `finance`, `files`, `conversations` e `tasks` fazem o mesmo. A página da obra apenas renderiza as abas registradas, passando `obraId`. Assim o mesmo componente serve ao módulo (todas as obras) e à aba (uma obra). Outros pontos de extensão: `dashboard.cards`, `command.actions`, `record.actions`, `contact.tabs`, `employee.tabs`.

### 5.4 Padrões transversais (construir antes das telas)
`can(action, resource)` · ciclo de vida único com `StatusBadge` · `RecordShell` (notas, anexos, versões, atividade, compartilhar, ajuda) em todo detalhe · `JobTracker` para toda tarefa demorada · `ReviewPanel` para todo item de revisão · seletor único de EAP · estados de carregando (esqueleto), vazio (com próxima ação), erro e sem conexão em toda tela · PWA instalável.

### 5.5 Telas genéricas por configuração
Para os módulos sem tela sob medida, o manifesto descreve cada aba: recurso, colunas, filtros, visões disponíveis (tabela, cartões, quadro, linha do tempo, calendário), campos do formulário e do detalhe. `DataView` + `EntityPage` renderizam tudo. **Nenhum módulo fica sem tela.**

## 6. Sistema de design

### 6.1 Identidade
Sóbria, técnica, premium. Muito espaço, hierarquia forte, cor usada com intenção.

A paleta-base é a escala de azul-petróleo definida pelo Lincon (do mais escuro ao mais claro):

`blue-950 #04233F` · `blue-800 #154470` · `blue-600 #2F6AA3` · `blue-500 #4C8BBD` · `blue-400 #6FADD3` · `blue-200 #A3CFE6`

O sistema é essencialmente **azul + neutros frios (branco, cinzas azulados, quase-preto)**. Amarelo, verde e vermelho aparecem só como sinal (atenção, sucesso, perigo) e em detalhes pontuais — nunca como cor de área.

| Token | Claro | Escuro |
|---|---|---|
| Fundo | `#F4F7FA` | `#04172B` |
| Superfície | `#FFFFFF` | `#04233F` |
| Superfície elevada | `#FFFFFF` | `#0B3055` |
| Borda | `#DCE5EE` | `#154470` |
| Texto | `#04233F` | `#EAF3FA` |
| Texto secundário | `#55708C` | `#A3CFE6` |
| **Primária** | `#2F6AA3` | `#6FADD3` |
| Primária forte (cabeçalhos, trilho lateral) | `#154470` | `#04233F` |
| Primária suave (fundos de destaque, seleção) | `#E6F1F8` | `#154470` |
| Gráficos (série em ordem) | `#154470` `#2F6AA3` `#4C8BBD` `#6FADD3` `#A3CFE6` | os mesmos, do claro ao escuro |
| **Atena (luz azul)** — só para elementos de IA: gradiente luminoso com brilho | `#4C8BBD → #A3CFE6` | `#6FADD3 → #EAF3FA` |
| Sucesso / Atenção / Perigo | `#1E9E5A` / `#E0A526` / `#D64545` | `#3CCB82` / `#F2C14E` / `#F07070` |

Gradientes da marca: `#04233F → #2F6AA3` (fundos de destaque, login) e `#2F6AA3 → #A3CFE6` (avanço, gráficos). Garanta contraste mínimo AA em texto. O âmbar é reservado a **atenção**; nunca usá-lo para marcar elementos da Atena, para não ser lido como alerta.

Tipografia — decisão fechada: **Inter** em todo o sistema, em todos os aparelhos (mesma aparência em Windows, Mac e celular). É gratuita (licença SIL OFL, uso comercial e redistribuição permitidos) e a mais próxima do estilo da San Francisco do macOS.
- **Arquivos dentro do projeto:** `brand/typography/inter/` com a Inter variável (`.woff2`, romana e itálica) e o arquivo de licença; `brand/typography/jetbrains-mono/` idem. O front-end carrega esses arquivos localmente (`@font-face`, `font-display: swap`, pré-carregamento da romana). **Nenhuma fonte vem de serviço externo** e nenhum arquivo da San Francisco entra no repositório.
- **Pilha:** `"Inter", system-ui, "Segoe UI", sans-serif` — a fonte do sistema só aparece na fração de segundo antes de a Inter carregar.
- **Ajuste para o visual do macOS:** ativar o eixo de tamanho óptico da Inter variável (`font-optical-sizing: auto`) e os recursos `"cv11", "ss03"`; espaçamento entre letras levemente negativo em títulos grandes; números tabulares (`tnum`) em tabelas e indicadores.
- **Números e códigos:** JetBrains Mono (também OFL, também local).
- Uma família só: hierarquia por peso (400/500/600/700) e tamanho.
- A letra do logotipo "ATENA" é exclusiva do logotipo; não é usada em nenhum texto da interface.

Raio 10–16 px; sombras suaves em duas camadas; grade de 4 px. Tema claro e escuro, seguindo o sistema, com alternância animada. Tudo em variáveis CSS para permitir marca por empresa.

### 6.1.1 Marca (`brand/`)
Siga `brand/README.md`. Nesta fase, obrigatório:
- Separar `brand/source/logo-original.webp` em símbolo, logotipo e assinatura, vetorizados em SVG.
- Gerar as versões `mono-black`, `navy`, `white`, `on-navy` e `duotone`, e os arranjos horizontal, vertical, com e sem assinatura.
- Gerar ícones: favicon, PWA (incl. mascarável), Apple, macOS (`.icns`) e Windows (`.ico`).
- Criar `brand/colors/tokens.json` e gerar dele o `tokens.css` do front-end.
- Criar o símbolo animado (entrada no login, carregamento, "Atena pensando") em `brand/motion/`.
- Criar a estrutura e os moldes-base de `documents/` e `marketing/` (imagem de compartilhamento e um banner), e redigir `brand/guidelines.md`.

Aplicação no sistema: lockup horizontal no login · símbolo no trilho lateral e no orbe da Atena · logotipo no cabeçalho do menu expandido · ícones no PWA e na aba do navegador. Versão `navy` no tema claro, `white` no escuro. O logotipo do **cliente** (empresa usuária) é outro: vem de `seed/company.json` e só aparece nos documentos emitidos.

### 6.2 Movimento (tokens)
- Durações: 120 ms (micro) · 200 ms (padrão) · 320 ms (ênfase) · 500–800 ms (dados).
- Curvas: padrão `cubic-bezier(0.2, 0, 0, 1)`; mola `stiffness 260, damping 28`.
- Troca de página: esmaecer + deslocar 8 px. Abas: indicador com `layoutId`. Listas e cartões: cascata de 40 ms. Números: contagem. Gráficos: traçado progressivo. Anéis e barras de avanço: preenchimento. Cartão → detalhe: transição compartilhada. Arrastar e soltar com resposta física. Botões e cartões com resposta ao toque.
- **Assinatura da Atena:** orbe/anel de luz azul-clara com gradiente animado; pulsa ao "pensar"; um brilho azul-claro percorre o que ela acabou de preencher.
- Respeitar `prefers-reduced-motion` (troca por esmaecimento simples). Nenhuma animação bloqueia interação; manter 60 qps (animar só `transform` e `opacity`).

### 6.3 Padrões (`design/patterns`)
`PageHeader` · `RecordShell` · `DataView` · `EntityPage` · `StatusBadge` · `KpiCard` · `ProgressRing` · `Timeline` (horizontal multi-trilha e vertical) · `GanttChart` · `SCurve` · `Histogram` · `FunnelBoard` · `FlowSteps` (etapas em sequência com situação) · `StepWizard` · `JobTracker` · `ReviewPanel` · `ConfidenceChip` · `SourceTag` (origem do dado) · `DocumentPage` (folha A4 com identidade) · `FileViewer` · `MapView` · `CommandPalette` · `AtenaOrb` · `InsightCard` · `NotesPanel` · `ShareMenu` · `EmptyState` · `Skeleton`.

Crie a rota interna `/design` com a vitrine de todos os padrões nos dois temas — é a referência visual do projeto.

`GanttChart`: implementação própria em SVG/DOM (barras, dependências, marco, linha de hoje, linha de base fantasma, zoom dia/semana/mês, agrupamento por obra/frente, virtualização de linhas). No celular vira linha do tempo vertical.

`MapView`: MapLibre com base aberta gratuita sem chave (OpenFreeMap); se indisponível, mosaicos padrão do OpenStreetMap. Marcadores animados por situação, agrupamento, linhas de rota entre obras.

## 7. Dados fictícios (`seed/`)

**Empresa:** CGA Acabamentos (nome e logotipo configuráveis em `seed/company.json`), sede em Campo Grande/MS. **Usuário de demonstração:** perfil Dono; credenciais apenas em `seed/users.json`; a tela de login tem o botão "Entrar na demonstração" que as preenche.

**Contratantes fictícios:** Atlas Distribuidora de Combustíveis S.A. · Vértice Montagens Industriais Ltda.

| Obra | Local | Tipo | Valor | Período | Físico (real/prev.) | Custo | Efetivo |
|---|---|---|---|---|---|---|---|
| Base de Distribuição Candeias | Candeias/BA | Obra nova industrial | R$ 18,4 mi | @d-103 → @d+228 | 34% / 37% | +2,1% | 46 |
| Reforma da Base Cuiabá | Cuiabá/MT | Reforma | R$ 3,2 mi | @d-74 → @d+34 | 71% / 68% | no orçado | 18 |
| Serviços civis — Parque de tanques (Vértice) | Candeias/BA | Subcontrato | R$ 2,1 mi | @d-60 → @d+75 | 52% / 50% | −0,8% | 14 |
| Base de Distribuição Osasco | Osasco/SP | Obra nova — em mobilização | R$ 9,7 mi | início @d+58 | 0% | — | 0 |
| Base de Distribuição Paulínia | Paulínia/SP | Concluída — em encerramento | R$ 12,9 mi | encerrada @d-180 | 100% | +1,4% | 0 |

**EAP de Candeias (frentes):** Terraplenagem e drenagem (terceiro, 100%) · Bases dos tanques — 12 un. (7 concluídas) · Bacia e muros de contenção · Bases de apoio de tubulação · Casa de gerador · QGBT e CCM · Rede de hidrantes e abrigos · Edificações (escritório, guarita, sala de motoristas) · Plataformas de carregamento e descarga · Pavimentação e urbanização.

**Volumes mínimos:** 60 atividades de cronograma com dependências · 34 colaboradores (funções: mestre, encarregado, pedreiro, carpinteiro, armador, servente, operador, técnico de segurança) com alocações que **gerem um conflito** (equipe de armação em Cuiabá e Candeias na mesma semana) · 45 registros de diário com 120 fotos · 4 medições em Cuiabá (a nº 4 "pronta para enviar") · 2 orçamentos (um aprovado, um em revisão com 38 itens e confiança variada) · 25 itens de regularização (Osasco com CNO pendente e LI emitida) · 40 lançamentos de custo · 12 vales · 30 exames (2 ASO vencendo em 7 dias) · 20 treinamentos · 8 conversas com 60 mensagens · 15 e-mails · 16 padrões de e-mail · 40 itens de biblioteca (NRs, leis, NBRs apenas como referência) · 20 documentos emitidos · 12 modelos de documento · 30 prazos · 25 tarefas · 12 apontamentos do Olhar de Atena.

**Fotos:** gerar marcadores locais (gradiente + ícone + legenda) em `apps/web/public/demo/photos/`; fotos reais podem ser colocadas ali depois, com o mesmo nome.

**Narrativa que os dados devem sustentar (é o roteiro da apresentação):**
1. *Precisa de você:* aprovar o quantitativo da Casa de Gerador (Candeias) · enviar a medição nº 4 de Cuiabá · 2 ASO vencendo.
2. *Olhar de Atena:* nota no diário citando falta de aço CA-50 12,5 mm → sugere requisição · conflito da equipe de armação na semana que vem · condicionante da licença de operação vence em 20 dias · hospedagem da mobilização de Osasco não está no orçamento · atividade crítica "Concretagem base TQ-08" 3 dias atrasada.
3. *Orçamento:* projeto enviado vira planilha conferível em segundos, com dois itens esquecidos apontados.
4. *Documento:* memorial descritivo e contrato saem preenchidos, com a identidade da empresa.

Todos os valores devem ser coerentes entre si (soma dos itens = total; avanço da obra = média ponderada das frentes; medido ≤ contratado).

## 8. Telas sob medida

Cada tela abaixo deve ter os quatro estados (carregando, vazia, erro, com dados) e versão para celular.

**8.1 Login** — metade com a marca e um fundo animado sutil (linhas de planta/malha em movimento lento), metade com o formulário. Entrada com o orbe da Atena.

**8.2 Painel** — saudação com data · faixa "Precisa de você" (cartões com ação direta que abrem a Central de revisão) · cartões das obras (anel de avanço, semáforos de prazo e custo, efetivo, minigráfico) · linha do tempo geral da empresa (todas as obras, marcos e vencimentos) · minimapa · apontamentos do Olhar de Atena · agenda da semana · indicadores em gráficos. Tudo entra em cascata; números contam.

**8.3 Obras (lista)** — alternância cartões / tabela / mapa; filtros por situação, contratante e UF.

**8.4 Obra (detalhe)** — cabeçalho fixo (nome, contratante, local, anel de avanço, prazo, custo, efetivo, ações). Abas próprias: **Linha do tempo** (trilhas: fases, marcos, documentos, medições, desembolsos, efetivo, ocorrências — com zoom e painel lateral ao clicar) · Visão geral · EAP e frentes (árvore com avanço por item) · Diário (linha do tempo por dia: clima, efetivo, serviços, ocorrências, fotos, notas) · Fotos (galeria por frente e data, visualizador com dados da foto) · Equipe · Imprevistos · Terceiros · Encerramento. Abas vindas de contribuições: Tarefas, Planejamento, Custos, Medições, Regularização, Arquivos, Conversas.

**8.5 Planejamento** — abas: Gantt (por obra, com dependências, caminho crítico destacado, linha de base) · Físico-financeiro (barras por período + acumulado) · Curva S · **Multiobra** (todas as obras sobrepostas) · Recursos (histograma por função; conflito destacado em vermelho com sugestão) · Dimensionamento (serviço × produtividade → equipe e prazo, com controles deslizantes e recálculo ao vivo) · Mobilização (deslocamentos, hospedagem, alimentação por obra) · Cenários.

**8.6 Mapa** — tela cheia; marcadores por situação; painel da obra ao clicar; camadas de equipe e rotas a partir da sede.

**8.7 Orçamentos** — lista por situação. **Assistente em 6 passos:**
1. *Nível e entrada* — escolher o nível (estimativa de custo, preliminar, analítico, sintético) e enviar projeto/memorial ou colar listagem.
2. *Quantitativos* — ao enviar, `JobTracker` mostra as etapas (lendo arquivo → identificando elementos → calculando quantitativos → verificação cruzada); depois a tabela item a item com `ConfidenceChip`, `SourceTag` (arquivo e página) e edição em linha; itens de baixa confiança destacados.
3. *Composições e preços* — composição por item, origem do preço e data-base.
4. *Indiretos e logística* — administração local, canteiro, mobilização (passagens, hospedagem, alimentação), EPI, exames.
5. *Encargos e BDI* — parâmetros com recálculo ao vivo e memória de cálculo visível.
6. *Resultado* — total com contagem animada, planilha sintética e analítica, curva ABC, cronograma físico-financeiro, **apontamentos da verificação cruzada** (itens esquecidos) e ações: exportar, gerar proposta, enviar para aprovação.

O cálculo do passo 5–6 fica em função pura em `modules/engenharia/budgets/lib/` (provisória; no sistema definitivo passa ao servidor).

**8.8 Central de revisão** — fila à esquerda; à direita o item com origem lado a lado (prévia do arquivo × valor sugerido), aprovar / ajustar / rejeitar, com animação de conclusão.

**8.9 Documentos** — Emitidos · Em revisão · Novo (galeria por categoria) · Analisar recebido. Geração: escolher tipo e obra → a Atena preenche (brilho azul-claro nos campos) → **editor de revisão** em duas colunas (folha A4 com a identidade da empresa × origem dos dados e sugestões) → aprovar → exportar (impressão em PDF do navegador com folha de estilo de impressão) ou compartilhar (`ShareMenu`: baixar, e-mail, WhatsApp — simulados, com confirmação).

**8.10 Medições** — levantamento por item de EAP (contratado, acumulado, período, saldo) com fotos e registros do diário vinculados · boletim em folha A4 · solicitação de pagamento.

**8.11 Regularização** — `FlowSteps` por obra (CNO → ART → alvará → licenças ambientais LP/LI/LO → bombeiros → demais órgãos) com situação e prazo; checklist com documento comprobatório; vencimentos.

**8.12 Olhar de Atena** — linha do tempo dos turnos (manhã, tarde, noite); `InsightCard` por gravidade com origem ("nota do diário de @d-1, Candeias"), ação sugerida e botões aceitar / adiar / descartar.

**8.13 Barra da Atena** — paleta de comandos: navegar, criar, perguntar. Respostas com fonte e ações clicáveis. Sugestões iniciais visíveis (ex.: "Quanto gastei com hospedagem em Cuiabá?", "Abrir orçamento da Casa de Gerador", "Quais ASO vencem este mês?").

**8.14 Conversas** — três colunas (lista, conversa, painel do contato/obra); mensagens de texto, foto e áudio com transcrição; agendar mensagem; respostas-padrão; "transformar em" tarefa, nota, registro de diário ou vale. Envio simulado.

**8.15 Biblioteca** — árvore área → subárea; cartão do documento com versão, vigência e fonte; filtro "aplicável à obra"; checklists; envio de norma (simulado).

**8.16 Padrões e identidade** — editor de identidade visual com **prévia ao vivo** numa folha A4; galeria de modelos; importação de modelo (simulada com `JobTracker`).

## 9. Demais módulos (telas por configuração)

Implementar pelo mecanismo da seção 5.5, com as abas listadas na seção 9 de `01-arquitetura-proposta.md` e dados do seed: Agenda (calendário), Tarefas (quadro), Projetos e análises, Comercial (funil em `FunnelBoard`), Suprimentos, Financeiro (visão geral com gráficos), Contábil e fiscal, Pessoas (ficha com linha do tempo), SST, Jurídico, Administrativo, E-mail (entrada, rascunhos da Atena, padrões), Contatos, Arquivos (com `FileViewer` para PDF e imagem; DXF com prévia estática nesta fase), Relatórios (galeria), Manual (índice e um procedimento de exemplo), Configurações (todas as abas; "Telemetria e saúde" com painel de situação dos serviços; "Exportar/Importar" simulado).

## 10. Etapas de execução

| Etapa | Entrega | Pronto quando |
|---|---|---|
| **E0** | Repositório, scripts, lint, formatação, README | `npm run dev` sobe web e API |
| **E1** | Demo API + seed completo + reset | Todas as coleções respondem; dados coerentes |
| **E2** | Marca (`brand/`), tokens, tema, componentes-base, padrões, rota `/design` | Marca separada e versionada; vitrine completa nos dois temas e em 375 px |
| **E3** | Núcleo do front (api, auth, permissões, registro de módulos, i18n, formatação, tempo real, tarefas) + casca + login | Menu nasce dos manifestos; navegação fluida |
| **E4** | Painel, Obras, Obra, Planejamento, Mapa | Roteiro da narrativa 1 funciona |
| **E5** | Orçamentos, Central de revisão, Documentos, Medições, Regularização | Narrativas 3 e 4 funcionam |
| **E6** | Olhar de Atena, barra da Atena, Conversas, Biblioteca, Padrões | Narrativa 2 funciona |
| **E7** | Todos os módulos por configuração | Nenhum item de menu sem tela |
| **E8** | Polimento: responsivo, movimento, estados, acessibilidade, desempenho, PWA | Lista da seção 11 completa |

A partir da E4, `main` deve estar sempre apresentável: se o tempo acabar, entrega-se o que está mesclado.

## 11. Verificação final

- [ ] `typecheck`, `lint`, `build` sem erro; console limpo.
- [ ] Nenhuma importação entre módulos (regra de lint ativa).
- [ ] Nenhuma cor, duração ou texto fixo fora de tokens/dicionário.
- [ ] Todas as telas em 375, 768 e 1440 px; tabelas viram cartões; Gantt vira linha do tempo.
- [ ] Temas claro e escuro; `prefers-reduced-motion` respeitado.
- [ ] Estados de carregando, vazio e erro em todas as telas.
- [ ] Navegação por teclado e contraste adequados.
- [ ] As quatro narrativas da seção 7 percorridas do início ao fim sem travar.
- [ ] `POST /demo/reset` devolve a demo ao estado inicial.
- [ ] Carregamento inicial rápido (divisão de código por módulo; mapa e visualizadores sob demanda).
- [ ] README com instruções de execução e de publicação.

## 12. Publicação da demo

**Não publique sem autorização do Lincon.** Deixe pronto:
- **Opção A (link fixo):** `apps/web` como site estático e `apps/demo-api` como função Python, com o SQLite recriado em diretório temporário a cada inicialização (os dados voltam ao estado inicial — aceitável na demo).
- **Opção B (imediata):** rodar localmente e expor por túnel temporário gratuito.

Documente as duas no README e registre em `pendencias.md` qualquer limitação encontrada.

## 13. O que registrar para as próximas fases

Em `docs/fase-0/pendencias.md`: decisões tomadas sem previsão neste manual, bibliotecas adicionadas, pontos do contrato da API que precisaram mudar, cálculos provisórios no front-end que devem migrar para o servidor, e ajustes pedidos pelo cliente após a apresentação.
