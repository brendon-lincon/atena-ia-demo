# Fase 0 — Pendências, decisões e registros

> Tudo o que o manual não previu, bibliotecas adicionadas, mudanças de contrato, cálculos provisórios e ajustes pedidos pelo cliente. Formato: data · etapa · registro.

## Decisões tomadas sem previsão no manual

- **14/11/2026 · E0 · TypeScript 6.0 em vez de 7.0.** A versão estável mais recente (7.0.x) não é aceita pelo `typescript-eslint` (compatível com `<6.1`). Fixado `~6.0.3` até o suporte chegar. Rever ao iniciar a Fase 1.
- **14/11/2026 · E0 · Python 3.14 local em vez de 3.12.** O manual cita 3.12; a máquina de desenvolvimento só tem 3.14 (via `uv`). `requires-python = ">=3.12"` preservado; nada no código depende de recurso exclusivo de 3.14.
- **14/11/2026 · E0 · Fluxo de ramos.** O manual pede o ramo `fase-0/demo` e um PR por etapa. Adotado: `fase-0/demo` é o ramo de trabalho; ao fim de cada etapa abre-se PR para `main`, mescla-se com _merge commit_ (preserva o histórico e mantém o ramo sincronizável) e o trabalho continua no mesmo ramo.
- **14/11/2026 · E0 · Regras de lint que materializam o manual.** Importação entre módulos, `fetch` e `localStorage` fora de `core/`, cores hexadecimais e textos visíveis fixos em JSX são erros de lint (`apps/web/eslint.config.js`). A lista de módulos é lida das pastas, sem manutenção manual.

- **14/11/2026 · E1 · Datas relativas.** `"@d±N"` vira **data** (AAAA-MM-DD, fuso de Brasília) e `"@h±N"` vira **instante** ISO 8601 com fuso (-03:00; o Brasil não tem horário de verão desde 2019). O manual não distingue; datas de calendário (vencimentos, diário, cronograma) pedem data, não instante.
- **14/11/2026 · E1 · Gerador do seed.** Os JSON de `seed/` são gerados por `tools/seed/` (`npm run seed:build`) e conferidos por `tools/seed/checks.py`, que falha se algum invariante do manual for violado (soma da EAP = contrato, avanço = média ponderada, medido ≤ contratado, custos = realizado etc.). Os JSON continuam sendo a fonte lida pela API; o gerador existe porque os volumes (120 fotos, 76 atividades, 61 mensagens…) tornam a edição manual inviável.
- **14/11/2026 · E1 · Recursos além da lista do contrato.** `versions` (histórico de versões, citado em 5.4 como recurso comum) e `deadlines` já estavam previstos; foram acrescentados `versions` e `files.url`/`previewUrl` (arquivos abertos na demo ficam em `apps/web/public/demo/files/`). Funcionário (`employees`) guarda uma cópia de leitura do `name` para evitar junção em toda lista; o dono do dado continua sendo `contacts`.
- **14/11/2026 · E1 · PDFs e marcadores.** Os PDFs de demonstração são gerados por um escritor mínimo (sem biblioteca); os 120 marcadores de foto são SVG (`photo-NNN.svg`). Para trocar por fotos reais, manter o mesmo nome base e ajustar a extensão em `photos.file`.
- **14/11/2026 · E1 · Rotas de navegação nas respostas da Atena.** As ações `navigate` usam o id do módulo como caminho (ex.: `/planning?tab=gantt`, `/budgets/<id>`); o roteador do front (E3) deve seguir essa convenção.
- **14/11/2026 · E1 · Usuários de demonstração.** Login: `antonio@cgaacabamentos.example` / `demo1234` (perfil Dono). Há mais três usuários (engenheira, encarregado, administrativo) para atribuição de tarefas.

- **14/11/2026 · E2 · Componentes-base à mão.** O CLI do shadcn/ui não foi usado; os componentes de `design/ui` seguem as convenções do shadcn (Radix + `cva` + `cn`) e usam o pacote unificado `radix-ui`. Evita que o CLI reescreva `styles.css` e mantém os tokens como única fonte de cor.
- **14/11/2026 · E2 · Dicionário por módulo.** `createT(dicionário)` devolve uma função de tradução tipada; o dicionário da base fica em `core/i18n/messages.ts` e cada módulo terá o seu. Textos visíveis fixos em JSX são erro de lint.
- **14/11/2026 · E2 · Logotipo vetorizado do WebP.** O símbolo, "ATENA", o "IA" (três tons) e a assinatura foram traçados (potrace) de `brand/source/logo-original.webp`, com a hierarquia tonal preservada por opacidades. O símbolo de 16 px é uma silhueta sólida (sem os traços internos). A assinatura sai a 60% de opacidade (o original é cinza muito claro, ilegível em tela). **Substituir pelo vetor original quando o Lincon fornecê-lo** (`npm run brand:build`).
- **14/11/2026 · E2 · Tokens além da tabela do manual.** Acrescentados `muted`, `ring`, `*-soft`/`*-text` de sinal (texto sobre fundo suave com contraste AA), `paper*` (a folha do documento é branca nos dois temas) e `sidebar*`. Todos em `brand/colors/tokens.json`; o contraste é verificado por `npm run brand:contrast`.
- **14/11/2026 · E2 · Visualizador de PDF.** Usa o visualizador nativo do navegador (`<object>`); PDF.js não está na lista do manual. DXF mostra prévia estática (SVG), como previsto.
- **14/11/2026 · E2 · Mapa.** Estilos `positron` (claro) e `dark` do OpenFreeMap, com mosaicos do OpenStreetMap como reserva. O MapLibre e o seu CSS carregam sob demanda. O agrupamento de marcadores é feito por proximidade em pixels (HTML), não por camada de cluster, para não depender de glifos do estilo.
- **14/11/2026 · E2 · Caminho crítico.** `GanttChart` só desenha o que recebe (`critical`, dependências, linha de base); o cálculo do caminho crítico fica em função pura no módulo `planning/lib` (E4).
- **14/11/2026 · E2 · Peso do pacote.** O pacote principal tem ~600 kB (Motion, Recharts e o logotipo em linha). A divisão por módulo entra a partir da E3 (rotas preguiçosas) e a medição final na E8.

- **14/11/2026 · E3 · Extensão do contrato: `GET /demo/credentials`.** Rota aberta, só da demonstração, que devolve o login do perfil Dono lido de `seed/users.json`. Existe para que o botão "Entrar na demonstração" preencha o formulário sem credenciais no código do front-end. Não migra para o back-end definitivo.
- **14/11/2026 · E3 · Token da sessão em `localStorage`.** O manual restringe o `localStorage` a preferências de interface. O token de demonstração é guardado em `core/preferences` só para a sessão sobreviver a uma atualização da página. Na versão definitiva a sessão vira cookie `httpOnly`.
- **14/11/2026 · E3 · Áreas e rotas.** Ids de área em inglês (`home`, `works`, `engineering`, `company`, `communication`, `knowledge`, `system`). Cada módulo vive em `/<id>` (o painel em `/`); detalhes por `records` do manifesto (ex.: `/works/:id`). Menu, rotas e paleta de comandos são lidos de `modules/*/*/manifest.ts` por `import.meta.glob`, sem lista manual.
- **14/11/2026 · E3 · Telas provisórias.** Os 31 manifestos existem desde já; os módulos sem tela mostram `ModuleStub` até a etapa que os implementa (E4 a E7).
- **14/11/2026 · E3 · Tempo real.** SSE com `EventSource` (o token vai na query, pois `EventSource` não envia cabeçalhos). Se o canal cair, o front-end passa a consultar a cada 5 s (evento interno `poll`).

- **14/11/2026 · E4 · Entidades compartilhadas em `core/entities`.** Obra, EAP, cronograma, alocação, tarefa, apontamento etc. têm esquema Zod e cliente únicos no núcleo, porque painel, obras, planejamento e mapa leem os mesmos dados e um módulo não pode importar de outro. `core/directory` resolve ids em nomes.
- **14/11/2026 · E4 · Ajustes no seed para o caminho crítico.** Atividades de uma mesma frente passaram a ter vínculo FS por padrão, e o comissionamento e a entrega final de Candeias foram ligados à pavimentação; assim o caminho crítico calculado (bases TQ-08 e TQ-12, plataformas, pavimentação, comissionamento) é coerente com a narrativa.
- **14/11/2026 · E4 · "Precisa de você" abre a Central de revisão.** Os cartões levam a `/review?item=<id>`; a tela chega na E5 (hoje mostra a página provisória do módulo).
- **14/11/2026 · E4 · Abas contribuídas.** Planejamento e Tarefas entregam abas para `work.tabs` (mesmo componente do módulo, filtrado pela obra). Medições, Regularização, Custos, Arquivos e Conversas contribuem nas etapas seguintes.
- **14/11/2026 · E4 · Moldura de registro por dados.** `core/record/use-record-shell` entrega notas, anexos, versões e atividade de qualquer registro (`recordType` + `recordId`) à `RecordShell`.

- **14/11/2026 · E5 · Efeitos da Central de revisão.** Aprovar um item altera o registro de origem pelo cliente genérico da API: quantitativo aprova o orçamento, medição nº 4 passa a "enviada", ASO cria tarefa. O dono do dado continua sendo o módulo de origem; na versão definitiva a reação nasce de evento.
- **14/11/2026 · E5 · Orçamento por assistente.** O passo de leitura roda o job `budget-takeoff` (resultado: o orçamento da Casa de Gerador, já levantado no seed). Itens "esquecidos" da verificação cruzada podem ser incluídos no total; o envio para aprovação grava o orçamento e cria o item de revisão.
- **14/11/2026 · E5 · Documentos.** Modelos e documentos emitidos vêm de `document-templates` e `documents`; "Aprovar e emitir" cria o registro emitido e "Exportar em PDF" usa a impressão do navegador (folha de estilo de impressão).
- **14/11/2026 · E5 · Medições e regularização como abas.** Os dois módulos entregam abas para a obra (mesmo componente, filtrado por `obraId`).

- **14/11/2026 · E6 · Ações do Olhar de Atena.** Aceitar um apontamento executa a ação sugerida (`core/atena/actions.ts`, a mesma da barra da Atena): navegar, abrir registro ou criar tarefa. A requisição de aço abre `/procurement`, que ganha tela na E7.
- **14/11/2026 · E6 · Conversas.** Envio, agendamento e "transformar em" (tarefa, nota, diário, vale) gravam pelo cliente genérico; nada sai do sistema. As respostas-padrão são fixas no dicionário do módulo; no definitivo vêm de Padrões e identidade.
- **14/11/2026 · E6 · Biblioteca.** Normas da ABNT aparecem só como referência (código, título, resumo redigido por nós); "Enviar norma ou lei" indexa de forma simulada e grava o item. Os itens dos checklists são derivados do resumo de cada checklist.
- **14/11/2026 · E6 · Padrões e identidade.** A identidade é gravada em `company.identity` e reaparece em todo documento emitido; a numeração por tipo ainda não é gravada (simulada).

## Bibliotecas adicionadas fora da lista do manual

| Biblioteca | Motivo | Etapa |
|---|---|---|
| ESLint, `typescript-eslint`, `eslint-plugin-react-hooks`, `globals` | Lint exigido pelo manual (regra 9 e seção 11). Ferramenta de desenvolvimento. | E0 |
| Prettier | Formatação exigida na E0. Ferramenta de desenvolvimento. | E0 |
| `concurrently` | Subir API e web com um único `npm run dev`. Ferramenta de desenvolvimento. | E0 |
| `ruff` | Lint e formatação do Python (a API é descartável, mas o `npm run lint` cobre os dois lados). Ferramenta de desenvolvimento. | E0 |
| `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` | Base do shadcn/ui (primitivos acessíveis, variantes, mescla de classes). | E2 |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Formulários e validação (o `@hookform/resolvers` liga as duas; não constava na lista, mas é necessário para "RHF + Zod"). | E3 |
| `@resvg/resvg-js` | Rasteriza os SVG da marca (PNG @1x/@2x/@3x e ícones). Ferramenta de desenvolvimento. | E2 |
| `potracer`, `pillow`, `numpy`, `fonttools`, `brotli` (via `uv run --with`, fora das dependências do projeto) | Vetorização do logotipo, geração de `.ico` e instâncias estáticas da Inter só para rasterizar SVG. Ferramentas de marca. | E2 |

## Cálculos provisórios no front-end que devem migrar para o servidor

- **Caminho crítico** (`modules/works/planning/lib/cpm.ts`): folga total sobre as datas programadas, com relações FS/SS/FF/SF e defasagem.
- **Curva S e físico-financeiro** (`lib/curves.ts`): valor do item da EAP dividido entre as atividades que o executam e distribuído linearmente na linha de base.
- **Histograma e conflito de recursos** (`lib/resources.ts`): demanda = alocações; capacidade = pessoas distintas; sugestão proporcional 3 para 2.
- **Dimensionamento e cenários** (`lib/sizing.ts`, `lib/scenarios.ts`): produtividades (homem-hora por unidade) e coeficientes de eficiência são **ilustrativos da demonstração**; precisam de calibração com histórico real.
- **Orçamento** (`modules/engineering/budgets/lib/pricing.ts`): preço = (custo direto com o efeito dos encargos sobre a parcela de mão de obra da composição + indiretos) × (1 + BDI), curva ABC (A até 80%, B até 95%) e cronograma físico-financeiro por janelas de grupos. Pelas regras do manual (seção 8.7) passa ao servidor.
- **Preenchimento de documentos** (`modules/engineering/documents/lib/fill.ts`): os dados do sistema preenchem os campos por origem (obra, contratante, empresa, contrato, EAP); a leitura "pela Atena" é simulada por um job e a conferência é humana.
- **Semáforos** (`core/domain/health.ts`): prazo = diferença entre real e previsto (amarelo > 2 pp, vermelho > 5 pp); custo = desvio (amarelo > 0,5%, vermelho > 3%). Limites a validar com o cliente.

## Decisões da E7

- **Módulos por configuração (E7)** (`core/module-config`): os 15 módulos restantes (agenda, comercial, suprimentos, financeiro, contábil, pessoas, SST, jurídico, administrativo, e-mail, contatos, arquivos, relatórios, projetos e análises, Atena) declaram abas em `config.ts` (recurso, colunas, filtros, visões, quadro) e são desenhados por um único mecanismo (`ConfigModulePage` + `ConfigTabView`, sobre `DataView`). Os manifestos e `i18n.ts` nasceram de um gerador local; daqui em diante são mantidos à mão. Telas com comportamento próprio (visão geral do financeiro, fichas de colaborador, contato e arquivo, Manual e Configurações) são páginas dedicadas dentro do módulo.
- **Convenção `?open=<id>`**: toda aba abre o detalhe em um painel lateral por `?open=`. A requisição de suprimentos passou de `?request=` para `?tab=requests&open=:id`.
- **Configurações simuladas**: canais e avisos, módulos, memória da Atena, backup, consumo de IA e "Exportar e importar" não gravam nada no servidor; a exportação usa o job `export-package` e a importação só valida o arquivo (nada é alterado). "Telemetria e saúde" mede apenas a latência real de `GET /health`; os demais serviços são simulados.
- **Densidade da interface**: preferência de interface guardada em `localStorage` e aplicada em `data-density` na raiz.
- **API**: `GET /users` passou a devolver o usuário sem o hash da senha.

## Mudanças no contrato da API

_(nenhuma até agora)_

## Limitações de publicação

- **Banco por instância**: na opção A a função recria o SQLite em `/tmp` a cada inicialização a frio; instâncias diferentes têm bancos diferentes e o que foi criado pode não aparecer em outra. Aceitável na demonstração; para apresentar, chamar `POST /api/v1/demo/reset` antes.
- **Tempo real**: o fluxo SSE (`/events`) não é adequado a funções com limite de duração; o site reconecta sozinho, e notificações e andamentos de tarefa continuam chegando por consulta.
- **Tarefas longas simuladas** dependem do tempo decorrido desde a criação (guardado no banco): se a instância for reciclada no meio de uma tarefa, ela some. Repetir a ação.
- **Mapa**: usa a base aberta OpenFreeMap (reserva OpenStreetMap); exige internet. Sem rede, o mapa mostra aviso e o resto funciona.
- **PWA**: o service worker guarda o site para abrir offline, mas os dados vêm da API, então sem rede as telas mostram o estado de "sem conexão".
- **Service worker no painel de navegador do desenvolvimento**: o navegador embutido do aplicativo recusa registrar `sw.js` (erro de registro no console, só ali); o arquivo é servido normalmente e o registro deve ser confirmado num Chrome comum antes da apresentação.
- Nada foi publicado: `vercel.json` e `api/index.py` ficaram prontos e testados só localmente (importação do app), à espera de autorização.
- **Biblioteca nova (E8)**: `vite-plugin-pwa`, `workbox-build` e `workbox-window` (PWA exigido pela seção 11).

## Ajustes pedidos pelo cliente após a apresentação

_(preencher após a demonstração)_
