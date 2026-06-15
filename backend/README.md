# Corrida — Backend (FastAPI)

API REST para a app Corrida. Python + FastAPI + SQLAlchemy + JWT.
Base de dados: **SQLite** por omissão (dev) · **PostgreSQL** em produção (via `DATABASE_URL`).

## Correr localmente

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (PowerShell: .venv\Scripts\Activate.ps1)
pip install -r requirements.txt
copy .env.example .env          # (Linux/Mac: cp)
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs

### PostgreSQL local (opcional)

```bash
docker compose up -d
# no .env:
# DATABASE_URL=postgresql+psycopg://corrida:corrida@localhost:5432/corrida
```

## Endpoints

- `POST /auth/register` · `POST /auth/login` · `GET /auth/me`
- `GET/POST/PUT/DELETE /carros`
- `GET/POST/PUT/DELETE /ganhos`
- `GET/POST/PUT/DELETE /abastecimentos`
- `GET/POST/PUT/DELETE /despesas`
- `GET/PUT /definicoes`
- `GET /health`

Todos (exceto `/auth/*` e `/health`) exigem header `Authorization: Bearer <token>`.

## Deploy (Render)

- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Variáveis: `DATABASE_URL` (Postgres do Render, prefixo `postgresql+psycopg://`),
  `SECRET_KEY`, `CORS_ORIGINS` (domínio do frontend no Vercel).
