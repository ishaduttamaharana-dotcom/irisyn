# IRISYN 17-Step Operational Demonstration Guide

This guide details the 17-step operational demonstration story for judges, stakeholders, and investors.

---

## 17-Step Demonstration Narrative

1. **Host Telemetry Identification**: "I am monitoring my actual laptop in real time (`REAL-TIME LOCAL`)."
2. **Continuous Ingestion**: "Telemetry is continuously collected via Java OS Management APIs and persisted."
3. **Digital Twin Instance**: "This host laptop has an active Digital Twin representation (`LAPTOP-001`)."
4. **State & Health Breakdown**: "The Digital Twin maintains current hardware state and explainable health contributor breakdowns."
5. **Synthetic Industrial Twin Creation**: "I can also initialize a simulated industrial asset (`MOTOR-001`)."
6. **Correlated Physics**: "The industrial simulator produces correlated machine behavior (RPM, Torque, Current, Voltage, Temp, Vibration)."
7. **Fault Injection**: "Using the Demo Simulation Control, I inject a `BEARING_DEGRADATION` fault."
8. **Digital Twin Parameter Drift**: "The Digital Twin Engine detects parameter drift (Vibration increases from 1.2 mm/s to 6.8 mm/s, Temp increases to 64°C)."
9. **Transparent Health Score Decrease**: "The health score decreases from 100% to 58% with an explicit factor penalty (`Severe Bearing Vibration: -35`)."
10. **Anomaly Detection**: "The Statistical Anomaly Engine flags `ANOMALY DETECTED` based on rolling Z-score deviation."
11. **AI Predictive Insight Generation**: "The AI layer generates a predictive insight: 'Potential bearing degradation (87% confidence)'."
12. **Predictive Maintenance Action**: "The system recommends inspecting the bearing during the next maintenance window."
13. **Operator Acknowledgment**: "The operator acknowledges the incident in the control console."
14. **Corrective Remediation**: "The operator executes simulated maintenance / cooling boost."
15. **Return to Healthy State**: "The simulator resets and the Digital Twin returns to `HEALTHY` (98%)."
16. **Architecture Extensibility**: "The exact same Digital Twin Engine architecture accepts PLC / OPC-UA data streams without redesign."
17. **Red Hat Target Vision**: "Red Hat Device Edge, OpenShift, and OpenShift AI represent the target industrial scaling blueprint."
