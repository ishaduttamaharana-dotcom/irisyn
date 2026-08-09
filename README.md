# IRISYN — AI-Powered Autonomous Data Center Digital Twin

Phase 2 — Foundation & Core Application Setup. This monorepo contains the
scaffolding for the platform: frontend, backend, database, monitoring, and
deployment, all wired together with mock data. Advanced AI and automation
logic is intentionally **not** implemented yet — see `ai/README.md` and
`automation/README.md` for what's planned.

## Structure
```
project-root/
  frontend/     React + TypeScript + Vite dashboard (Tailwind, React Query, Recharts, Socket.io)
  backend/      Quarkus REST + WebSocket API (Hibernate/Panache, PostgreSQL, Flyway)
  ai/            Placeholder for future AI/ML inference services
  automation/    Placeholder for future autonomous remediation workflows
  monitoring/    Prometheus + Grafana placeholder config
  database/      DB bootstrap notes (schema owned by backend Flyway migrations)
  openshift/     Deployment/Service/Route/ConfigMap/Secret/PVC manifests + Kustomize base
  docs/          Environment setup, dev guide, run instructions, folder explanation
  .github/       CI workflows for frontend and backend
```

## Quick start
```bash
# 1. database
podman run -d --name digital-twin-db -e POSTGRES_DB=digital_twin \
  -e POSTGRES_USER=digital_twin -e POSTGRES_PASSWORD=digital_twin \
  -p 5432:5432 postgres:16

# 2. backend
cd backend && mvn quarkus:dev

# 3. frontend (new terminal)
cd frontend && cp .env.example .env && npm install && npm run dev
```
Frontend: http://localhost:5173 · API: http://localhost:8080/api · Swagger UI: http://localhost:8080/api/swagger-ui

Full details: `docs/ENVIRONMENT_SETUP.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/RUN_INSTRUCTIONS.md`, `docs/FOLDER_EXPLANATION.md`.

## What's implemented in this phase
- Full frontend routing/layout/theming shell with all 10 dashboard sections, running on mock data
- Full backend package structure with entities, repositories, DTOs, and REST controllers for every Step 5 endpoint (`/servers`, `/metrics`, `/alerts`, `/cluster`, `/vms`, `/containers`, `/predict`, `/recover`, `/chat`)
- PostgreSQL schema via Flyway (`V1__init_schema.sql`) + dev seed data (`V2__seed_dev_data.sql`)
- Global exception handling, request validation, WebSocket scaffold, health/metrics endpoints, OpenAPI/Swagger UI
- Prometheus/Grafana placeholder config, OpenShift manifests + Podman Containerfiles, CI workflows

## What's explicitly out of scope for this phase
- Real AI prediction/anomaly-detection models (`ai/`)
- Real automated recovery orchestration against OpenShift (`automation/`)
- Enforced authentication/authorization (security scaffolding exists in `backend/.../security/` but nothing is locked down yet)
