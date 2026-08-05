# database/

PostgreSQL is the system of record for the Digital Twin. Schema ownership lives
with **Flyway migrations inside the backend module** — see
`backend/src/main/resources/db/migration/`:

- `V1__init_schema.sql` — tables: `users`, `servers`, `metrics`, `alerts`,
  `predictions`, `vms`, `containers`, `automation_logs`
- `V2__seed_dev_data.sql` — minimal local/dev seed data

This top-level folder holds database-level assets that aren't Flyway
migrations: local bootstrap scripts and ER documentation.

## Local bootstrap (Podman/Docker)
```bash
podman run -d --name digital-twin-db \
  -e POSTGRES_DB=digital_twin \
  -e POSTGRES_USER=digital_twin \
  -e POSTGRES_PASSWORD=digital_twin \
  -p 5432:5432 \
  postgres:16
```
Then run the backend (`mvn quarkus:dev` from `backend/`) — Flyway applies the
migrations automatically on startup.

## Entities (Phase 2)
| Table              | Purpose                                      |
|---------------------|-----------------------------------------------|
| `users`             | Application users + role (ADMIN/OPERATOR/VIEWER) |
| `servers`           | Physical node inventory + live resource usage |
| `metrics`           | Time-series CPU/RAM/disk/network samples per server |
| `alerts`            | Active/historical alerts with severity        |
| `predictions`       | AI prediction results (placeholder data for now) |
| `vms`               | Virtual machines and their host server        |
| `containers`        | Containers/pods and their status              |
| `automation_logs`   | Audit trail of automation/recovery actions    |
