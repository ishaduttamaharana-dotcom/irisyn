# IRISYN — Phase 3: Digital Twin Core Specification & Signoff

## 1. Executive Summary
Phase 3 transforms the real-time telemetry pipeline into a structured, persistent **Digital Twin Core Engine**. The Digital Twin is a structured physical-to-digital state synchronization model that bridges live telemetry to operational decision making.

```
Telemetry Input
      ↓
Twin State Engine (stateVersion)
      ↓
Operating Mode State Machine
      ↓
Connected Resource Graph (Relations)
      ↓
3-Tier History Architecture
      ↓
REST API & /ws/twins Channel
      ↓
Frontend Twin Inspector & AI Copilot
```

---

## 2. Phase 3 Sub-Phases Deliverables & Status Matrix

| Sub-Phase | Component | Status | Key Features |
|---|---|---|---|
| **Phase 3.1** | Generic Twin Model | **COMPLETE** | Stable asset ID, state schema, operating mode schema, stateVersion, freshness SLA, relations |
| **Phase 3.2** | Twin State Engine | **COMPLETE** | Ingest telemetry $\rightarrow$ resolve asset $\rightarrow$ evaluate metrics $\rightarrow$ calculate freshness $\rightarrow$ drive state machine $\rightarrow$ publish events |
| **Phase 3.3** | Operating Mode Engine | **COMPLETE** | 9-tier state machine (`OFFLINE`, `IDLE`, `STARTING`, `RUNNING`, `HIGH_LOAD`, `DEGRADED`, `FAULT`, `MAINTENANCE`, `UNKNOWN`) |
| **Phase 3.4** | Historical Twin State | **COMPLETE** | State transition storage (`DigitalTwinHistoryEntity`), history API (`/history`), timeline API (`/timeline`) |
| **Phase 3.5** | Twin Relationships | **COMPLETE** | Resource graph (`/relations`) linking sensors, telemetry streams, alerts, anomalies, predictions, maintenance, location |
| **Phase 3.6** | Twin Visualization | **COMPLETE** | State-driven 3D spatial rack visualizer, asset selection, sensor status matrix, twin inspection drawer |
| **Phase 3.7** | Asset Overview | **COMPLETE** | Complete single-screen asset condition view combining identity, source, state, health, metrics, predictions, maintenance |
| **Phase 3.8** | Integration with AI | **COMPLETE** | Exposes Twin state tools to Copilot for state inspection, state transition timing, sensor status, and freshness SLA audit |
| **Phase 3.9** | Testing & Verification | **COMPLETE** | Unit tests (`DigitalTwinStateTest.java`), type check (`npx tsc --noEmit`), production build (`npm run build`) |

---

## 3. 3-Tier History Architecture
IRISYN strictly separates measurements, state changes, and human operational milestones:

1. **Raw Telemetry History**: High-frequency measurements (`GET /api/telemetry/history`).
2. **Twin State History**: Meaningful state transitions & operating mode changes (`GET /api/twins/:id/history`).
3. **Operational Event Timeline**: Human-readable milestone events (`GET /api/twins/:id/timeline`).

---

## 4. Digital Twin REST API Reference

- `GET /api/twins`: List all digital twins with source badges (`REAL-TIME LOCAL`, `SIMULATED`, `TARGET / FUTURE`).
- `GET /api/twins/:id`: Get full structured digital twin state representation.
- `GET /api/twins/:id/state`: Get compact twin state with `stateVersion`, freshness SLA, and operating mode.
- `GET /api/twins/:id/history`: Retrieve chronological state transition history.
- `GET /api/twins/:id/timeline`: Retrieve human-readable operational event timeline.
- `GET /api/twins/:id/sensors`: Retrieve sensor status matrix (connected, stale, offline, error).
- `GET /api/twins/:id/relations`: Retrieve connected resource graph links.
- `PUT /api/twins/:id/operating-mode`: Manual or automated operating mode transition.
