# IRISYN — Phase 4: Intelligence Engine Specification & Signoff

## 1. Executive Summary
Phase 4 transforms the physical-to-digital state synchronization model of Phase 3 into an **Explainable Intelligence Layer**. The Intelligence Engine calculates deterministic health scores, derives statistical feature baselines (Z-scores $\sigma$), identifies telemetry anomalies, tracks metric trend directions, computes failure probability risk vectors, and attaches evidence to every output.

```
Digital Twin State
      ↓
Feature & Baseline Engine (Z-Score σ)
      ↓
Health Engine (Deterministic +/- Contributor Penalties)
      ↓
Statistical Anomaly Engine (|Z| > 2.5)
      ↓
Trend Analysis Engine (RISING, FALLING, STABLE)
      ↓
Prediction Engine (Risk Score 0.0-1.0, Confidence, Horizon)
      ↓
Evidence Audit Trail (OBSERVED, INFERRED, PREDICTED)
```

---

## 2. Phase 4 Sub-Phases Deliverables & Status Matrix

| Sub-Phase | Component | Status | Key Features |
|---|---|---|---|
| **Phase 4.1** | Feature & Baseline Engine | **COMPLETE** | `FeatureBaselineEngine.java`: Rolling mean, stddev, Z-score ($\sigma$), rate of change |
| **Phase 4.2** | Deterministic Health Engine | **COMPLETE** | Deterministic health score (0-100%), contributor penalties (`+100 Baseline`, `-15 Critical Load`) |
| **Phase 4.3** | Anomaly Detection Engine | **COMPLETE** | `AnomalyDetectionEngine.java`: $Z \ge 2.5\sigma$ statistical anomaly detection with evidence |
| **Phase 4.4** | Trend Analysis Engine | **COMPLETE** | `TrendAnalysisEngine.java`: Trajectory directions (`RISING`, `FALLING`, `STABLE`, `INSUFFICIENT_DATA`) |
| **Phase 4.5** | Prediction Engine | **COMPLETE** | `PredictionEngine.java`: Failure probability risk scores, confidence metrics, horizon ("72 hours") |
| **Phase 4.6** | Evidence & Explainability | **COMPLETE** | 3-tier categorization (`OBSERVED`, `INFERRED`, `PREDICTED`) & audit trail panel |
| **Phase 4.7** | Intelligence Dashboard | **COMPLETE** | `PredictionsView.tsx`: Fleet health breakdown, anomaly panel, risk ranking, trajectory trends |
| **Phase 4.8** | Digital Twin Integration | **COMPLETE** | Seamless link between Twin State Engine $\rightarrow$ Intelligence Engine APIs |
| **Phase 4.9** | Copilot Integration | **COMPLETE** | Exposes `getHealth()`, `getAnomalies()`, `getPredictions()`, `getTrends()`, `getEvidence()`, `getRiskRanking()`, `getHealthRanking()` |
| **Phase 4.10** | Testing & Synthetic Demo | **COMPLETE** | `IntelligenceEngineTest.java` unit test suite, `npx tsc --noEmit` clean, `npm run build` clean |

---

## 3. 3-Tier Evidence Classification
- `OBSERVED`: Directly measured hardware telemetry (e.g. CPU 24.2%, Temp 44.5°C).
- `INFERRED`: Derived statistical metric (e.g. Z-score 2.8σ, Health Score 78%).
- `PREDICTED`: Projected failure probability vector (e.g. 88% risk within 72h horizon).

---

## 4. REST API Reference (`/api/intelligence` & `/api/assets/:id/...`)

- `GET /api/intelligence/overview`: High-level fleet intelligence summary.
- `GET /api/intelligence/risk-ranking`: Fleet assets sorted by failure risk vector.
- `GET /api/intelligence/health-ranking`: Fleet assets sorted by deterministic health score.
- `GET /api/assets/{id}/health`: Deterministic health score & contributor breakdown.
- `GET /api/assets/{id}/health/history`: Historical health score timeline.
- `GET /api/assets/{id}/anomalies`: Statistical anomalies with Z-score ($\sigma$) evidence.
- `GET /api/assets/{id}/trends`: Derived metric trend directions across rolling windows.
- `GET /api/assets/{id}/predictions`: Failure predictions with risk scores, confidence, and horizons.
- `GET /api/assets/{id}/evidence`: Evidence audit trail linking observations to inferred intelligence.
