package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.*;

/**
 * Server-side RBAC Permission & Access Decision Service.
 * Enforces Rule 65: The frontend is NOT the security boundary; all authorization is enforced server-side.
 */
@ApplicationScoped
public class SecurityRbacService {

    public static class AccessDecisionResult {
        public String decision; // ALLOWED, DENIED
        public String user;
        public String role; // ADMIN, ENGINEER, OPERATOR, VIEWER
        public String permission;
        public String resource;
        public String reason;
        public String timestamp;

        public AccessDecisionResult(String decision, String user, String role, String permission, String resource, String reason) {
            this.decision = decision;
            this.user = user;
            this.role = role;
            this.permission = permission;
            this.resource = resource;
            this.reason = reason;
            this.timestamp = java.time.Instant.now().toString();
        }
    }

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = new HashMap<>();

    static {
        // ADMIN: Full System Control
        ROLE_PERMISSIONS.put("ADMIN", Set.of(
            "Dashboard.Read", "Telemetry.Read", "DigitalTwin.Read", "Alerts.Read", "Alerts.Acknowledge",
            "Simulation.Read", "Simulation.Write", "Thresholds.Write", "HealthModel.Write",
            "Users.Manage", "Security.Write", "Audit.Read", "Copilot.Read", "Copilot.Write"
        ));

        // ENGINEER: Technical analysis, digital twin tuning, simulation fault injection
        ROLE_PERMISSIONS.put("ENGINEER", Set.of(
            "Dashboard.Read", "Telemetry.Read", "DigitalTwin.Read", "Alerts.Read", "Alerts.Acknowledge",
            "Simulation.Read", "Simulation.Write", "Thresholds.Write", "HealthModel.Write",
            "Audit.Read", "Copilot.Read", "Copilot.Write"
        ));

        // OPERATOR: Operational monitoring & alert acknowledgment
        ROLE_PERMISSIONS.put("OPERATOR", Set.of(
            "Dashboard.Read", "Telemetry.Read", "DigitalTwin.Read", "Alerts.Read", "Alerts.Acknowledge",
            "Simulation.Read", "Audit.Read", "Copilot.Read"
        ));

        // VIEWER: Read-Only Access across all views
        ROLE_PERMISSIONS.put("VIEWER", Set.of(
            "Dashboard.Read", "Telemetry.Read", "DigitalTwin.Read", "Alerts.Read", "Simulation.Read", "Copilot.Read"
        ));
    }

    public AccessDecisionResult evaluateAccess(String user, String role, String permission, String resource) {
        String effectiveRole = role != null && !role.isBlank() ? role.toUpperCase() : "OPERATOR";
        String effectiveUser = user != null && !user.isBlank() ? user : "operator@irisyn.io";

        Set<String> allowedPerms = ROLE_PERMISSIONS.getOrDefault(effectiveRole, Set.of("Dashboard.Read"));

        if (allowedPerms.contains(permission)) {
            return new AccessDecisionResult(
                "ALLOWED", effectiveUser, effectiveRole, permission, resource,
                "Role '" + effectiveRole + "' permits '" + permission + "' on resource " + resource
            );
        } else {
            return new AccessDecisionResult(
                "DENIED", effectiveUser, effectiveRole, permission, resource,
                "Role '" + effectiveRole + "' lacks permission '" + permission + "'"
            );
        }
    }

    public List<Map<String, Object>> getRolePermissionMatrix() {
        List<Map<String, Object>> matrix = new ArrayList<>();
        List<String> perms = List.of(
            "Dashboard.Read", "Telemetry.Read", "DigitalTwin.Read", "Alerts.Acknowledge",
            "Simulation.Write", "Thresholds.Write", "HealthModel.Write", "Users.Manage"
        );

        for (String p : perms) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("permission", p);
            row.put("ADMIN", ROLE_PERMISSIONS.get("ADMIN").contains(p));
            row.put("ENGINEER", ROLE_PERMISSIONS.get("ENGINEER").contains(p));
            row.put("OPERATOR", ROLE_PERMISSIONS.get("OPERATOR").contains(p));
            row.put("VIEWER", ROLE_PERMISSIONS.get("VIEWER").contains(p));
            matrix.add(row);
        }
        return matrix;
    }
}
