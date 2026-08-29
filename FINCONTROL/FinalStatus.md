# FINCONTROL — Final Platform Status & Technical Architecture

## 1. Executive Overview

**FINCONTROL** is an enterprise-grade multi-tenant financial intelligence platform designed for institutional finance, fintech controllers, and risk intelligence teams. It bridges deterministic financial accounting with autonomous AI investigation agents and machine learning anomaly detection.

The platform provides a **Financial Control Tower** capable of autonomously answering complex questions such as *"Why did revenue drop over the last 3 days?"* by executing policy-driven investigation skills, querying controlled Model Context Protocol (MCP) data tools, scoring outliers with Isolation Forest models, generating a structured **Causal Evidence Graph**, and synthesizing evidence-backed root-cause mitigations.

---

## 2. Core Architectural Principles

1. **PostgreSQL as the Single Source of Financial Truth**: All financial arithmetic is computed deterministically in Python services. The Large Language Model (LLM) is **never** permitted to access the database directly or execute arbitrary SQL.
2. **Strict Multi-Tenant Isolation**: Every database query, MCP capability invocation, and ML inference is scoped to the authenticated `organization_id` derived exclusively from verified JWT bearer claims. Malicious client-supplied organization parameters are rejected.
3. **Strict Evidence Classification**: To eliminate AI hallucinations and ensure complete auditability, all data elements throughout the platform are explicitly categorized into four immutable tiers:
   - **`FACT`**: Authoritative, deterministically computed database records (e.g., revenue totals, settled amounts, payment counts).
   - **`PREDICTION`**: Probabilistic machine learning model inferences (e.g., Isolation Forest anomaly scores, financial volatility risk scores).
   - **`HYPOTHESIS`**: Synthesized analytical reasoning that links facts and predictions to explain root causes.
   - **`SIMULATION`**: Read-only hypothetical what-if scenario projections (never committed to production ledger tables).
4. **Controlled MCP Capability Boundary**: AI skills interact with backend financial services through typed, read-only MCP tool contracts requiring an authenticated `ToolContext`.

---

## 3. Technology Stack

### Frontend Layer
- **Framework**: Next.js 15.5.23 (React 19, TypeScript 5, App Router architecture)
- **Styling**: Swiss Information Design System (Vanilla CSS with disciplined spacing, high information density, custom SVG financial charts, and accessible typography via Inter / JetBrains Mono)
- **State & API**: Modular API architecture (`lib/api/*`) with automated JWT authentication headers, request correlation IDs, and resilient fallback data providers

### Backend Layer
- **Framework**: FastAPI (Python 3.12 / 3.14 compatible, asynchronous request handling, Pydantic v2 schemas)
- **Database & ORM**: PostgreSQL via SQLAlchemy 2.0 with Psycopg 3 native binary driver and connection pooling
- **Schema Migrations**: Alembic version-controlled migration chains
- **Authentication**: Cryptographically secure Scrypt password hashing + HMAC-SHA256 JWT tokens

### Machine Learning Layer
- **Outlier Anomaly Detection**: Scikit-Learn **Isolation Forest** (`app/ml/anomaly.py`) computing contamination-adjusted anomaly scores ($0.000$ to $1.000$) with feature contribution breakdowns (basket size, processing latency, timeout durations).
- **Risk Assessment**: Deterministic Multi-Factor Financial Stability Model (`app/ml/risk.py`) evaluating payment reliability, refund ratios, and cash burn velocity.

### AI & Reasoning Layer
- **LLM Engine**: Qwen3 8B via local Ollama adapter (`app/ai/ollama.py`) operating strictly on assembled evidence contexts.
- **Skill Policy Engine**: 10 registered AI reasoning policies (`FINCONTROL/ai/skills/`) covering orchestration, revenue drops, payment declines, settlement delays, revenue leakage, cash flow runway, and scenario modeling.
- **Evidence Graph Generator**: Causal node-and-link network mapping questions, policy skills, facts, predictions, hypotheses, and mitigation actions.

---

## 4. End-to-End Investigation Pipeline

When a financial controller asks a question (e.g., *"Why did revenue fall over the last 3 days?"*), FINCONTROL executes the following deterministic lifecycle:

```text
                                 USER QUESTION
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │      Next.js Frontend         │
                       └───────────────┬───────────────┘
                                       │ POST /api/v1/investigations
                                       ▼
                       ┌───────────────────────────────┐
                       │         FastAPI API           │
                       └───────────────┬───────────────┘
                                       │ Verified JWT Principal Context
                                       ▼
                       ┌───────────────────────────────┐
                       │   Investigation Orchestrator  │
                       │    (Policy Skill Selection)   │
                       └───────┬───────────────┬───────┘
                               │               │
                 ┌─────────────┴──┐         ┌──┴─────────────┐
                 ▼                ▼         ▼                ▼
           Revenue Skill    Payment Skill   Settlement Skill  Anomaly Skill
                 │                │         │                │
                 ▼                ▼         ▼                ▼
         ┌─────────────────────────────────────────────────────────────┐
         │              MCP Capability Boundary Tools                  │
         │   (get_financial_summary, get_payment_breakdown, etc.)     │
         └─────────────┬───────────────────────────────┬───────────────┘
                       │                               │
                       ▼                               ▼
         ┌───────────────────────────┐   ┌───────────────────────────┐
         │  PostgreSQL / SQLAlchemy  │   │  Isolation Forest ML Model│
         │   Deterministic Facts     │   │      ML Predictions       │
         └─────────────┬─────────────┘   └─────────────┬─────────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │ Structured Evidence Assembly
                                       ▼
                       ┌───────────────────────────────┐
                       │     Evidence Graph Builder    │
                       │   (Causal Nodes & Relations)  │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │  Ollama / Qwen Model Adapter  │
                       │ (Evidence-Backed Explanation) │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │  Auditable Database Record    │
                       │    (Investigation & Ledger)   │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │     Interactive UI Render     │
                       │  (Evidence Graph + Actions)   │
                       └───────────────────────────────┘
```

---

## 5. Platform Pages & Capabilities

The frontend consists of **12 fully implemented, production-ready views**:

1. **Control Tower Dashboard (`/`)**: Executive summary of 30-day Gross Revenue, Payment Success Rate, Net Available Cash, Pending Settlements, responsive SVG revenue trajectory chart, payment failure breakdown, and real-time AI signal card.
2. **Autonomous AI Analyst (`/ai-analyst`)**: Interactive investigation console with quick inquiry prompts, 5-stage live animated progress pipeline, Causal Evidence Graph visualization, synthesized hypothesis findings, and operational mitigation action triggers.
3. **Investigation Registry (`/investigations`)**: Searchable audit ledger of all historical investigations with an evidence drawer for compliance reviews.
4. **ML Anomaly Detection Center (`/anomalies`)**: Outlier transaction monitor displaying Isolation Forest anomaly scores, severity classification (`CRITICAL`, `HIGH`, `MODERATE`), and feature attribution (amounts, payment methods, gateway latency).
5. **Revenue Intelligence (`/revenue`)**: Period-over-period revenue trajectories, Average Order Value (AOV) decomposition, and automated order-to-payment leakage checks.
6. **Payment Health (`/payments`)**: Gateway connector health, timeout spike analysis, and decline attribution (e.g., provider timeouts vs insufficient funds).
7. **Settlements & Reconciliation (`/settlements`)**: Payout tracking by gateway provider, expected vs actual settled amounts, and T+2 transit delay alerts.
8. **Cash Flow & Liquidity (`/cash-flow`)**: Operating cash inflow vs outflow statement, expense categorizations, and cash runway burn metrics.
9. **Scenario Simulation Workbench (`/scenarios`)**: Interactive stress-test simulator with parameter sliders (Gross Revenue Delta %, Payment Failure Surge %, Refund Increase %, Transit Delays) computing deterministic projections tagged `SIMULATION`.
10. **Alerts & Surveillance Feed (`/alerts`)**: Live operational notification stream with severity filters and one-click investigation shortcuts.
11. **Settings & Governance (`/settings`)**: Tenant identity configuration, MCP capability boundary inspection, and a registry of all 10 active AI skill policies.
12. **Authentication & Tenant Access (`/auth`)**: Enterprise organization registration, sign-in, and pre-filled quick demo access.

---

## 6. System Verification & Test Status

The system has been verified end-to-end:

| Component | Test Suite / Check | Result | Evidence |
| :--- | :--- | :---: | :--- |
| **Backend Unit & Integration Tests** | `pytest -v` | **20/20 Passed (100%)** | `tests/test_*.py` |
| **Cross-Tenant Security Isolation** | `test_tenant_isolation_e2e.py` | **Passed (Zero Data Leakage)** | `tests/test_tenant_isolation_e2e.py` |
| **Backend Code Quality** | `ruff check app tests scripts alembic` | **0 Errors (100% Clean)** | Ruff linter |
| **PostgreSQL Schema Migrations** | `alembic upgrade head --sql` | **Clean DDL Render** | Alembic migration chain |
| **Frontend Production Build** | `npm run build` | **15/15 Routes Compiled in 2.1s** | Next.js App Router |
| **Frontend HTTP Route Verification** | 12/12 Platform Routes | **100% 200 OK Status** | Live dev server on port 3000 |
| **Comprehensive E2E Script** | `run_e2e_verification.py` | **All 14 Phases Passed** | `scripts/run_e2e_verification.py` |

---

## 7. How to Run the Platform Locally

### Prerequisites
- Python 3.12+ (Virtual environment in `FINCONTROL/backend/.venv`)
- Node.js 18+ and npm

### 1. Start Frontend UI
```powershell
cd d:\FinController\FINCONTROL\frontend
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Run Backend Tests
```powershell
cd d:\FinController\FINCONTROL\backend
.\.venv\Scripts\python.exe -m pytest -v
```

### 3. Run Full End-to-End Verification Suite
```powershell
cd d:\FinController\FINCONTROL\backend
.\.venv\Scripts\python.exe scripts\run_e2e_verification.py
```
