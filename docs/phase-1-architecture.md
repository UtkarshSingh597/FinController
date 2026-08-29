# FINCONTROL Phase 1: Architecture and Repository Validation

**Status:** complete  
**Scope:** architecture validation only; no runtime application code is included.

## Repository findings

The repository initially contains only the following AI skill policies under `FINCONTROL/ai/skills`:

- anomaly investigation
- cash-flow analysis
- financial analysis
- payment analysis
- revenue investigation
- revenue leakage
- risk assessment
- scenario simulation
- settlement analysis

The required `investigation_orchestrator` policy is absent. Phase 11 must not be started until that policy is supplied or approved for creation. Skill filename casing is also inconsistent; normalize it only as part of a deliberate repository-structure change so Windows and case-sensitive deployment environments behave consistently.

There is currently no backend, frontend, dependency manifest, test suite, database schema, migration setup, container configuration, or CI configuration. The `FINCONTROL/` directory is untracked, so its policies must be added to version control before collaborative development starts.

## Proposed topology

```text
Next.js frontend
      |
      | HTTPS / authenticated API requests
      v
FastAPI API  ---> application services ---> repositories ---> PostgreSQL
      |                  |                      |
      |                  |                      +--> organization predicate required
      |                  +--> deterministic analytics / ML inference
      |
      +--> investigation engine --> MCP client --> MCP server --> approved services
                                            |
                                            +--> structured evidence only

Ollama model <---- model adapter <---- investigation engine
```

The MCP server is an internal capability boundary, not a public database proxy. It receives validated, organization-scoped request models and returns defined evidence models. It has no arbitrary-SQL, filesystem, shell, code-execution, or financial-record mutation capability.

## Repository structure

```text
FINCONTROL/
  backend/
    app/
      api/              # routers and dependency wiring only
      core/             # configuration, security, logging, errors
      db/               # SQLAlchemy session and migrations wiring
      domain/           # SQLAlchemy entities and domain enums
      schemas/          # Pydantic request/response models
      repositories/     # organization-scoped data access
      services/         # financial business logic
      ml/               # versioned inference/training pipelines
      mcp/              # MCP server and tool adapters
      ai/               # skill registry, model adapter, orchestration
    alembic/
    tests/
  frontend/
  ai/skills/
  infra/
  docs/
```

## Core boundary decisions

| Layer | Owns | Must not own |
| --- | --- | --- |
| API | authentication dependencies, validation, response mapping | business calculations or direct model decisions |
| Services | financial calculations, authorization-aware workflows | raw request parsing or arbitrary SQL |
| Repositories | parameterized persistence access | cross-organization queries without an explicit privileged scope |
| ML | reproducible inference and feature explanations | authoritative financial facts |
| MCP | tool contracts, authorization checks, structured evidence | generic data access or mutations |
| AI | intent, plan selection, evidence interpretation | financial truth, direct data access, or calculations where services exist |

## Multi-tenancy and authorization baseline

1. All tenant-owned entities carry a non-null `organization_id` with an index appropriate to their access patterns.
2. Repository methods accept an `organization_id` explicitly and never infer it from client-controlled query parameters.
3. The authenticated identity determines organization membership and role before any service call.
4. Investigation records, audit records, artifacts, and ML evidence are organization-scoped too.
5. Database constraints support application checks. Future PostgreSQL row-level security is recommended as defense in depth after the schema is established.
6. The MCP tool context carries a verified principal and organization ID; tool inputs cannot override either.

## Financial data and evidence model

Authoritative services return typed evidence items containing a source, metric/record identity, period, calculation version, values, and timestamp. Investigation outputs assemble those items rather than copying numbers into untraceable prose.

Every conclusion component has exactly one classification:

- `fact`: deterministic data or service calculation
- `prediction`: versioned ML output with uncertainty
- `hypothesis`: unconfirmed explanation with supporting evidence references
- `simulation`: read-only scenario-engine result with explicit assumptions

## Implementation sequence and acceptance gates

| Phase | Deliverable | Gate |
| --- | --- | --- |
| 2 | FastAPI foundation | health check, config validation, test execution |
| 3–5 | PostgreSQL, migrations, auth/tenancy, financial models | migration round-trip and tenant-isolation tests |
| 6–8 | deterministic demo data, analytics, ML | reproducible data and model validation tests |
| 9–12 | MCP, model adapter, skills, investigation engine | tool auth/input tests and auditable evidence flow |
| 13 | simulation engine | read-only invariants and deterministic scenarios |
| 14–16 | frontend and live investigation state | accessible critical-flow verification |
| 17–20 | hardening, tests, deployment | security suite, lint/type checks, deployment validation |

## Phase 1 security review

No executable interfaces exist yet, so there is no current API or database attack surface. The central risks to preserve in subsequent phases are tenant-bound authorization at every repository/service/tool boundary; absent secrets from logs and investigation records; safe token lifetime validation; and an AI layer constrained to approved read-only tool calls.

## Explicit prerequisites for later work

- Add the missing `investigation_orchestrator/SKILL.md` before Phase 11.
- Decide the supported local runtime versions and dependency management approach in Phase 2.
- Supply development secrets through an untracked environment file; never commit them.
- Define a role matrix (for example owner, analyst, viewer) before implementing authorization-sensitive endpoints in Phase 4.
