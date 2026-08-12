package com.bpp.digitaltwin.telemetry;

import com.bpp.digitaltwin.config.SystemConfigService;
import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Core Digital Twin Engine that bridges Physical State to Digital State, evaluates transparent health scores,
 * drives the 9-tier Operating Mode state machine, tracks stateVersions, and maintains connected resource graphs.
 */
@ApplicationScoped
public class DigitalTwinEngine {

    @Inject
    LocalTelemetryCollector localCollector;

    @Inject
    IndustrialSimulator industrialSimulator;

    @Inject
    SystemConfigService configService;

    private final Map<String, AssetDto> assetRegistry = new ConcurrentHashMap<>();
    private final Map<String, String> previousModeMap = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> historyMap = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> stateVersionMap = new ConcurrentHashMap<>();

    public List<AssetDto> getAllAssets(String filterSource) {
        updateAllAssets();
        List<AssetDto> list = new ArrayList<>(assetRegistry.values());
        if (filterSource != null && !filterSource.isBlank() && !"ALL".equalsIgnoreCase(filterSource)) {
            list.removeIf(a -> !a.source.equalsIgnoreCase(filterSource));
        }
        return list;
    }

    public AssetDto getAssetById(String id) {
        updateAllAssets();
        return assetRegistry.get(id);
    }

    public List<Map<String, Object>> getAssetHistory(String id) {
        return historyMap.getOrDefault(id, List.of(
            Map.of(
                "timestamp", Instant.now().minusSeconds(1800).toString(),
                "assetId", id,
                "previousMode", "IDLE",
                "newMode", "RUNNING",
                "triggerReason", "Twin engine initialization",
                "healthScore", 98
            )
        ));
    }

    public List<Map<String, Object>> getAssetTimeline(String id) {
        AssetDto asset = assetRegistry.get(id);
        if (asset == null) return List.of();

        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(Map.of(
            "id", "TL-01",
            "timestamp", asset.lastUpdated,
            "type", "STATE_SYNC",
            "title", "Digital Twin State Synchronized",
            "description", "Twin state version #" + asset.stateVersion + " synchronized with physical hardware telemetry",
            "severity", "INFO"
        ));
        timeline.add(Map.of(
            "id", "TL-02",
            "timestamp", Instant.now().minusSeconds(1200).toString(),
            "type", "HEALTH_EVALUATION",
            "title", "Health Model Evaluated",
            "description", "Composite health score: " + asset.healthScore + "% (" + asset.status + ")",
            "severity", asset.status.equals("HEALTHY") ? "INFO" : "WARNING"
        ));
        timeline.add(Map.of(
            "id", "TL-03",
            "timestamp", Instant.now().minusSeconds(3600).toString(),
            "type", "MAINTENANCE",
            "title", "Work Order Planned",
            "description", "Scheduled work order WO-9041 linked to asset twin",
            "severity", "INFO"
        ));
        return timeline;
    }

    public Map<String, Object> getAssetRelations(String id) {
        AssetDto asset = assetRegistry.get(id);
        if (asset == null) return Map.of();

        return Map.of(
            "assetId", asset.id,
            "name", asset.name,
            "parentLocation", asset.location,
            "dependentAssets", "LAPTOP-001".equalsIgnoreCase(id) ? List.of("MOTOR-001") : List.of(),
            "sensors", List.of("SENS-CPU-01", "SENS-RAM-01", "SENS-VIB-01", "SENS-NET-01"),
            "telemetryStreams", List.of("/ws/telemetry", "/ws/twins"),
            "alerts", asset.status.equalsIgnoreCase("HEALTHY") ? List.of() : List.of("ALT-501"),
            "anomalies", asset.healthScore < 80 ? List.of("ANOM-01") : List.of(),
            "predictions", List.of("PRED-101"),
            "maintenance", List.of("WO-9041")
        );
    }

    public synchronized void updateAllAssets() {
        // 1. Process REAL Host Laptop Asset (LAPTOP-001)
        TelemetryEventDto localEvent = localCollector.captureTelemetry();
        AssetDto laptop = processTelemetryToAsset(localEvent, "Dell / Lenovo Host Workstation", "Precision / ThinkPad", "SN-LAP-2026-9041");
        assetRegistry.put(laptop.id, laptop);

        // 2. Process SIMULATED Industrial Motor Asset (MOTOR-001)
        TelemetryEventDto motorEvent = industrialSimulator.generateMotorTelemetry();
        AssetDto motor = processTelemetryToAsset(motorEvent, "Siemens Industrial", "150kW 3-Phase Motor", "SN-SIE-150-8842");
        assetRegistry.put(motor.id, motor);

        // 3. Process Target Architecture Placeholder (CNC-001)
        AssetDto cnc = new AssetDto();
        cnc.id = "CNC-001";
        cnc.name = "5-Axis CNC Milling Station";
        cnc.type = "CNC_MACHINE";
        cnc.source = "TARGET / FUTURE";
        cnc.manufacturer = "Mazak / Fanuc";
        cnc.model = "VCN-530C";
        cnc.serialNumber = "SN-MAZ-530-0012";
        cnc.location = "Factory Floor - Line 2";
        cnc.installationDate = "2024-03-15";
        cnc.configVersion = "v2.1-edge";
        cnc.status = "OFFLINE";
        cnc.operatingMode = "OFFLINE";
        cnc.healthScore = 0;
        cnc.healthBreakdown.put("Gateway Disconnected", 0);
        cnc.operatingHours = 0.0;
        cnc.stateVersion = 1L;
        cnc.lastUpdated = Instant.now().toString();
        cnc.recommendedAction = "Target architecture for future PLC / OPC-UA integration";
        cnc.lastMaintenanceDate = "2026-01-10";
        cnc.nextMaintenanceDate = "2026-09-01";
        cnc.maintenanceStatus = "OK";
        assetRegistry.put(cnc.id, cnc);
    }

    private AssetDto processTelemetryToAsset(TelemetryEventDto event, String manufacturer, String model, String serialNumber) {
        AssetDto asset = new AssetDto();
        asset.id = event.assetId;
        asset.name = event.assetName;
        asset.type = event.assetType;
        asset.source = event.source;
        asset.manufacturer = manufacturer;
        asset.model = model;
        asset.serialNumber = serialNumber;
        asset.location = "REAL-TIME LOCAL".equals(event.source) ? "Local Dev Host" : "Simulation Environment";
        asset.installationDate = "2025-06-01";
        asset.configVersion = "v1.0-twin";
        asset.metrics = event.metrics;
        asset.quality = event.quality;
        asset.lastUpdated = event.timestamp;
        asset.operatingHours = Math.round((event.metrics.uptimeSeconds / 3600.0) * 10.0) / 10.0;
        asset.lastMaintenanceDate = "2026-05-15";
        asset.nextMaintenanceDate = "2026-11-15";
        asset.maintenanceStatus = "OK";

        AtomicLong versionCounter = stateVersionMap.computeIfAbsent(asset.id, k -> new AtomicLong(12L));
        asset.stateVersion = versionCounter.get();

        // Retrieve Dynamic Health Model Weights
        Map<String, Object> weights = configService.getHealthWeights();
        int cpuWeight = ((Number) weights.getOrDefault("cpu", 20)).intValue();
        int thermalWeight = ((Number) weights.getOrDefault("thermal", 20)).intValue();
        int ramWeight = ((Number) weights.getOrDefault("ram", 15)).intValue();
        int diskWeight = ((Number) weights.getOrDefault("disk", 15)).intValue();

        // Calculate Transparent Health Score (0 - 100%)
        int health = 100;
        Map<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put("Baseline Health", 100);

        // CPU / Load Factor
        if (event.metrics.cpu > 90.0) {
            int penalty = (int) (cpuWeight * 1.25);
            health -= penalty;
            breakdown.put("Critical Load Penalty", -penalty);
        } else if (event.metrics.cpu > 75.0) {
            int penalty = (int) (cpuWeight * 0.6);
            health -= penalty;
            breakdown.put("High Load Penalty", -penalty);
        }

        // Thermal Factor
        if (event.metrics.temperature > 80.0) {
            int penalty = (int) (thermalWeight * 1.5);
            health -= penalty;
            breakdown.put("Extreme Thermal Stress", -penalty);
        } else if (event.metrics.temperature > 65.0) {
            int penalty = (int) (thermalWeight * 0.75);
            health -= penalty;
            breakdown.put("Elevated Temperature", -penalty);
        }

        // Memory Factor
        if (event.metrics.ram > 90.0) {
            int penalty = (int) (ramWeight * 1.3);
            health -= penalty;
            breakdown.put("Memory Pressure", -penalty);
        }

        // Disk / Vibration Factor
        if ("INDUSTRIAL_MOTOR".equals(event.assetType)) {
            if (event.metrics.disk > 8.0) {
                int penalty = (int) (diskWeight * 2.3);
                health -= penalty;
                breakdown.put("Severe Bearing Vibration", -penalty);
            } else if (event.metrics.disk > 3.5) {
                int penalty = (int) (diskWeight * 1.2);
                health -= penalty;
                breakdown.put("Vibration Anomaly", -penalty);
            }
        }

        asset.healthScore = Math.max(0, Math.min(100, health));
        asset.healthBreakdown = breakdown;

        // Determine Status & Operating Mode State Machine
        String newMode = "RUNNING";
        if (asset.healthScore < 50 || event.metrics.temperature > 85.0) {
            asset.status = "CRITICAL";
            newMode = "FAULT";
            asset.currentPrediction = "High risk of thermal runaway / bearing fault";
            asset.recommendedAction = "Initiate emergency maintenance order WO-9041";
        } else if (asset.healthScore < 75 || event.metrics.cpu > 80.0) {
            asset.status = "WARNING";
            newMode = event.metrics.cpu > 85.0 ? "HIGH_LOAD" : "DEGRADED";
            asset.currentPrediction = "Moderate parameter drift vector detected";
            asset.recommendedAction = "Inspect cooling airflow and bearing vibration";
        } else {
            asset.status = "HEALTHY";
            newMode = "RUNNING";
        }
        asset.operatingMode = newMode;

        // Record Meaningful State Transitions & Increment State Version
        String prevMode = previousModeMap.get(asset.id);
        if (prevMode != null && !prevMode.equalsIgnoreCase(newMode)) {
            long newVer = versionCounter.incrementAndGet();
            asset.stateVersion = newVer;

            List<Map<String, Object>> historyList = historyMap.computeIfAbsent(asset.id, k -> new ArrayList<>());
            historyList.add(0, Map.of(
                "timestamp", Instant.now().toString(),
                "assetId", asset.id,
                "stateVersion", newVer,
                "previousMode", prevMode,
                "newMode", newMode,
                "triggerReason", "Telemetry threshold evaluation (Health: " + asset.healthScore + "%)",
                "healthScore", asset.healthScore
            ));
        }
        previousModeMap.put(asset.id, newMode);

        return asset;
    }
}
