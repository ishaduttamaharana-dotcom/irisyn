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

/**
 * Core Digital Twin Engine that bridges Physical State to Digital State and evaluates transparent health scores.
 * Configured dynamically via SystemConfigService Control Plane.
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

    public synchronized void updateAllAssets() {
        // 1. Process REAL Host Laptop Asset (LAPTOP-001)
        TelemetryEventDto localEvent = localCollector.captureTelemetry();
        AssetDto laptop = processTelemetryToAsset(localEvent, "Dell / Lenovo Host Workstation", "Precision / ThinkPad");
        assetRegistry.put(laptop.id, laptop);

        // 2. Process SIMULATED Industrial Motor Asset (MOTOR-001)
        TelemetryEventDto motorEvent = industrialSimulator.generateMotorTelemetry();
        AssetDto motor = processTelemetryToAsset(motorEvent, "Siemens Industrial", "150kW 3-Phase Motor");
        assetRegistry.put(motor.id, motor);

        // 3. Process Target Architecture Placeholder (CNC-001)
        AssetDto cnc = new AssetDto();
        cnc.id = "CNC-001";
        cnc.name = "5-Axis CNC Milling Station";
        cnc.type = "CNC_MACHINE";
        cnc.source = "TARGET / FUTURE";
        cnc.manufacturer = "Mazak / Fanuc";
        cnc.model = "VCN-530C";
        cnc.location = "Factory Floor - Line 2";
        cnc.status = "OFFLINE";
        cnc.operatingMode = "DISCONNECTED";
        cnc.healthScore = 0;
        cnc.healthBreakdown.put("Gateway Disconnected", 0);
        cnc.operatingHours = 0.0;
        cnc.lastUpdated = Instant.now().toString();
        cnc.recommendedAction = "Target architecture for future PLC / OPC-UA integration";
        assetRegistry.put(cnc.id, cnc);
    }

    private AssetDto processTelemetryToAsset(TelemetryEventDto event, String manufacturer, String model) {
        AssetDto asset = new AssetDto();
        asset.id = event.assetId;
        asset.name = event.assetName;
        asset.type = event.assetType;
        asset.source = event.source;
        asset.manufacturer = manufacturer;
        asset.model = model;
        asset.location = "REAL-TIME LOCAL".equals(event.source) ? "Local Dev Host" : "Simulation Environment";
        asset.metrics = event.metrics;
        asset.quality = event.quality;
        asset.lastUpdated = event.timestamp;
        asset.operatingHours = Math.round((event.metrics.uptimeSeconds / 3600.0) * 10.0) / 10.0;

        // Retrieve Dynamic Health Model Weights from Control Plane Configuration
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

        // Memory / Efficiency Factor
        if (event.metrics.ram > 90.0) {
            int penalty = (int) (ramWeight * 1.3);
            health -= penalty;
            breakdown.put("Memory Pressure", -penalty);
        } else if (event.metrics.ram > 80.0) {
            int penalty = (int) (ramWeight * 0.5);
            health -= penalty;
            breakdown.put("RAM Contention", -penalty);
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
        } else {
            if (event.metrics.disk > 95.0) {
                int penalty = (int) (diskWeight * 1.3);
                health -= penalty;
                breakdown.put("Disk Space Exhaustion", -penalty);
            }
        }

        asset.healthScore = Math.max(0, Math.min(100, health));
        asset.healthBreakdown = breakdown;

        // Determine Status & Operating Mode
        if (asset.healthScore >= 80) {
            asset.status = "HEALTHY";
            asset.operatingMode = "NORMAL";
        } else if (asset.healthScore >= 55) {
            asset.status = "WARNING";
            asset.operatingMode = "DEGRADATION";
            asset.currentPrediction = "Potential parameter drift detected";
            asset.recommendedAction = "Inspect thermal and vibration levels";
        } else {
            asset.status = "CRITICAL";
            asset.operatingMode = "FAULT";
            asset.currentPrediction = "High risk of component failure / shutdown";
            asset.recommendedAction = "Schedule immediate maintenance intervention";
        }

        return asset;
    }
}
