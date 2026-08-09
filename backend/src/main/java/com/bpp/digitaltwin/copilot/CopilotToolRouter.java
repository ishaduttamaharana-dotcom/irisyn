package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.entity.AlertEntity;
import com.bpp.digitaltwin.entity.MetricEntity;
import com.bpp.digitaltwin.entity.ServerEntity;
import com.bpp.digitaltwin.repository.AlertRepository;
import com.bpp.digitaltwin.repository.MetricRepository;
import com.bpp.digitaltwin.repository.ServerRepository;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import com.bpp.digitaltwin.telemetry.LocalTelemetryCollector;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Expanded Tool Router for IRISYN Copilot Data-First Architecture.
 * Wraps all physical host metrics, synthetic industrial physics, state engines, and database stores.
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
    MetricRepository metricRepository;

    @Inject
    AlertRepository alertRepository;

    @Inject
    CopilotCalculationEngine calculationEngine;

    // 1. Asset Tools
    public List<AssetDto> getAssets() {
        return digitalTwinEngine.getAllAssets("ALL");
    }

    public AssetDto getAsset(String assetId) {
        if (assetId == null || assetId.isBlank()) return null;
        AssetDto asset = digitalTwinEngine.getAssetById(assetId);
        if (asset == null) {
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

    public List<AssetDto> searchAssets(String filterQuery) {
        if (filterQuery == null || filterQuery.isBlank()) return getAssets();
        String q = filterQuery.toLowerCase();
        return getAssets().stream()
            .filter(a -> a.id.toLowerCase().contains(q) || a.name.toLowerCase().contains(q) || a.type.toLowerCase().contains(q))
            .collect(Collectors.toList());
    }

    public List<AssetDto> getCriticalOrUnhealthyAssets() {
        return getAssets().stream()
            .filter(a -> !"HEALTHY".equalsIgnoreCase(a.status) || a.healthScore < 80)
            .collect(Collectors.toList());
    }

    // 2. Telemetry Tools
    public TelemetryEventDto getCurrentTelemetry(String assetId) {
        if ("LAPTOP-001".equalsIgnoreCase(assetId) || assetId == null || assetId.isBlank()) {
            return localCollector.captureTelemetry();
        }
        if ("MOTOR-001".equalsIgnoreCase(assetId)) {
            return industrialSimulator.generateMotorTelemetry();
        }
        AssetDto asset = getAsset(assetId);
        if (asset != null) {
            TelemetryEventDto event = new TelemetryEventDto();
            event.assetId = asset.id;
            event.assetName = asset.name;
            event.assetType = asset.type;
            event.source = asset.source;
            event.timestamp = asset.lastUpdated;
            event.metrics = asset.metrics;
            event.quality = asset.quality;
            return event;
        }
        return localCollector.captureTelemetry();
    }

    public List<Double> getHistoricalTelemetryValues(String assetId, String metric, Instant startTime, Instant endTime) {
        List<Double> points = new ArrayList<>();
        int sampleCount = 30;
        Random rand = new Random(assetId.hashCode());

        double baseValue = 45.0;
        if ("temperature".equalsIgnoreCase(metric)) baseValue = 54.0;
        if ("vibration".equalsIgnoreCase(metric)) baseValue = 1.4;
        if ("cpu".equalsIgnoreCase(metric)) baseValue = 38.0;

        if ("MOTOR-001".equalsIgnoreCase(assetId) && "BEARING_DEGRADATION".equals(industrialSimulator.getActiveScenario())) {
            if ("vibration".equalsIgnoreCase(metric)) baseValue = 4.8;
            if ("temperature".equalsIgnoreCase(metric)) baseValue = 72.0;
        }

        for (int i = 0; i < sampleCount; i++) {
            double drift = (i / (double) sampleCount) * (baseValue * 0.15);
            double noise = (rand.nextDouble() - 0.45) * 2.0;
            points.add(Math.round((baseValue + drift + noise) * 100.0) / 100.0);
        }
        return points;
    }

    public CopilotCalculationEngine.CalculationResult getTelemetrySummary(String assetId, String metric, Instant startTime, Instant endTime) {
        List<Double> historical = getHistoricalTelemetryValues(assetId, metric, startTime, endTime);
        return calculationEngine.calculateSummary(historical);
    }

    // 3. System Status & Health Tools
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

    public Map<String, Object> getSimulationStatus() {
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
}
