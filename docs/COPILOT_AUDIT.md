# IRISYN Master Copilot Audit & Architecture Report (COPILOT_AUDIT.md)

## 1. Executive Summary & Audit Overview
This audit inspects the current IRISYN Copilot implementation against the **Master Data-First Copilot Rebuild Specification**. 

The fundamental architectural principle of IRISYN Copilot is:
> **The LLM is NOT the source of truth.** IRISYN backend APIs, Digital Twin state engine, telemetry DB storage, and deterministic calculation engines are the sole authoritative source of truth. The LLM explains validated IRISYN results.

```
USER
  ↓
IRISYN COPILOT UI (CopilotConsole.tsx / CopilotDrawer.tsx)
  ↓
POST /api/copilot/chat
  ↓
COPILOT SERVICE & QUERY ROUTER
  ├─ Intent Resolution (CURRENT_DATA, HEALTH, ANOMALY, PREDICTION, MAINTENANCE, etc.)
  ├─ Entity Resolution ("Motor 1" → MOTOR-001)
  ├─ Metric Resolution ("CPU usage" → cpu, "temperature" → temperature)
  └─ Time Resolution ("last 6 hours" → startTime/endTime)
  ↓
DATA GATE & AUTHORIZATION
  ↓
TOOL ROUTER (CopilotToolRegistry.java)
  ├─ Telemetry Service / Database History
  ├─ Digital Twin Engine / Health Factors
  ├─ Anomaly Detection Engine ($|Z| \ge 2.5\sigma$)
  ├─ Prediction Risk Engine
  └─ Alerts / Incidents / Maintenance / Simulation Status
  ↓
DETERMINISTIC CALCULATION ENGINE (average, min, max, zScore, trend, rateOfChange)
  ↓
RESULT VALIDATOR (Source, Freshness, Data Quality SLA)
  ↓
CONTEXT BUILDER
  ↓
LLM PROVIDER ABSTRACTION (AIProvider -> ProviderA / ProviderB)
  ↓
RESPONSE GENERATOR & CHAT-TO-UI ACTIONS
  ├─ Text / Table / Chart Renderers
  └─ Consequential Write Action Confirmation Modal
```

---

## 2. Comprehensive Component Audit Matrix

### 2.1 Current Copilot Flow & Wiring Audit

| Component Layer | Current Implementation Status | Identified Deficiencies & Root Cause | Required Remediation |
|---|---|---|---|
| **API Endpoint Path** | `POST /api/copilot/query` | Mismatch with spec path `POST /api/copilot/chat` | Add `POST /api/copilot/chat` endpoint and request DTO envelope |
| **LLM Integration Layer** | Local deterministic rule engine | Lacks external LLM provider abstraction (`AIProvider` interface) | Implement pluggable `AIProvider` interface with `OpenAIProvider` / `LocalProvider` fallback |
| **Query Intent Classification** | Simple keyword search (`contains("unhealthy")`) | 18 canonical query categories (e.g. `HISTORICAL_DATA`, `COMPARISON`, `INCIDENT`) are partially categorized | Upgrade Query Router into a 18-category classifier with intent DTO |
| **Entity & Alias Resolver** | Partial keyword match (`motor` $\rightarrow$ `MOTOR-001`) | No clarification mechanism when asset identity is ambiguous | Implement strict `EntityResolver` querying Panache `AssetEntity` database |
| **Time Range Resolver** | Static defaults | Natural language time expressions ("last 6 hours", "since morning") not converted to exact ISO timestamps | Implement `TimeRangeResolver` computing `startTime` / `endTime` ISO ranges |
| **Tool Calling Suite** | Basic 6 tools in `CopilotToolRegistry.java` | Lacks historical time-series aggregation tools, incident timelines, and database health checks | Expand tool suite to 30+ tools specified in Section 9 |
| **Data Quality & Freshness SLA** | 4-tier freshness indicator | Freshness threshold validation not explicitly gating stale telemetry in all tool queries | Enforce strict `DataFreshnessGate` returning `DATA_STALE` when metric age > threshold |
| **Consequential Action Gate** | Modal banner in UI | Permission checks not enforced server-side before rendering confirmation DTO | Enforce server-side RBAC permission check before returning action confirmation DTO |
| **Audit Logging** | Local execution logs | Lacks structured operational audit trail for Copilot requests | Implement `CopilotAuditLogger` recording request ID, user ID, tool calls, and execution outcome |

---

## 3. Existing API & Data Source Inventory

### 3.1 Backend Endpoints Available vs Required

| REST API Endpoint | Current Backend Status | Exposed Data |
|---|---|---|
| `GET /api/assets` | **AVAILABLE** | List all connected physical & synthetic assets |
| `GET /api/assets/{id}` | **AVAILABLE** | Single asset entity details, health score, operating mode |
| `GET /api/assets/{id}/health` | **AVAILABLE** | Health model factors, weights, contributor breakdown |
| `GET /api/assets/{id}/anomalies` | **AVAILABLE** | Statistical Z-score anomalies ($|Z| \ge 2.5\sigma$) |
| `GET /api/assets/{id}/predictions` | **AVAILABLE** | Failure probability risk vectors & horizons |
| `GET /api/assets/{id}/trends` | **AVAILABLE** | Trajectory directions (`RISING`, `FALLING`, `STABLE`) |
| `GET /api/intelligence/overview` | **AVAILABLE** | Fleet-wide risk and health rankings |
| `POST /api/copilot/chat` | **NEEDS REBUILD** | Natural language chat endpoint returning structured response payload |

---

## 4. Root Cause Analysis of Data Inaccuracy
1. **Direct Model Memory vs Data Tool Execution**:
   - In standard LLM setups, models attempt to synthesize system answers from prompt text. In IRISYN, system data changes at high frequency (0.8s SLA).
2. **Missing Entity & Canonical Metric Resolution**:
   - Natural language queries like *"vibration on server 3"* must be deterministically mapped to `dc-node-03` and metric `disk` before any DB query.
3. **Lack of Pluggable AI Provider Abstraction**:
   - Currently, domain logic is tied to hardcoded strings rather than an enterprise `AIProvider` interface with backend credentials (`LLM_API_KEY`, `LLM_MODEL`).

---

## 5. Security & Deployment Audit
- **Secrets Isolation**: Environment variables (`LLM_API_KEY`, `LLM_MODEL`, `LLM_PROVIDER`) must strictly reside on the backend. Frontend must never access or leak provider credentials.
- **Role-Based Access Control (RBAC)**: All tool invocations must validate caller role (`ADMIN`, `ENGINEER`, `OPERATOR`, `VIEWER`). Read-only users (`VIEWER`) are blocked from action execution.
- **Audit Logging**: Write actions (`CREATE_MAINTENANCE_WORK_ORDER`, `INJECT_FAULT`) write immutable entries to `AuditLogEntity`.

---

## 6. Recommended Rebuild Plan

### Step 1: Pluggable AI Provider Abstraction (`AIProvider.java`)
- Create backend `AIProvider` interface and implementation classes (`OpenAIProvider`, `IRISYNLocalProvider`).
- Create `.env.example` with backend-only environment variable names.

### Step 2: IRISYN Copilot Rebuild Endpoint (`POST /api/copilot/chat`)
- Implement `POST /api/copilot/chat` accepting `{ "message": "...", "context": { ... } }` and returning structured responses (`type`: `"text" | "table" | "chart" | "action_confirmation"`).

### Step 3: Expanded Tool Registry & Resolvers
- Upgrade `EntityResolver`, `MetricResolver`, and `TimeRangeResolver`.
- Expand `CopilotToolRegistry.java` to support 30+ tools (assets, telemetry, twin history, health factors, alerts, predictions, maintenance, system status).

### Step 4: Deterministic Calculation Engine & Result Validation
- Implement `CopilotCalculationEngine.java` (average, min, max, stdDev, rateOfChange, trend, zScore).
- Enforce strict `ResultValidator` and `DataFreshnessGate`.

### Step 5: Frontend UI Rebuild & Action Confirmation Modal
- Update `copilot.service.ts` and `CopilotConsole.tsx` to communicate exclusively with `POST /api/copilot/chat`.
- Implement Section 9 Action Confirmation Modal and Section 8 "Why This Answer?" Evidence Audit Panel.
