# IRISYN — Engineering Rules & Platform Standards

## 1. Core Rule
IRISYN is built as a real software platform. Architecture takes priority over superficial visuals.

$$\text{REAL DATA} \longrightarrow \text{CLEAN API} \longrightarrow \text{DOMAIN LOGIC} \longrightarrow \text{VALIDATED STATE} \longrightarrow \text{UI}$$

Do not optimize for visual appearance at the expense of software architecture.

---

## 2. Platform Practices & Standards

### Mandatory Practices
- **TypeScript**: Mandatory type safety across all frontend components, hooks, services, and domain types.
- **Strong Typing & Contracts**: Strict schema validation for requests and responses.
- **Service/Repository Separation**: Clean layering (Route $\rightarrow$ Validation $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Database).
- **Centralized Configuration**: All thresholds, SLA timeouts, endpoints, and health weights managed via `appConfig.ts` and `application.properties`.
- **Data Source Tagging**: Explicit tag on every data object (`REAL-TIME LOCAL`, `SIMULATED`, `TARGET / FUTURE`).
- **Error Boundaries & Shared States**: Standardized UI wrappers for `loading`, `success`, `empty`, `stale`, `offline`, `error`, and `permissionDenied`.
- **Server-Side Authorization & Audit**: Security boundaries enforced on backend endpoints with audit logging for consequential write actions.

### Prohibited Practices
- **No Duplicated Business Logic**: Business calculations belong in backend domain services, not UI components.
- **No Hardcoded Telemetry Values**: UI components consume APIs via typed services. No `const temp = 74.2` in components.
- **No Hidden Synthetic Data**: Simulated data must always display the `SIMULATED` badge.
- **No Stack Trace Exposure**: Production errors return clean error envelopes without exposing internal stack traces or database URLs.
- **No Hallucinated LLM Metrics**: AI Copilot tools query authoritative APIs and provide operational data-access summaries.

---

## 3. Data Source Classification

Every data object and UI representation must display one of three data source labels:

1. **`REAL-TIME LOCAL`**: Host computer hardware telemetry (CPU, RAM, Disk, Temperature, Uptime).
2. **`SIMULATED`**: Physics-calculated synthetic industrial assets (`MOTOR-001`, `PUMP-001`).
3. **`TARGET / FUTURE`**: Planned edge protocol connectors (PLC, MQTT, OPC-UA, Modbus, Red Hat Edge).

---

## 4. Controlled Error Categories

All API error responses map to consistent categories:
- `VALIDATION_ERROR`: Invalid request body, parameter, or schema validation failure.
- `UNAUTHORIZED`: Authentication missing or token invalid.
- `FORBIDDEN`: Role-based access permission denied.
- `NOT_FOUND`: Target asset, entity, or resource not found.
- `CONFLICT`: Resource state conflict.
- `RATE_LIMITED`: API query rate threshold exceeded.
- `INTERNAL_ERROR`: Internal operational server error.
- `SERVICE_UNAVAILABLE`: Subsystem or connector offline.

---

## 5. AI & Copilot Boundaries

- **LLM is NOT the Source of Truth**: The LLM executes IRISYN data tools to fetch empirical measurements.
- **Operational Data-Access Summaries**: System responses report `Source`, `Asset`, `Metric`, `Period`, `Freshness`, and `Quality`.
- **Inference Categorization**:
  - `OBSERVED`: Directly measured sensor value.
  - `INFERRED`: Derived analytical conclusion.
  - `PREDICTED`: Model forecast or risk probability.
- **Action Boundaries**: Read actions execute directly; Write actions (fault injection, scenario changes, configuration edits) require explicit confirmation modals and audit logs.
