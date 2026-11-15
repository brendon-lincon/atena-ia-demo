# Marca — Atena IA

Fonte única de toda a identidade e comunicação visual. O sistema (`apps/web`) e a futura página de vendas consomem daqui; nada de marca é criado fora desta pasta.

## Origem

`source/logo-original.webp` — composição criada pelo Lincon (preto e cinza sobre branco), com três partes:
1. **Símbolo** — perfil de Atena com elmo.
2. **Logotipo** — "ATENA" em caixa-alta geométrica, seguido do monograma "IA" em faixas inclinadas (tons de cinza).
3. **Assinatura** — "GESTÃO | ENGENHARIA | CONTROLE", abaixo de um fio.

A composição original é referência, não arranjo obrigatório: as partes devem ser separadas e recombinadas.
> Se o Lincon fornecer o arquivo vetorial original, ele substitui a vetorização feita a partir da imagem.

## Estrutura

```
brand/
├─ source/            # originais intocados
├─ logo/
│  ├─ symbol/         # só o símbolo
│  ├─ wordmark/       # só "ATENA IA"
│  ├─ tagline/        # só a assinatura
│  └─ lockup/         # combinações: horizontal, vertical, com e sem assinatura
├─ icons/
│  ├─ favicon/        # .ico, .svg, 16–48 px
│  ├─ pwa/            # 192, 512, mascarável
│  ├─ apple/          # apple-touch-icon 180
│  ├─ macos/          # .icns (16 → 1024)
│  ├─ windows/        # .ico (16 → 256)
│  └─ social/         # avatar quadrado e circular
├─ colors/            # tokens.json (fonte) → tokens.css gerado
├─ typography/        # fontes e escala
├─ motion/            # símbolo animado (entrada, carregando, "Atena pensando")
├─ patterns/          # texturas e grafismos (malha de planta, faixas do "IA")
├─ illustrations/     # estados vazios, erro, primeiros passos
├─ documents/         # papel timbrado, capa, carimbo de prancha, assinatura de e-mail
├─ marketing/         # banners, capas de rede social, imagem de compartilhamento (OG), outdoor
└─ guidelines.md      # manual de uso da marca
```

## Versões de cor (para cada peça de `logo/` e `icons/`)

| Versão | Uso | Cor |
|---|---|---|
| `mono-black` | original; impressão | `#000000` |
| `navy` (**principal**) | fundos claros | `#04233F` |
| `white` | fundos escuros e sobre azul | `#FFFFFF` |
| `on-navy` | símbolo branco em quadro `#04233F` | ícones de aplicativo |
| `duotone` | "ATENA" em `#04233F`, "IA" em `#2F6AA3` → `#A3CFE6` | destaque |

Formatos: **SVG** (fonte, traço limpo, sem texto vivo) + PNG @1x/@2x/@3x com fundo transparente.
Nomes: `atena-<peça>-<arranjo>-<cor>.<ext>` — ex.: `atena-lockup-horizontal-navy.svg`.

## Tipografia

**Inter** (variável, romana e itálica) é a fonte única do sistema em todos os aparelhos; **JetBrains Mono** para números e códigos. Ambas com licença SIL OFL, guardadas em `typography/<família>/` junto do arquivo de licença e carregadas localmente — nada vem de serviço externo. Arquivos da San Francisco (Apple) não entram no repositório. A letra do logotipo é exclusiva do logotipo.

## Regras

- Vetorizar o símbolo fielmente; não redesenhar, não alterar proporções.
- Área de respiro mínima = altura do "A" do logotipo; definir tamanho mínimo legível de cada peça.
- O símbolo sozinho deve funcionar em 16 px (simplificar o traço só nessa versão).
- `colors/tokens.json` é a origem dos tokens de `apps/web/src/design/tokens.css`.
- `marketing/` e `documents/` são preparados na Fase 0 apenas como estrutura e moldes-base; o conteúdo final vem com a página de vendas.
