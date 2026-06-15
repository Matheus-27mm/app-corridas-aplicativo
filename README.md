# 🚗 GestRun — Gestão financeira para motoristas (Uber / Bolt)

Aplicação web **mobile-first** para motoristas de plataformas de transporte (Uber, Bolt, etc.)
registarem os **ganhos** e os **custos** (combustível/carregamento + despesas) e verem o
**lucro real** — com comparação de rentabilidade **por plataforma** e **gasolina vs elétrico**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

---

## ✨ Funcionalidades

- 📊 **Dashboard** com filtros **Hoje / Semana / Mês / Tudo**: lucro real, ganhos, custos, €/km, €/hora, atividade e progresso de metas.
- 🆚 **Comparativo de rentabilidade por plataforma** (€/hora e €/km) — saber onde compensa conduzir.
- ⛽🔌 **Comparativo de custo gasolina vs elétrico**.
- 📈 **Gráficos** — barras semanais e tendência de lucro cumulativo.
- 📝 **Registo** de ganhos, abastecimentos e despesas (criar / editar / remover) com registo rápido.
- 🚙 **Gestão de carros** (consumo, tipo de combustível).
- 🎯 **Metas** diária / semanal / mensal.
- 🔐 **Autenticação JWT** (registo/login), dados isolados por utilizador.
- 🌙 **Interface escura premium**, mobile-first (shadcn/ui).

## 🖼️ Capturas

> Em breve — adicionar imagens em `docs/`.

## 🧱 Stack

| Camada        | Tecnologias                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| **Frontend**  | React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · React Router |
| **Backend**   | Python · FastAPI · SQLAlchemy 2.0 · Pydantic v2 · JWT · bcrypt              |
| **Base de dados** | SQLite (dev) · PostgreSQL (produção)                                    |

## 📂 Estrutura

```
.
├── frontend/   # App React (Vite + shadcn/ui)
└── backend/    # API REST (FastAPI)
```

## 🚀 Começar

### Pré-requisitos
- **Node.js 20+** e **Python 3.12+**

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate              # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env              # Linux/Mac: cp .env.example .env
uvicorn app.main:app --reload       # http://localhost:8000  (docs em /docs)
```

Por omissão usa **SQLite** (`dev.db`, criado automaticamente). Para **PostgreSQL**, define
`DATABASE_URL` no `.env` (ver `backend/.env.example`) — há um `backend/docker-compose.yml`
para subir um Postgres local.

## 🔌 API (resumo)

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| `POST` | `/auth/register`, `/auth/login` | Criar conta / iniciar sessão (JWT) |
| `GET`  | `/auth/me` | Utilizador atual |
| `CRUD` | `/ganhos`, `/abastecimentos`, `/despesas`, `/carros` | Registos |
| `GET/PUT` | `/definicoes` | Moeda e metas |
| `GET`  | `/resumo?periodo=hoje\|semana\|mes\|tudo` | Resumo + comparativo por plataforma |

Documentação interativa (Swagger) em **`/docs`**. Todas as rotas (exceto `/auth/*` e `/health`)
exigem o header `Authorization: Bearer <token>`.

## 🔧 Variáveis de ambiente

- **Backend** (`backend/.env`, a partir de `.env.example`): `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`.
- **Frontend**: `VITE_API_URL` (default `http://localhost:8000`).

> ⚠️ O ficheiro `.env` **nunca** é versionado. Em produção, define um `SECRET_KEY` forte e aleatório.

## ☁️ Deploy

- **Frontend → Vercel**: build `npm run build`, output `dist/`.
- **Backend → Render**: start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` + PostgreSQL gerido.

## 🗺️ Roadmap

- [ ] Exportar relatórios (CSV / PDF)
- [ ] Lembretes (inspeção, seguro, IUC)
- [ ] PWA instalável (manifest + service worker)
- [ ] Migrações com Alembic

## 📄 Licença

[MIT](LICENSE).
