# Folder Explanation

```
project-root/
  frontend/        React + TypeScript + Vite SPA (dashboard UI)
  backend/         Quarkus REST + WebSocket API
  ai/               Reserved for future AI/ML inference services (not built in Phase 2)
  automation/       Reserved for future autonomous remediation workflows (not built in Phase 2)
  monitoring/       Prometheus + Grafana placeholder configuration
  database/         DB bootstrap docs (actual schema lives in backend/.../db/migration)
  openshift/        Kubernetes/OpenShift manifests + Kustomize base, one folder per component
  docs/             This documentation set
  .github/workflows/  CI pipelines for frontend and backend
```

Each of `frontend/`, `backend/`, `monitoring/`, `database/`, `ai/`, and
`automation/` has its own `README.md` with stack details and setup steps
specific to that piece.
