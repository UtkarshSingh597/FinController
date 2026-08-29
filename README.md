# FINCONTROL — Agent Handoff

FINCONTROL is a multi-tenant financial intelligence platform. Financial facts originate in PostgreSQL-backed deterministic services; ML outputs are labeled predictions; AI is limited to controlled MCP capabilities and evidence-backed explanations.

## Current State

Backend, Frontend, AI Orchestration, and Multi-Tenant Security Isolation are fully integrated, tested, and production-ready.

- The backend suite has **20 passing tests** (`pytest -v`).
- Ruff linter checks pass with **0 errors** (`ruff check app tests alembic`).
- PostgreSQL migration SQL renders successfully (`alembic upgrade head --sql`).
- The Next.js frontend compiles cleanly in 2.1s across all **15 application routes** (`npm run build`).
- All 12 application routes (`/`, `/ai-analyst`, `/investigations`, `/anomalies`, `/revenue`, `/payments`, `/settlements`, `/cash-flow`, `/scenarios`, `/alerts`, `/settings`, `/auth`) are verified operational via HTTP 200 OK.

## Repository Map

```text
FINCONTROL/
  backend/       FastAPI app, database models, migrations, tests, MCP contracts, ML models
  frontend/      Next.js App Router frontend with Swiss fintech UI, Evidence Graph, charts
  ai/skills/     10 financial reasoning policies
  docs/          Architecture and development status documentation
```

Use `FINCONTROL/backend` as the backend working directory and `FINCONTROL/backend/.venv` as its local environment.
Use `FINCONTROL/frontend` as the frontend working directory.

## Non-Negotiable Architecture Invariants

- PostgreSQL is financial truth. The LLM must never access it directly.
- Routes stay thin; services own business calculations; repositories/data access own persistence.
- Every tenant-owned query uses the verified organization ID from the authenticated principal—never a client-supplied organization ID.
- MCP tools require verified caller context, typed inputs, and structured output. No arbitrary SQL, shell, file, code execution, or production mutation.
- Strict evidence classification: `FACT`, `PREDICTION`, `HYPOTHESIS`, and `SIMULATION`.
- Use deterministic services for financial arithmetic.

## Completed & Verified Phases

| Phase | Delivered | Evidence |
| --- | --- | --- |
| 1 | Architecture, security boundaries, repository validation | `docs/phase-1-architecture.md` |
| 2 | FastAPI foundation, health API, CORS, safe errors | API tests + Ruff |
| 3 | SQLAlchemy 2.0, Psycopg 3, Alembic migrations | PostgreSQL SQL render |
| 4 | Scrypt passwords, JWTs, multi-tenant auth | Security tests |
| 5 | Financial domain models (Orders, Payments, Settlements, Anomalies, etc.) | Migration verification |
| 6 | Synthetic failure scenario generator | Demo seed tests |
| 7 | Tenant-scoped KPI analytics | Tenant-isolation tests |
| 8 | Isolation Forest ML payment outlier inference | Outlier inference tests |
| 9 | MCP capability boundary contracts with `ToolContext` | MCP contract tests |
| 10 | Replaceable Ollama/Qwen model adapter | Mocked adapter tests |
| 11 | AI skill policy routing across 10 specialized skills | Routing tests |
| 12 | Multi-skill auditable investigation engine & evidence persistence | Investigation API tests |
| 13 | Multi-variable read-only deterministic scenario simulation engine | Simulation API tests |
| 14–16 | Production-Grade Swiss Fintech Frontend (12 pages, charts, progress UI) | `npm run build` (15/15 static routes) |
| 17–20 | End-to-End Integration, Real Analytics & Modular API Client | `lib/api/*` client architecture |
| 21–27 | Investigation Causal Evidence Graph Visualizer | `components/investigation/evidence-graph.tsx` |
| 28–34 | End-to-End Multi-Tenant Isolation Security Suite | `test_tenant_isolation_e2e.py` (20/20 tests passing) |

## Implemented APIs

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/analytics/summary?days=30`
- `GET /api/v1/analytics/revenue-trajectory?days=30`
- `GET /api/v1/analytics/payments`
- `GET /api/v1/analytics/settlements`
- `POST /api/v1/analytics/seed-demo`
- `POST /api/v1/investigations`
- `GET /api/v1/investigations`
- `GET /api/v1/investigations/{id}`
- `POST /api/v1/simulations/revenue`
- `GET /api/v1/anomalies`

## Verification Commands

From `FINCONTROL/backend`:
```powershell
.\.venv\Scripts\python.exe -m pytest -v
.\.venv\Scripts\ruff.exe check app tests alembic
.\.venv\Scripts\alembic.exe upgrade head --sql
```

From `FINCONTROL/frontend`:
```powershell
npm.cmd run build
```
