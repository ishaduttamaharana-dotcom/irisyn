package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.entity.AlertEntity;
import com.bpp.digitaltwin.entity.ServerEntity;

import com.bpp.digitaltwin.repository.AlertRepository;
import com.bpp.digitaltwin.repository.ServerRepository;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import com.bpp.digitaltwin.telemetry.LocalTelemetryCollector;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Tool Router exposing platform state methods to the Copilot Engine.
 * Ensures the Copilot reads real live data instead of inventing values.
 */
@ApplicationScoped
public class CopilotToolRouter {

    @Inject
    DigitalTwinEngine digitalTwinEngine;

    @Inject
    LocalTelemetryCollector localCollector;

    @Inject
    IndustrialSimulator industrialSimulator;

    @Inject
    ServerRepository serverRepository;

    @Inject
    AlertRepository alertRepository;

    public List<AssetDto> getAssets() {
        return digitalTwinEngine.getAllAssets("ALL");
    }

    public AssetDto getAsset(String assetId) {
        if (assetId == null || assetId.isBlank()) return null;
        AssetDto asset = digitalTwinEngine.getAssetById(assetId);
        if (asset == null) {
            // Search in servers if dc-node format
            List<ServerEntity> servers = serverRepository.listAll();
            for (ServerEntity s : servers) {
                if (s.hostname.equalsIgnoreCase(assetId) || s.id.toString().equalsIgnoreCase(assetId)) {
                    AssetDto serverAsset = new AssetDto();
                    serverAsset.id = s.hostname;
                    serverAsset.name = "Data Center Server " + s.hostname;
                    serverAsset.type = "SERVER";
                    serverAsset.source = "SIMULATED";
                    serverAsset.manufacturer = "Dell PowerEdge / HP ProLiant";
                    serverAsset.status = s.status != null ? s.status.name() : "HEALTHY";
                    serverAsset.healthScore = (int) Math.round(100.0 - s.cpuUsage * 0.4 - s.temperatureC * 0.4);
                    serverAsset.metrics.cpu = s.cpuUsage;
                    serverAsset.metrics.ram = s.ramUsage;
                    serverAsset.metrics.disk = s.diskUsage;
                    serverAsset.metrics.temperature = s.temperatureC;
                    return serverAsset;
                }
            }
        }
        return asset;
    }

    public List<AssetDto> getCriticalOrUnhealthyAssets() {
        return getAssets().stream()
            .filter(a -> !"HEALTHY".equalsIgnoreCase(a.status) || a.healthScore < 80)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getSystemHealth() {
        List<AssetDto> all = getAssets();
        long healthy = all.stream().filter(a -> "HEALTHY".equalsIgnoreCase(a.status)).count();
        long warning = all.stream().filter(a -> "WARNING".equalsIgnoreCase(a.status)).count();
        long critical = all.stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.status)).count();
        long offline = all.stream().filter(a -> "OFFLINE".equalsIgnoreCase(a.status)).count();

        double avgHealth = all.isEmpty() ? 100.0 : all.stream().mapToInt(a -> a.healthScore).average().orElse(100.0);

        return Map.of(
            "totalAssets", all.size(),
            "healthyAssets", healthy,
            "warningAssets", warning,
            "criticalAssets", critical,
            "offlineAssets", offline,
            "averageHealthScore", Math.round(avgHealth * 10.0) / 10.0,
            "status", critical > 0 ? "DEGRADED" : warning > 0 ? "WARNING" : "HEALTHY"
        );
    }

    public Map<String, Object> getSimulationState() {
        return Map.of(
            "paused", industrialSimulator.isPaused(),
            "speedMultiplier", industrialSimulator.getSpeedMultiplier(),
            "activeScenario", industrialSimulator.getActiveScenario(),
            "operatingMode", industrialSimulator.getOperatingMode()
        );
    }

    public List<AlertEntity> getActiveAlerts() {
        return alertRepository.find("acknowledged = false").list();
    }

    public Map<String, Object> getDataQuality() {
        TelemetryEventDto localEvent = localCollector.captureTelemetry();
        return Map.of(
            "collectorStatus", "ONLINE",
            "freshnessMs", localEvent.quality.freshnessMs,
            "dataCompletenessPct", localEvent.quality.completenessPct,
            "latencyMs", localEvent.quality.latencyMs,
            "source", localEvent.source
        );
    }

    public Map<String, Object> compareAssets(String idA, String idB) {
        AssetDto assetA = getAsset(idA);
        AssetDto assetB = getAsset(idB);
        return Map.of(
            "assetA", assetA != null ? assetA : Map.of("id", idA, "status", "NOT_FOUND"),
            "assetB", assetB != null ? assetB : Map.of("id", idB, "status", "NOT_FOUND")
        );
    }
}
