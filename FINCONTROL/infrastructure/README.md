# FINCONTROL — Production Infrastructure & Deployment

This directory contains containerization, reverse proxying, and observability configurations for the FINCONTROL platform.

## Directory Structure

```text
infrastructure/
├── docker/
│   ├── Dockerfile.backend       # Multi-stage build for FastAPI + ML inference
│   ├── Dockerfile.frontend      # Standalone Next.js 15 production build
│   ├── docker-compose.yml       # Full stack: Postgres, Redis, Backend, Frontend, Ollama, Nginx
│   └── .env.docker.example      # Environment template
├── nginx/
│   ├── nginx.conf               # Master Nginx configuration (gzip, SSL, timeouts)
│   └── fincontrol.conf          # Reverse proxy routing /api -> Backend, / -> Next.js
└── monitoring/
    ├── prometheus.yml           # Prometheus scrape configs for FastAPI & system metrics
    └── grafana/
        ├── datasources/         # Auto-provisioned Prometheus datasource
        └── dashboards/          # Financial telemetry & API latency dashboard
```

## Quickstart with Docker Compose

1. **Configure Environment**:
   ```bash
   cp infrastructure/docker/.env.docker.example infrastructure/docker/.env
   ```

2. **Launch Full Stack**:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up --build -d
   ```

3. **Access Services**:
   - **Frontend**: `http://localhost` (or `http://localhost:3000`)
   - **Backend OpenAPI Docs**: `http://localhost/docs` (or `http://localhost:8000/docs`)
   - **Ollama AI Engine**: `http://localhost:11434`
