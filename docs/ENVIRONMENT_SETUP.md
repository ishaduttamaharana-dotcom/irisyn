# Environment Setup

## Prerequisites
- Node.js 20+ and npm (frontend)
- Java 17+ and Maven 3.9+ (backend)
- PostgreSQL 16 (or Podman/Docker to run it in a container)
- Podman (or Docker) for building container images
- Access to an OpenShift cluster + `oc` CLI (deployment only)

## 1. Database
```bash
podman run -d --name digital-twin-db \
  -e POSTGRES_DB=digital_twin \
  -e POSTGRES_USER=digital_twin \
  -e POSTGRES_PASSWORD=digital_twin \
  -p 5432:5432 \
  postgres:16
```

## 2. Backend
```bash
cd backend
mvn quarkus:dev
```
Flyway applies `db/migration/V1__init_schema.sql` and `V2__seed_dev_data.sql`
automatically on startup. API available at `http://localhost:8080/api`.

## 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App available at `http://localhost:5173`, proxying `/api` and `/ws` to the backend.

## Environment variables
| Var | Where | Default | Purpose |
|---|---|---|---|
| `DB_URL` | backend | `jdbc:postgresql://localhost:5432/digital_twin` | JDBC connection string |
| `DB_USERNAME` / `DB_PASSWORD` | backend | `digital_twin` / `digital_twin` | DB credentials |
| `CORS_ORIGINS` | backend | `http://localhost:5173` | Allowed frontend origin(s) |
| `VITE_API_BASE_URL` | frontend | `http://localhost:8080/api` | Base URL the SPA calls |
| `VITE_WS_URL` | frontend | `ws://localhost:8080/ws` | WebSocket base URL |
