# Atena IA

Sistema de gestão para construtoras e consultoria de engenharia civil. Este repositório está na **Fase 0 (demonstração)**: front-end definitivo, back-end provisório e dados fictícios.

- Arquitetura: [`docs/01-arquitetura-proposta.md`](docs/01-arquitetura-proposta.md)
- Custo operacional: [`docs/02-custo-operacional.md`](docs/02-custo-operacional.md)
- Manual de execução da Fase 0: [`docs/fase-0/manual-executivo-demo.md`](docs/fase-0/manual-executivo-demo.md)
- Registro de decisões e pendências: [`docs/fase-0/pendencias.md`](docs/fase-0/pendencias.md)
- Identidade visual: [`brand/README.md`](brand/README.md)

## Estrutura

```
apps/web        front-end definitivo (Vite + React + TypeScript)
apps/demo-api   back-end provisório (FastAPI + SQLite) — descartável
brand/          identidade e comunicação visual
seed/           dados fictícios (JSON) que povoam o banco temporário
docs/           arquitetura, custos e manuais
```

## Requisitos

- Node.js 22 ou superior e npm
- [uv](https://docs.astral.sh/uv/) (gerencia o Python da API)

## Como rodar

```bash
npm install
npm run dev
```

Sobe a API em `http://localhost:8787` e o site em `http://localhost:5173` (o site encaminha `/api` para a API).

## Comandos

| Comando             | Função                                        |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | API e site em modo de desenvolvimento         |
| `npm run typecheck` | Verificação de tipos (TypeScript estrito)     |
| `npm run lint`      | ESLint (web) e ruff (API)                     |
| `npm run build`     | Compilação de produção do site                |
| `npm run format`    | Formata o repositório com Prettier            |
| `npm run seed`      | Recria o banco temporário a partir de `seed/` |

## Demonstração: login e dados

Na tela de entrada use **Entrar na demonstração** (perfil Dono) ou `antonio@cgaacabamentos.example` / `demo1234`. Os dados são fictícios e relativos a "hoje" (a demonstração nunca fica velha). `POST /api/v1/demo/reset` devolve tudo ao estado inicial.

## Publicação da demonstração

> A publicação só ocorre com autorização do Lincon. Nada abaixo foi publicado.

Os dados são fictícios e a API é descartável: a cada início o banco SQLite é recriado a partir de `seed/`.

### Opção A — link fixo (site estático + função Python)

O repositório já traz `vercel.json`, `api/index.py` e `requirements.txt`:

- o site (`apps/web`) é compilado com `npm run build` e servido como estático (`apps/web/dist`);
- `/api/*` é encaminhado à função Python `api/index.py`, que sobe o mesmo app FastAPI com o banco em diretório temporário (`DEMO_DB_PATH`, padrão `/tmp/atena-demo.db`) e lê o seed de `DEMO_SEED_DIR` (padrão `seed/`).

Passos (feitos por quem tem a conta de hospedagem):

```bash
npm install -g vercel
vercel          # prévia
vercel --prod   # endereço definitivo
```

Limitações conhecidas (registradas em `docs/fase-0/pendencias.md`): cada instância da função tem o seu próprio banco, então o que foi criado numa pode não aparecer em outra e tudo volta ao início quando a instância é reciclada; o canal de eventos em tempo real (`/events`) é encerrado pela hospedagem e o site reconecta; para uma sessão de apresentação use `POST /api/v1/demo/reset` antes de começar.

### Opção B — imediata (local + túnel temporário)

```bash
npm install
npm run build
npm run dev                      # API em :8787 e site em :5173
npx cloudflared tunnel --url http://localhost:5173   # ou: ngrok http 5173
```

O túnel devolve um endereço público temporário que encaminha para o site local (e, pelo proxy `/api`, para a API). Encerre o túnel ao terminar a apresentação.

## Instalar como aplicativo

O site é um PWA: no navegador, "Instalar aplicativo" abre a demonstração em janela própria, com ícone da marca.
