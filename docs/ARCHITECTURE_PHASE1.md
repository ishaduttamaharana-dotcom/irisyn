# IRISYN — Phase 1: Architecture & Cleanup

## 1. Overview
IRISYN is an AI-powered Digital Twin and Predictive Operations Platform designed around the core paradigm **SEE • PREDICT • ACT**.

Phase 1 establishes a clean, modular, API-driven platform foundation that separates frontend and backend responsibilities, eliminates hardcoded demo data from views, enforces data source categorization, standardizes shared UI states, and prepares the system for scale and future edge/industrial integrations.

---

## 2. Core Architecture & Layering

```
+-----------------------------------------------------------------------+
|                             FRONTEND                                  |
|  React 18 + TypeScript + Vite + Tailwind CSS + React Query + Lucide   |
|                                                                       |
|  [ Routes Shell (17 Modules) ]                                        |
|  [ Shared UI State Container ] ---> (Loading|Success|Empty|Stale|Offline|Error|403)
|  [ Data Source Indicators ] ----> (REAL-TIME LOCAL | SIMULATED | TARGET / FUTURE)
+-----------------------------------------------------------------------+
                                   |
                       REST APIs / WebSockets
                                   v
+-----------------------------------------------------------------------+
|                             BACKEND                                   |
|  Quarkus 3 (Java 21) + Hibernate ORM / Panache + RESTEasy Reactive    |
|                                                                       |
|  [ Asset & Telemetry Domain Engine ]                                  |
|  [ Digital Twin State & Health Model ]                                |
|  [ Local Telemetry Collector (Host Laptop Hardware) ]                  |
|  [ Industrial Asset Physics Simulator (MOTOR-001, PUMP-001) ]          |
|  [ System Info & Diagnostics Engine ]                                 |
|  [ Security & Audit Logging ]                                         |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          PERSISTENCE LAYER                            |
|  PostgreSQL 16 (Flyway Migrations) / In-Memory H2 (Dev Fallback)      |
+-----------------------------------------------------------------------+
```

---

## 3. Data Source Classification

IRISYN strictly demarcates three data source tiers across all APIs and UI representations:

1. **`REAL-TIME LOCAL`**: Real hardware telemetry collected directly from the developer's/operator's host computer (CPU, RAM, Disk, Temperature, Uptime, Processes).
2. **`SIMULATED`**: Physics-calculated synthetic industrial equipment (e.g. `MOTOR-001`, `PUMP-001`, `CNC-001`) with configurable load, speed, thermal properties, and fault injection capability.
3. **`TARGET / FUTURE`**: Industrial edge protocol connectors (PLC, MQTT, OPC-UA, Modbus) and Red Hat OpenShift / Edge deployments planned for future phases.

---

## 4. Core Entities & API Contracts

### Data Model Hierarchy
- **User & Role**: Platform user accounts with RBAC (`ADMIN`, `ENGINEER`, `OPERATOR`, `VIEWER`).
- **Asset**: Equipment or node representation with type, data source, status, location, health breakdown, operating parameters.
- **Sensor & Metric**: Granular telemetry sensors, measurement channels, and historical metric series.
- **Telemetry**: Real-time telemetry snapshot and streaming payload.
- **Health & Anomaly**: Composite 0–100 health index and multi-factor anomaly diagnostics.
- **Alert & Incident**: Threshold triggers, system alerts, and operational incident logs.
- **Maintenance**: Predictive work orders, action items, and scheduled maintenance.
- **Prediction**: Failure probability predictions and horizon estimates.
- **Simulation**: Synthetic load profiles, speed controls, and fault triggers.
- **Configuration & AuditLog**: System-wide settings and immutable operational audit logs.

### Key REST Endpoints
- `GET /api/system/info`: System health, DB status, telemetry freshness (ms), active data sources, environment.
- `GET /api/assets`: List all assets across data sources.
- `GET /api/assets/{id}`: Detailed asset state, health breakdown, telemetry summary.
- `GET /api/assets/{id}/telemetry`: Live metric streams / historical time series.
- `GET /api/telemetry/local`: Real laptop hardware telemetry snapshot.
- `GET /api/simulation`: Synthetic industrial simulation status and control endpoints.
- `GET /api/incidents`: Operational incidents list.
- `GET /api/maintenance`: Maintenance recommendations and work orders.
- `GET /api/predictions`: AI/ML predictive analytics summaries.
- `GET /api/diagnostics`: Platform diagnostic diagnostics and self-test.
- `GET /api/integrations`: Connector status (Local Telemetry, Synthetic Simulator, MQTT, OPC-UA, Modbus).
- `GET /api/reports`: Platform operational summary reports.

---

## 5. UI State Standardization

Every data-driven page and widget uses `DataStateContainer` to render standardized UX states:
- **Loading**: Pulse skeletons or loader spinners during initial fetch.
- **Success**: Fully rendered data view.
- **Empty**: Informative graphic and call-to-action when data sets are empty.
- **Stale**: Yellow warning banner when telemetry data freshness exceeds the configured SLA (>5000ms).
- **Offline**: Connection alert when the backend service is unreachable.
- **Error**: Error message with technical details and retry action.
- **Permission Denied**: Warning when user role permissions prevent access.
