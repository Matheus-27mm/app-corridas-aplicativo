# Corrida — gestão financeira de motorista (Uber/Bolt)

App para um motorista de Uber/Bolt em Portugal: registar ganhos, descontar custos
(abastecimentos + despesas) e mostrar o **lucro real**, com filtros por dia/mês/ano.
Comunicar em **português (pt-PT)**. Moeda default **EUR**.

## Stack (monorepo)

- **Frontend** (`frontend/`): React + **Vite** + TypeScript + **Tailwind v4** + **shadcn/ui**
  (preset Nova — Lucide + Geist). Router: `react-router-dom`. Estado: **Zustand**.
  App **web responsiva + PWA** (não nativa). Tema **escuro** forçado.
- **Backend** (`backend/`): Python + **FastAPI** + **SQLAlchemy 2.0** + **JWT** (bcrypt). ✅ construído.
- **Base de dados**: **SQLite** em dev (default) · **PostgreSQL** em produção (via `DATABASE_URL`).
- **Deploy**: **Vercel** (frontend) + **Render** (backend + Postgres).

> Stack anterior (Expo/React Native) foi descartada e apagada. Histórico em `git`.

## Estrutura do frontend (`frontend/src/`)

- `main.tsx` — rotas: `/login` e `AppLayout` (guard de sessão) com `/`, `/ganhos`,
  `/abastecimentos`, `/despesas`, `/mais` (barra de abas inferior, mobile-first, `max-w-md`).
- `store/auth.ts`, `store/data.ts` — **Zustand com dados mock**. Trocar por chamadas ao
  FastAPI mantendo a MESMA API dos hooks (`useAuth`, `useData`) para não mexer nos ecrãs.
- `pages/` — `login`, `inicio` (dashboard), `ganhos`, `abastecimentos`, `despesas`, `mais`.
- `components/` — `page-header`, `record-row`, `chips`, `brand-icons`, `forms/*` (Dialogs de
  adicionar), `ui/*` (shadcn — não editar à mão; usar `npx shadcn@latest add`).
- `lib/` — `domain` (uniões/listas/`labelOf`), `format` (Intl), `date` (datas locais, sem
  desvio UTC), `period` (filtros), `num` (`parseNum`).
- `types/models.ts` — tipos que espelham as futuras tabelas Postgres.
- `public/povdriving.mp4` — vídeo de fundo do login.

## Estrutura do backend (`backend/app/`)

- `main.py` — FastAPI + CORS + `create_all` no startup. `config.py` — env via pydantic-settings.
- `database.py` — engine/Session (SQLite dev, Postgres prod). `models.py` — SQLAlchemy (User,
  Carro, Ganho, Abastecimento, Despesa, Definicoes; todos com `user_id`). `schemas.py` — Pydantic
  **camelCase** (alinha com o frontend). `security.py` — bcrypt + JWT (`get_current_user`).
- `routers/` — `auth` (register/login/me), CRUD `carros/ganhos/abastecimentos/despesas` +
  `definicoes`, e `resumo` (`GET /resumo?periodo=hoje|semana|mes|tudo` → lucro/ganhos/custos,
  €/km, €/hora, **e comparativo por plataforma** — Europe/Lisbon). Tudo protegido por
  `Authorization: Bearer <token>` e filtrado por utilizador. O token vem em **snake_case**
  (`access_token`/`token_type`, convenção OAuth); o resto da API é camelCase.

## Convenções

- Adicionar componente shadcn: `cd frontend && npx shadcn@latest add <nome>`.
- Usar tokens do tema (`bg-background`, `text-muted-foreground`, `bg-card`, etc.), não cores fixas
  (exceto no login sobre o vídeo, que é sempre escuro).
- TS estrito: `verbatimModuleSyntax` (usar `import type`), `noUnusedLocals/Parameters`.

## Comandos

- Frontend: `cd frontend && npm run dev` (http://localhost:5173) · `npm run build` · `npm run lint`
- Backend: `cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload` (http://localhost:8000 · docs `/docs`)

## Roadmap

1. ✅ Frontend (Vite + shadcn) com login + dashboard + CRUD em dados mock.
2. ✅ Backend FastAPI + SQLAlchemy + PostgreSQL/SQLite + **Auth JWT** + CRUD.
3. Ligar frontend↔backend (TanStack Query) — substituir os stores mock.
4. Deploy: Vercel (frontend) + Render (backend + Postgres).
5. PWA (manifest + service worker) + polish.
