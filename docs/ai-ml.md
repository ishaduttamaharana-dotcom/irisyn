# IRISYN AI & Machine Learning Strategy

## Digital Twin Platform

---

## 1. AI System Overview

The IRISYN AI strategy combines:
1. **Deterministic Digital Twin Health Engine**: Transparent, explainable composite health scoring.
2. **Statistical Anomaly Engine**: Rolling Z-Score and rate-of-change anomaly classification.
3. **IRISYN Copilot**: Context-aware conversational AI assistant backed by executable platform tools (`CopilotToolRouter`).
4. **Target OpenShift AI MLOps Pipeline**: Future cloud machine learning inference models.

---

## 2. Real vs Simulated Data Integrity Standard

- **Real Host Telemetry (`REAL-TIME LOCAL`)**: Measured live from the physical computer executing the backend.
- **Industrial Telemetry (`SIMULATED`)**: Synthetic correlated physics stream (`MOTOR-001`).
- **Data Attribution Guarantee**: The Copilot explicit cites `REAL-TIME LOCAL` or `SIMULATED` on all responses.

---

## 3. Machine Learning Architecture (Current vs Target)

### Implemented (Live)
- Statistical Z-Score Anomaly Engine: $Z = \frac{x - \mu}{\sigma}$.
- Contributor Deduction Engine: Explains health score drops with exact metric deltas.
- Context-Aware Tool Router: Queries live Java OS and simulator state.

### Target Industrial Architecture (Red Hat OpenShift AI)
- ModelMesh / Kubeflow serving containerized scikit-learn & TensorFlow models.
- Kafka Event Streams feeding OpenShift AI real-time feature stores.
- Automated MLOps retraining pipelines on bearing & thermal failure datasets.
