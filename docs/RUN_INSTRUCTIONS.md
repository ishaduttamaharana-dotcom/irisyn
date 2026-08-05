# Run Instructions

## Local development
See `ENVIRONMENT_SETUP.md`. Short version:
```bash
# terminal 1 — database
podman run -d --name digital-twin-db -e POSTGRES_DB=digital_twin \
  -e POSTGRES_USER=digital_twin -e POSTGRES_PASSWORD=digital_twin \
  -p 5432:5432 postgres:16

# terminal 2 — backend
cd backend && mvn quarkus:dev

# terminal 3 — frontend
cd frontend && npm install && npm run dev
```

## Container images (Podman)
```bash
podman build -t digital-twin-backend -f backend/Containerfile backend
podman build -t digital-twin-frontend -f frontend/Containerfile frontend
```

## Deploy to OpenShift
```bash
oc new-project digital-twin
oc apply -k openshift/base
```
Populate `digital-twin-backend-secret` with real DB credentials before or
right after applying — the template in `openshift/backend/secret-template.yaml`
ships with placeholder values only.
