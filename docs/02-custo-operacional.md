# Atena IA — Custo operacional mensal (estimativa preliminar)

> Base: **uma empresa cliente** (perfil do Robson: 3–6 obras simultâneas, 1–5 usuários), sistema completo em operação.
> Preços consultados em 14/11/2026. Câmbio **assumido** para a conta: € 1 = R$ 6,30 · US$ 1 = R$ 5,60 — ajuste ao câmbio do dia.
> É estimativa: o consumo de IA só se confirma medindo o uso real nas primeiras semanas.

## 1. Infraestrutura

| Item | Opção | Custo mensal |
|---|---|---|
| Servidor (aplicação, banco, fila, gateway de WhatsApp, OCR e transcrição locais) | Hetzner CX43 — 8 vCPU, 16 GB, 160 GB | € 15,99 ≈ R$ 101 |
| Cópias de segurança do servidor | Backup automático (+20% do servidor) | € 3,20 ≈ R$ 20 |
| Cópia externa de arquivos e banco | Armazenamento de objetos / Storage Box (~100 GB) | € 4–6 ≈ R$ 25–38 |
| Domínio | `.com.br` (≈ R$ 40/ano) | R$ 4 |
| Certificado HTTPS | Let's Encrypt | R$ 0 |
| **Subtotal** | | **≈ R$ 150–165** |

Opção de entrada (Fases 1–2, sem WhatsApp nem OCR pesado): CX33 — 4 vCPU, 8 GB — € 8,49 ≈ R$ 54.

## 2. Serviços gratuitos (custo zero dentro dos limites)

| Função | Ferramenta | Limite que importa |
|---|---|---|
| WhatsApp | Evolution API auto-hospedada | Sem limite da ferramenta; risco de bloqueio do número por ser não oficial |
| E-mail (ler/redigir) | IMAP/SMTP da conta do próprio usuário | Limites do provedor do usuário |
| E-mail do sistema (avisos, recuperação de senha) | Plano gratuito de serviço transacional | ~300 e-mails/dia — sobra |
| Mapas | MapLibre + OpenStreetMap | Uso moderado; geocodificação ~1 consulta/s |
| OCR, transcrição, conversão DWG, leitura de PDF/DXF | Bibliotecas locais | Só consomem o servidor |
| Observabilidade, fila, busca, memória | Auto-hospedados | Só consomem o servidor |
| Bases de preço e legislação | Fontes públicas | — |

## 3. Inteligência artificial (por consumo)

Preços Claude por milhão de tokens: **Haiku 5.5** US$ 0,10 entrada / 0,50 saída · **Sonnet 5.5** US$ 2,00 / 10,00.
Roteamento previsto: Haiku para classificar, ler notas e atender a barra de comando; Sonnet para interpretar projeto e redigir peça técnica.

| Uso (cenário típico/mês) | Modelo | Volume estimado | Custo |
|---|---|---|---|
| Interpretar projetos e memoriais | Sonnet | 20 projetos × (150 mil entrada + 20 mil saída) | US$ 10,00 |
| Redigir trechos de peças técnicas e contratos | Sonnet | 60 documentos × (30 mil + 6 mil) | US$ 7,20 |
| Olhar de Atena (3×/dia) | Haiku | 90 execuções × (50 mil + 3 mil) | US$ 0,60 |
| Barra de comando | Haiku | 600 pedidos × (8 mil + 1 mil) | US$ 0,80 |
| Classificar e-mails, mensagens e notas | Haiku | 3.000 itens × (2 mil + 200) | US$ 0,90 |
| Importar modelos, resumir documentos, atas | Sonnet | diversos | US$ 3,00 |
| **Total típico** | | | **≈ US$ 22 ≈ R$ 125** |

| Cenário | IA/mês |
|---|---|
| Leve (poucos projetos, pouco texto) | US$ 8–12 ≈ R$ 45–70 |
| Típico | US$ 20–25 ≈ R$ 110–140 |
| Intenso (muitos projetos grandes, uso diário pesado) | US$ 50–70 ≈ R$ 280–390 |

Proteção: limite de gasto mensal configurado no motor de IA; ao atingir, o sistema avisa e segue só com as funções determinísticas.

## 4. Total por cliente

| Cenário | Infra | IA | **Total mensal** |
|---|---|---|---|
| Leve | R$ 150 | R$ 60 | **≈ R$ 210** |
| Típico | R$ 160 | R$ 125 | **≈ R$ 285** |
| Intenso | R$ 165 | R$ 340 | **≈ R$ 505** |

**Valor de referência para compor a mensalidade: R$ 300/mês de custo direto**, com teto de R$ 500 em uso intenso.

## 5. Não incluído (decidir à parte)

| Item | Quando aparece | Ordem de grandeza |
|---|---|---|
| Linha/chip dedicado para o WhatsApp da empresa | Recomendado desde o início do módulo Conversas | R$ 30–50/mês (do cliente) |
| API oficial do WhatsApp (Meta) | Se o número for bloqueado ou o cliente exigir canal oficial | Cobrança por mensagem iniciada pela empresa |
| SMS | Só se ativado | Por mensagem |
| Normas ABNT | Compra pelo cliente | Por norma |
| Verificação de aplicativo para login OAuth do Gmail | Só quando o produto for aberto ao público com muitos clientes | Avaliação de segurança anual |
| Seu tempo de suporte, manutenção e evolução | Sempre | Sua margem |
| Tokens de IA do desenvolvimento | Durante a construção | Custo do projeto, não da operação |
| Impostos sobre a mensalidade e taxa do meio de pagamento | Sempre | Conforme seu regime |

## 6. Efeito de escala

Com vários clientes no mesmo servidor (multiempresa, Fase 6), a infraestrutura se dilui: um servidor de ~R$ 250–450/mês atende de 10 a 20 empresas desse porte, ficando em **R$ 20–40 de infra por cliente**. A IA continua proporcional ao uso de cada um.

## 7. Comparação Claude × OpenAI (preços de tabela consultados em 14/11/2026, US$ por milhão de tokens)

| Faixa | Claude | Entrada / Saída | OpenAI | Entrada / Saída |
|---|---|---|---|---|
| Básica (classificar, notas, barra de comando) | Haiku 5.5 | 0,10 / 0,50 | gpt-6-luna | 0,10 / 0,50 |
| Intermediária | — | — | gpt-6.1-terra | 1,00 / 5,00 |
| Média (ler projeto, redigir peça) | Sonnet 5.5 | 2,00 / 10,00 | gpt-6.1-sol | 2,00 / 10,00 |
| Alta (não prevista na operação) | Opus 5.5 | 4,00 / 20,00 | gpt-6-astra | 10,00 / 50,00 |

Processamento em lote (não urgente): 50% de desconto nos dois provedores.

| Cenário típico/mês | Tarefas leves | Tarefas pesadas | **Total IA** |
|---|---|---|---|
| Claude (Haiku + Sonnet) | US$ 2,30 | US$ 20,20 | **≈ US$ 22 ≈ R$ 125** |
| OpenAI equivalente (luna + sol) | US$ 2,30 | US$ 20,20 | **≈ US$ 22 ≈ R$ 125** |
| OpenAI com faixa intermediária (luna + terra) | US$ 2,30 | US$ 10,10 | **≈ US$ 12 ≈ R$ 70** |
| Misto: pesadas não urgentes em lote | US$ 2,30 | US$ 10–15 | **≈ US$ 12–17 ≈ R$ 70–95** |

**Leitura:** nas faixas equivalentes os dois provedores custam o mesmo. A OpenAI só fica mais barata usando o modelo intermediário (terra) nas tarefas pesadas — metade do preço — e isso depende de ele acertar a leitura de projeto e a redação técnica, o que só um teste com projetos reais do cliente responde. Como o motor de IA é plugável, a decisão é por tarefa: a bateria de avaliação (Fase 2) roda os mesmos casos nos dois provedores e o roteador fica com o mais barato que passar. Para a mensalidade, mantenha **R$ 125 de IA** como referência conservadora; o melhor caso é ≈ R$ 70.
