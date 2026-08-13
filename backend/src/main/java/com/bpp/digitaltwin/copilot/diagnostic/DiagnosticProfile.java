package com.bpp.digitaltwin.copilot.diagnostic;

import java.util.List;
import java.util.Map;

/**
 * Diagnostic Profile definition tailored per asset type (ServerProfile vs MotorProfile).
 */
public class DiagnosticProfile {

    public final String assetType;
    public final List<String> primaryMetrics;
    public final List<String> failureModes;
    public final List<String> safeActions;

    public DiagnosticProfile(String assetType, List<String> primaryMetrics, List<String> failureModes, List<String> safeActions) {
        this.assetType = assetType;
        this.primaryMetrics = primaryMetrics;
        this.failureModes = failureModes;
        this.safeActions = safeActions;
    }

    public static DiagnosticProfile getProfileForAsset(String assetId, String assetType) {
        if ("dc-node-03".equalsIgnoreCase(assetId) || "SERVER".equalsIgnoreCase(assetType) || "LAPTOP-001".equalsIgnoreCase(assetId)) {
            return new DiagnosticProfile(
                "SERVER",
                List.of("cpu_utilization", "memory_utilization", "disk_latency", "network_iops"),
                List.of("Resource Saturation", "Disk I/O Bottleneck", "Process Memory Leak", "Network Contention"),
                List.of("RESTART_PROCESS", "CLEAR_CACHE", "SCALE_WORKLOAD", "CREATE_MAINTENANCE_TICKET")
            );
        } else {
            return new DiagnosticProfile(
                "MOTOR",
                List.of("temperature", "vibration", "rpm", "current_draw", "torque"),
                List.of("Bearing Degradation", "Stator Winding Overheat", "Rotor Unbalance", "Current Overload"),
                List.of("INJECT_BEARING_DEGRADATION", "REDUCE_MOTOR_LOAD", "SCHEDULE_BEARING_INSPECTION", "CREATE_WORK_ORDER")
            );
        }
    }
}
