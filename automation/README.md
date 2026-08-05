# automation/

Reserved for autonomous remediation workflows (auto-restart, migration, scaling,
isolation) that the Digital Twin can trigger in response to predictions and alerts.

**Status: not implemented in Phase 2.** The backend currently exposes
`POST /api/recover` as a placeholder that simulates accepting a recovery action
(see `backend/.../automation/RecoveryService.java`). No real orchestration
against OpenShift/Kubernetes happens yet.

## Planned scope (future phase)
- Playbooks/workflows for each `RecoveryAction` (RESTART, MIGRATE, SCALE, ISOLATE)
- Integration with the OpenShift API (via fabric8 client or `oc`) to execute actions
- Audit trail persisted to the `automation_logs` table
- Policy engine for when automation is allowed to act autonomously vs. requiring
  human approval
