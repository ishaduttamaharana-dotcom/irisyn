# Digital Twin — Backend (Quarkus)

REST + WebSocket backend for the AI-Powered Autonomous Data Center Digital Twin.

## Stack
- Quarkus 3.13 (Java 17)
- RESTEasy Reactive + Jackson
- Hibernate ORM with Panache, PostgreSQL, Flyway migrations
- Hibernate Validator (bean validation)
- Quarkus WebSockets Next (real-time channel scaffold)
- SmallRye JWT (security scaffold, not yet enforced)
- Micrometer + Prometheus, SmallRye Health (monitoring)
- SmallRye OpenAPI + Swagger UI

## Getting started
```bash
cd backend
# requires a local PostgreSQL, or run: podman run -e POSTGRES_DB=digital_twin \
#   -e POSTGRES_USER=digital_twin -e POSTGRES_PASSWORD=digital_twin -p 5432:5432 postgres:16
mvn quarkus:dev
```
- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui
- Health: http://localhost:8080/api/health
- Metrics: http://localhost:8080/metrics

## Package layout
```
controller/   REST resources (one per domain: servers, metrics, alerts, cluster, vms, containers, AI/automation)
service/      Business logic for read-side resources + chat placeholder
repository/   Panache repositories, one per entity
entity/       JPA entities + enums
dto/          Request/response records, decoupled from entities
config/       Cross-cutting config (OpenAPI, etc.)
security/     Auth/RBAC scaffolding (not enforced yet)
automation/   Prediction/recovery placeholder services
websocket/    Real-time channel scaffold
monitoring/   Health check endpoint
exception/    Global exception mapper + ApiException
```

## Endpoints (Phase 2 — mock/placeholder data)
| Method | Path            | Notes                                   |
|--------|-----------------|------------------------------------------|
| GET    | /api/servers    | Reads from `servers` table               |
| GET    | /api/metrics    | Reads from `metrics` table                |
| GET    | /api/alerts     | Reads from `alerts` table                 |
| GET    | /api/cluster    | Aggregated from `servers`                 |
| GET    | /api/vms        | Reads from `vms` table                    |
| GET    | /api/containers | Reads from `containers` table             |
| POST   | /api/predict    | Returns a randomized mock prediction      |
| POST   | /api/recover    | Simulates accepting a recovery action     |
| POST   | /api/chat       | Canned OpenClaw placeholder reply         |

Seed data for local development lives in `src/main/resources/db/migration/V2__seed_dev_data.sql`.

## Notes for Phase 2
- `quarkus.hibernate-orm.database.generation=validate` — schema is owned entirely by Flyway,
  not Hibernate auto-DDL, so the entities and `V1__init_schema.sql` must be kept in sync.
- Security (`security/`) and prediction/recovery logic (`automation/`) are intentionally
  thin scaffolds per the Phase 2 brief — advanced AI/automation logic is out of scope here.
