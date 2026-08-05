# ai/

Reserved for the AI/ML services that power predictive failure detection, anomaly
scoring, and root-cause analysis for the Digital Twin.

**Status: not implemented in Phase 2.** The Phase 2 foundation only wires up
placeholder REST endpoints (`POST /api/predict` in the backend) that return mock
responses so the frontend and API contracts can be built against something real.

## Planned scope (future phase)
- Time-series model(s) for CPU/RAM/disk/network forecasting per node
- Anomaly detection service (e.g. isolation forest / seasonal decomposition)
- A lightweight inference API (FastAPI or a Quarkus REST client) that the
  `backend/automation` package will call instead of generating mock values
- Training/evaluation notebooks and a model registry convention

## Suggested structure (future)
```
ai/
  inference-service/   # FastAPI or similar, containerized separately
  models/               # Versioned model artifacts (not committed to git)
  notebooks/            # Exploration and training notebooks
  training/             # Training pipelines/scripts
```
