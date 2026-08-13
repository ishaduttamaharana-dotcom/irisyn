# IRISYN — Platform Development Roadmap & Phases

## 1. Overview
IRISYN is an AI-powered Digital Twin and Predictive Operations Platform built around the core operating paradigm **SEE • PREDICT • ACT**.

Development progresses across 8 sequential, dependency-ordered phases. Phase dependencies are strict: foundation and data infrastructure must precede advanced analytics and cloud scaling.

```
Phase 1: Architecture & Cleanup (COMPLETE)
  ↓
Phase 2: Data & Telemetry (COMPLETE)
  ↓
Phase 3: Digital Twin Core (COMPLETE)
  ↓
Phase 4: Intelligence & Analytics (COMPLETE)
  ↓
Phase 5: Copilot AI System (COMPLETE)
  ↓
Phase 6: Security & Control (RBAC) (NEXT)
  ↓
Phase 7: Deployment & Reliability
  ↓
Phase 8: Industrial Readiness (MQTT, OPC-UA, Red Hat Edge, OpenShift AI)
```

---

## 2. Development Phases Specification

### Phase 1 — Architecture & Cleanup (STATUS: COMPLETED)
- **Priority**: Critical
- **Objective**: Establish modular frontend/backend separation, typed contracts, API envelopes, 17 routing shell paths, data source labeling, centralized configuration, and standard UI state wrappers.
- **Exit Criteria**: Production build passes; separated API layer; contracts documented ([docs/ARCHITECTURE_PHASE1.md](file:///c:/Users/ACER/Downloads/project-root/docs/ARCHITECTURE_PHASE1.md)).

### Phase 2 — Data & Telemetry (STATUS: COMPLETED)
- **Priority**: Critical
- **Objective**: Real hardware telemetry collector from developer host computer, live WebSockets streaming, persistent historical metrics DB storage, telemetry freshness SLA calculation, sequence gap detection, and source-agnostic collector abstraction (`TelemetryCollector`).
- **Exit Criteria**: Real host computer values collected; WebSockets streaming active; time-series persisted; freshness SLA calculated.

### Phase 3 — Digital Twin Core (STATUS: COMPLETED)
- **Priority**: Critical
- **Objective**: Persistent Digital Twin state engine, physical-to-digital state synchronization, 9-tier operating mode state machine (`OFFLINE`, `IDLE`, `STARTING`, `RUNNING`, `HIGH_LOAD`, `DEGRADED`, `FAULT`, `MAINTENANCE`, `UNKNOWN`), stateVersion tracking, connected resource graph (`/relations`), human-readable timeline (`/timeline`), and real-time `/ws/twins` streaming.
- **Exit Criteria**: Persistent twin state & stateVersion; dynamic operating mode transitions; 3-tier history model; resource graph exposed; real-time `/ws/twins` active.

### Phase 4 — Intelligence (STATUS: COMPLETED)
- **Priority**: High
- **Objective**: Five major intelligence services: Feature/Baseline Engine, Deterministic Health Engine, Statistical Anomaly Detection Engine ($|Z| > 2.5$), Trend Analysis Engine, Prediction Engine, and Evidence/Explainability Audit Panel (`OBSERVED`, `INFERRED`, `PREDICTED`).
- **Exit Criteria**: Deterministic health score; Feature/Baseline Engine; statistical anomalies; trend directions; prediction risk vectors; evidence audit trail.

### Phase 5 — Copilot (STATUS: COMPLETED)
- **Priority**: Critical
- **Objective**: AI Copilot query router, entity/metric/time resolver, mandatory tool query data gate (`CopilotToolRegistry.java`), operational data-access traces (`Source`, `Asset`, `Metric`, `Freshness`, `Quality`), inference tags (`OBSERVED`, `INFERRED`, `PREDICTED`), consequential write confirmation modals.
- **Exit Criteria**:
  - [x] Natural language questions retrieve real data from authorized IRISYN APIs.
  - [x] Zero LLM hallucination of system values.
  - [x] Every response attaches operational data access traces & categorization tags.
  - [x] Consequential write actions require explicit operator confirmation modal.
  - [x] Automated unit test suite passing ([CopilotQueryEngineTest.java](file:///c:/Users/ACER/Downloads/project-root/backend/src/test/java/com/bpp/digitaltwin/CopilotQueryEngineTest.java)).
  - [x] Documentation complete ([docs/PHASE5_COPILOT.md](file:///c:/Users/ACER/Downloads/project-root/docs/PHASE5_COPILOT.md)).

### Phase 6 — Security & Control (STATUS: NEXT)
- **Priority**: High
- **Objective**: Backend RBAC enforcement (`ADMIN`, `ENGINEER`, `OPERATOR`, `VIEWER`), user session management, audit log service, protected settings.
- **Exit Criteria**: Unauthorized API calls rejected on backend; write actions logged to immutable audit trail.

### Phase 7 — Deployment & Reliability
- **Priority**: Critical
- **Objective**: Containerization, production env configurations, database migrations, rate limiting, system health monitoring, backups.
- **Exit Criteria**: Production Docker containerization succeeds; database state persists across restarts.

### Phase 8 — Industrial Readiness
- **Priority**: Future
- **Objective**: PLC, MQTT, OPC-UA, Modbus edge gateway connectors, edge buffering, Red Hat Enterprise Linux / OpenShift / OpenShift AI deployments.
- **Exit Criteria**: Industrial protocol adapters replace synthetic simulator without breaking core platform abstractions.
