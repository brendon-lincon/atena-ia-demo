# Manual de uso da marca — Atena IA

## Peças

| Peça | Arquivo | Quando usar |
|---|---|---|
| Símbolo | `logo/symbol/atena-symbol-*.svg` | Trilho lateral, orbe da Atena, avatar, favicon |
| Símbolo simplificado | `logo/symbol/atena-symbol-micro-*.svg` | Somente de 16 a 48 px (silhueta sólida, sem os traços internos) |
| Logotipo | `logo/wordmark/atena-wordmark-*.svg` | Cabeçalhos estreitos e rodapés |
| Assinatura | `logo/tagline/atena-tagline-*.svg` | Sempre abaixo do logotipo, nunca sozinha em telas |
| Arranjos | `logo/lockup/atena-lockup-{horizontal,vertical}[-tagline]-*.svg` | Login, documentos, apresentações |

## Versões de cor

`navy` é a principal (fundos claros). `white` em fundos escuros. `on-navy` é a versão pronta sobre o quadro `#04233F`. `duotone` destaca o "IA" em `#2F6AA3 → #A3CFE6` e só vale em fundo claro ou escuro liso. `mono-black` é para impressão em uma cor.

No sistema: versão `navy` no tema claro e `white` no escuro, trocando por herança de cor (`currentColor`), sem arquivos duplicados.

## Respiro e tamanho mínimo

- Área de respiro mínima: a altura do "A" do logotipo, em todos os lados.
- Tamanho mínimo: símbolo 16 px (versão simplificada), logotipo 96 px de largura, arranjo horizontal 160 px, arranjo com assinatura 240 px.
- Não girar, esticar, recolorir fora das versões acima, aplicar sombra ou contorno, nem posicionar sobre fotos sem uma camada de contraste.

## Cores

A fonte é `colors/tokens.json`; o `tokens.css` do front-end é gerado dele (`npm run brand:tokens`).

- Escala de azul-petróleo: `#04233F`, `#154470`, `#2F6AA3`, `#4C8BBD`, `#6FADD3`, `#A3CFE6`.
- Neutros frios para fundos, bordas e texto; amarelo, verde e vermelho **só como sinal** (atenção, sucesso, perigo).
- **Luz azul da Atena** (`#4C8BBD → #A3CFE6`): exclusiva de elementos de IA. O âmbar nunca marca a Atena, para não ser lido como alerta.
- Contraste mínimo AA em todo texto; os pares do sistema são verificados em `tools/brand/check_contrast.py`.

## Tipografia

**Inter** em tudo (arquivos em `typography/inter`, carregamento local, licença SIL OFL). **JetBrains Mono** para números e códigos. Hierarquia por peso (400, 500, 600, 700) e tamanho; números tabulares em tabelas e indicadores. A letra do logotipo "ATENA" é exclusiva do logotipo e não é usada em textos.

## Movimento

`motion/` traz o símbolo animado em três usos: **entrada** (login), **carregamento** (um brilho azul-claro percorre o símbolo) e **Atena pensando** (anel de luz em rotação sobre pulso suave). Todos respeitam `prefers-reduced-motion`.

## Ícones

Quadro `#04233F` com o símbolo branco: favicon (16–48 px, versão simplificada), PWA (192 e 512, com versão mascarável), Apple (180), macOS (`.icns`, 16 a 1024) e Windows (`.ico`, 16 a 256). Avatares quadrado e circular em `icons/social`.

## Documentos e marketing

`documents/` guarda os moldes-base (papel timbrado, capa, carimbo de prancha, assinatura de e-mail) e `marketing/` a imagem de compartilhamento e um banner. São moldes: o conteúdo final vem com a página de vendas. O logotipo do **cliente** (empresa usuária) é outro e vem dos dados da empresa; ele só aparece nos documentos emitidos.

## Origem e atualização

Os vetores foram traçados a partir de `source/logo-original.webp` (`npm run brand:trace`). Se o arquivo vetorial original for fornecido, ele substitui o traçado.

```bash
npm run brand:build   # peças, ícones, rasterização, pacote e tokens
```
