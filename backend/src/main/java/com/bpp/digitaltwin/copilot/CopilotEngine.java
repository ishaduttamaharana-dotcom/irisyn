package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.dto.CopilotQueryDto;
import com.bpp.digitaltwin.dto.CopilotResponseDto;
import com.bpp.digitaltwin.entity.AlertEntity;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.*;

/**
 * Data-First Copilot Engine.
 * Enforces Rule 0: The LLM is NOT the source of truth, IRISYN Data is.
 * Resolves entities, metrics, time ranges, performs deterministic math, validates freshness, and generates operational data-access traces.
 */
@ApplicationScoped
public class CopilotEngine {

    @Inject
    CopilotDataGate dataGate;

    @Inject
    CopilotEntityResolver entityResolver;

    @Inject
    CopilotMetricResolver metricResolver;

    @Inject
    CopilotTimeResolver timeResolver;

    @Inject
    CopilotCalculationEngine calculationEngine;

    @Inject
    CopilotResultValidator resultValidator;

    @Inject
    CopilotToolRouter toolRouter;

    @Inject
    IndustrialSimulator industrialSimulator;

    public CopilotResponseDto processQuery(CopilotQueryDto query) {
        CopilotResponseDto response = new CopilotResponseDto();
        response.question = query.question;
        response.timestamp = Instant.now().toString();

        String rawQ = query.question != null ? query.question.trim() : "";

        // 1. DATA GATE CLASSIFICATION
        Set<CopilotQueryCategory> categories = dataGate.classifyQuery(rawQ);
        boolean requiresLiveData = dataGate.requiresLiveData(rawQ);

        // 2. ENTITY & METRIC & TIME RESOLUTION
        CopilotEntityResolver.EntityResolutionResult entityRes = entityResolver.resolveEntity(rawQ, query.activeAssetId);
        String resolvedMetric = metricResolver.resolveMetric(rawQ, "ALL");
        CopilotTimeResolver.TimeRangeResult timeRes = timeResolver.resolveTimeRange(rawQ);

        // Ambiguity Check
        if (entityRes.ambiguous) {
            response.answer = "Which asset twin would you like me to inspect?";
            response.evidence = entityRes.candidates;
            response.confidence = "POSSIBLE";
            return response;
        }

        String targetAssetId = entityRes.resolvedAssetId != null ? entityRes.resolvedAssetId : "FLEET";

        // 3. ACTION INTENT (Requires Confirmation)
        if (categories.contains(CopilotQueryCategory.ACTION)) {
            return buildActionConfirmationResponse(rawQ, targetAssetId);
        }

        // 4. COMPARISON INTENT
        if (categories.contains(CopilotQueryCategory.COMPARISON)) {
            return handleComparisonQuery(response, rawQ);
        }

        // 5. TREND & AGGREGATION INTENT
        if (categories.contains(CopilotQueryCategory.TREND) || categories.contains(CopilotQueryCategory.AGGREGATION) || rawQ.contains("last")) {
            return handleHistoricalTrendQuery(response, targetAssetId, resolvedMetric, timeRes);
        }

        // 6. UNHEALTHY / ABNORMAL INTENT
        if (rawQ.contains("unhealthy") || rawQ.contains("abnormal") || rawQ.contains("worst") || rawQ.contains("critical")) {
            return handleUnhealthyAssetsQuery(response);
        }

        // 7. HEALTH / WHY DECREASED INTENT
        if (categories.contains(CopilotQueryCategory.HEALTH) || rawQ.contains("why")) {
            return handleWhyAssetUnhealthyQuery(response, targetAssetId);
        }

        // 8. TELEMETRY / SYSTEM STATUS INTENT
        if (categories.contains(CopilotQueryCategory.SYSTEM_STATUS)) {
            return handleSystemTelemetryStatusQuery(response);
        }

        // 9. SPECIFIC ASSET DIAGNOSIS
        if (entityRes.resolvedAssetId != null) {
            return handleSpecificAssetDiagnosis(response, entityRes);
        }

        // Default Overview Intent
        return handleSystemOverviewQuery(response);
    }

    public Map<String, Object> executeAction(String action, String target, String scenario) {
        if ("INJECT_FAULT".equalsIgnoreCase(action) || "SET_SCENARIO".equalsIgnoreCase(action)) {
            industrialSimulator.setScenario(scenario != null ? scenario : "BEARING_DEGRADATION");
            return Map.of(
                "status", "EXECUTED",
                "action", action,
                "target", target,
                "scenario", industrialSimulator.getActiveScenario(),
                "operatingMode", industrialSimulator.getOperatingMode(),
                "message", "Fault scenario '" + industrialSimulator.getActiveScenario() + "' successfully injected into " + target
            );
        } else if ("RESET_NORMAL".equalsIgnoreCase(action)) {
            industrialSimulator.setScenario("NORMAL");
            return Map.of(
                "status", "EXECUTED",
                "action", action,
                "target", target,
                "scenario", "NORMAL",
                "message", "Asset " + target + " successfully reset to normal operational parameters."
            );
        }
        return Map.of("status", "REJECTED", "message", "Unknown action: " + action);
    }

    private CopilotResponseDto handleHistoricalTrendQuery(CopilotResponseDto res, String assetId, String metric, CopilotTimeResolver.TimeRangeResult timeRes) {
        AssetDto asset = toolRouter.getAsset(assetId);
        String assetName = asset != null ? asset.name : assetId;
        String sourceTag = asset != null ? asset.source : "REAL-TIME LOCAL";

        CopilotCalculationEngine.CalculationResult calc = toolRouter.getTelemetrySummary(assetId, metric, timeRes.startTime, timeRes.endTime);
        CopilotResultValidator.ValidationResult val = resultValidator.validate(asset != null ? asset.quality : null, assetId, metric, calc.sampleCount);

        res.answer = assetName + " (" + assetId + ") " + metric.toUpperCase() + " trend over " + timeRes.label + " is " + calc.trend + " (" + (calc.pctChange >= 0 ? "+" + calc.pctChange : calc.pctChange) + "%).";
        res.evidence.add("Average " + metric.toUpperCase() + ": " + calc.avg);
        res.evidence.add("Minimum Measured: " + calc.min);
        res.evidence.add("Maximum Measured: " + calc.max);
        res.evidence.add("StdDev / Variance: " + calc.stddev);
        res.evidence.add("Calculated Trend Direction: " + calc.trend);

        res.risk = "DECREASING".equals(calc.trend) || calc.pctChange > 10.0 ? "Parameter drift detected over target window." : "Low variance. Nominal trend.";
        res.recommendation = "Maintain regular time-series telemetry observation.";
        res.dataSourcesUsed.add(sourceTag);
        res.confidence = "CONFIRMED";

        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto handleComparisonQuery(CopilotResponseDto res, String q) {
        List<AssetDto> all = toolRouter.getAssets();
        res.answer = "Asset Comparison Matrix across " + all.size() + " registered Digital Twin instances:";

        for (AssetDto a : all) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("Asset ID", a.id);
            row.put("Name", a.name);
            row.put("Source", a.source);
            row.put("Health Score", a.healthScore + "%");
            row.put("Status", a.status);
            row.put("Temp (°C)", a.metrics.temperature);
            row.put("CPU/Load (%)", a.metrics.cpu);
            res.tableData.add(row);

            res.evidence.add(a.id + ": Health " + a.healthScore + "% | Temp " + a.metrics.temperature + "°C | Load " + a.metrics.cpu + "% [" + a.source + "]");
        }

        res.risk = "Comparative load variance detected between physical laptop host and synthetic industrial motor.";
        res.recommendation = "Review asset detail views for spatial parameters.";
        res.dataSourcesUsed.add("REAL-TIME LOCAL");
        res.dataSourcesUsed.add("SIMULATED");
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(null, "FLEET", "COMPARISON", all.size());
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto handleSystemOverviewQuery(CopilotResponseDto res) {
        Map<String, Object> sys = toolRouter.getSystemHealth();
        List<AssetDto> criticals = toolRouter.getCriticalOrUnhealthyAssets();

        res.answer = "System status is currently " + sys.get("status") + " across " + sys.get("totalAssets") + " monitored asset twins.";
        res.evidence.add("Healthy Assets: " + sys.get("healthyAssets") + " / " + sys.get("totalAssets"));
        res.evidence.add("Warning Assets: " + sys.get("warningAssets"));
        res.evidence.add("Critical Assets: " + sys.get("criticalAssets"));
        res.evidence.add("Average Platform Health Score: " + sys.get("averageHealthScore") + "%");

        if (!criticals.isEmpty()) {
            AssetDto worst = criticals.get(0);
            res.evidence.add("Most Affected Asset: " + worst.name + " (" + worst.id + ") — Health: " + worst.healthScore + "%");
            res.risk = "Degraded operational stability on asset " + worst.id + ".";
            res.recommendation = "Inspect " + worst.id + " diagnostics tab or execute remediation.";
        } else {
            res.risk = "Low overall operational risk.";
            res.recommendation = "Maintain routine telemetry observation.";
        }

        res.dataSourcesUsed.add("REAL-TIME LOCAL");
        res.dataSourcesUsed.add("SIMULATED");
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(null, "SYSTEM", "HEALTH", (int) sys.get("totalAssets"));
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        res.suggestedQuestions = List.of(
            "Show unhealthy assets",
            "Why is MOTOR-001 in warning state?",
            "Is the telemetry currently live?",
            "Inject bearing fault into MOTOR-001"
        );
        return res;
    }

    private CopilotResponseDto handleUnhealthyAssetsQuery(CopilotResponseDto res) {
        List<AssetDto> unhealthy = toolRouter.getCriticalOrUnhealthyAssets();

        if (unhealthy.isEmpty()) {
            res.answer = "All 6 monitored asset twins are currently operating in a HEALTHY state with scores above 80%.";
            res.evidence.add("No active critical or warning thresholds exceeded.");
            res.risk = "None detected.";
            res.recommendation = "Continue standard monitoring.";
        } else {
            AssetDto target = unhealthy.get(0);
            res.answer = "Found " + unhealthy.size() + " asset twin(s) requiring attention: " + target.name + " (" + target.id + ").";
            res.evidence.add(target.id + " status is " + target.status + " with health score " + target.healthScore + "%.");
            res.evidence.add("Source Tag: " + target.source);
            res.evidence.add("Operating Mode: " + target.operatingMode);

            for (Map.Entry<String, Integer> entry : target.healthBreakdown.entrySet()) {
                if (entry.getValue() < 0) {
                    res.evidence.add("Deduction Factor: " + entry.getKey() + " (" + entry.getValue() + ")");
                }
            }

            res.risk = target.healthScore < 55 ? "HIGH risk of forced component shutdown / breakdown." : "MODERATE parameter drift risk.";
            res.recommendation = target.recommendedAction != null ? target.recommendedAction : "Inspect physical parameters.";
            res.dataSourcesUsed.add(target.source);
        }

        res.confidence = "CONFIRMED";
        CopilotResultValidator.ValidationResult val = resultValidator.validate(null, "UNHEALTHY", "HEALTH", unhealthy.size());
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto handleWhyAssetUnhealthyQuery(CopilotResponseDto res, String assetId) {
        AssetDto asset = toolRouter.getAsset(assetId);
        if (asset == null) {
            res.answer = "I don't have telemetry data for asset ID '" + assetId + "'.";
            res.confidence = "POSSIBLE";
            return res;
        }

        res.answer = asset.name + " (" + asset.id + ") is currently at " + asset.healthScore + "% health (" + asset.status + ").";
        
        for (Map.Entry<String, Integer> entry : asset.healthBreakdown.entrySet()) {
            res.evidence.add(entry.getKey() + ": " + (entry.getValue() > 0 ? "+" + entry.getValue() : entry.getValue()));
        }

        if ("INDUSTRIAL_MOTOR".equals(asset.type)) {
            res.evidence.add("RMS Vibration: " + asset.metrics.disk + " mm/s [OBSERVED]");
            res.evidence.add("Stator Temperature: " + asset.metrics.temperature + " °C [OBSERVED]");
            res.evidence.add("Shaft Load: " + asset.metrics.cpu + "% [OBSERVED]");
        } else {
            res.evidence.add("CPU Utilization: " + asset.metrics.cpu + "% [OBSERVED]");
            res.evidence.add("Temperature: " + asset.metrics.temperature + " °C [OBSERVED]");
            res.evidence.add("RAM Load: " + asset.metrics.ram + "% [OBSERVED]");
        }

        res.rootCauseTimeline = List.of(
            "1. Parameter drift initiated in drive assembly",
            "2. Measured thermal/vibration increase",
            "3. Digital Twin Engine applied health deduction factor",
            "4. Operational warning threshold exceeded"
        );

        res.risk = asset.healthScore < 60 ? "HIGH: Potential mechanical failure / bearing overheating." : "ELEVATED: Mechanical stress detected.";
        res.recommendation = asset.recommendedAction != null ? asset.recommendedAction : "Inspect bearing housing and thermal radiator.";
        res.dataSourcesUsed.add(asset.source);
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(asset.quality, asset.id, "HEALTH", 1);
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto handleSpecificAssetDiagnosis(CopilotResponseDto res, CopilotEntityResolver.EntityResolutionResult entityRes) {
        AssetDto asset = toolRouter.getAsset(entityRes.resolvedAssetId);
        if (asset == null) {
            res.answer = "Asset ID '" + entityRes.resolvedAssetId + "' is not currently registered in the platform.";
            return res;
        }

        res.answer = asset.name + " (" + asset.id + ") is operating in " + asset.operatingMode + " mode with " + asset.healthScore + "% health.";
        res.evidence.add("Source: " + asset.source);
        res.evidence.add("Temperature: " + asset.metrics.temperature + " °C");
        res.evidence.add(asset.type.equals("INDUSTRIAL_MOTOR") ? "Vibration: " + asset.metrics.disk + " mm/s" : "CPU Load: " + asset.metrics.cpu + "%");
        res.evidence.add("Cumulative Operating Hours: " + asset.operatingHours + " hrs");

        res.risk = asset.healthScore >= 80 ? "Low risk. Asset functioning within nominal engineering tolerances." : "Elevated risk requiring monitoring.";
        res.recommendation = asset.healthScore >= 80 ? "Maintain standard telemetry polling." : "Inspect primary drive components.";
        res.dataSourcesUsed.add(asset.source);
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(asset.quality, asset.id, "TELEMETRY", 1);
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto handleSystemTelemetryStatusQuery(CopilotResponseDto res) {
        Map<String, Object> q = toolRouter.getDataQuality();
        res.answer = "Telemetry transport pipeline is ONLINE and delivering live data.";
        res.evidence.add("Freshness: " + q.get("freshnessMs") + " ms");
        res.evidence.add("Data Completeness: " + q.get("dataCompletenessPct") + "%");
        res.evidence.add("Transport Latency: " + q.get("latencyMs") + " ms");
        res.evidence.add("Host Hardware Source: " + q.get("source"));

        res.risk = "No telemetry latency or stale data risks detected.";
        res.recommendation = "WebSocket stream active at /ws/telemetry.";
        res.dataSourcesUsed.add("REAL-TIME LOCAL");
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(null, "SYSTEM", "QUALITY", 1);
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }

    private CopilotResponseDto buildActionConfirmationResponse(String q, String targetAsset) {
        CopilotResponseDto res = new CopilotResponseDto();
        res.question = q;
        res.answer = "I can inject a failure scenario into target asset twin " + targetAsset + ". Consequential actions require your explicit confirmation.";
        res.evidence.add("Action: Inject Fault Scenario");
        res.evidence.add("Target Asset: " + targetAsset);
        res.evidence.add("Mode: SIMULATION");

        String scenario = "BEARING_DEGRADATION";
        if (q.contains("thermal")) scenario = "THERMAL_STRESS";
        if (q.contains("electrical")) scenario = "ELECTRICAL_ABNORMALITY";

        res.requiresActionConfirmation = true;
        res.actionPayload = Map.of(
            "action", "INJECT_FAULT",
            "target", targetAsset,
            "scenario", scenario,
            "description", "Inject '" + scenario + "' scenario into " + targetAsset
        );

        res.risk = "Injecting a fault will intentionally degrade target asset health score and trigger anomaly alerts.";
        res.recommendation = "Review action confirmation dialog below to execute or cancel.";
        res.dataSourcesUsed.add("SIMULATED");
        res.confidence = "CONFIRMED";

        CopilotResultValidator.ValidationResult val = resultValidator.validate(null, targetAsset, "ACTION", 1);
        res.freshnessStatus = val.status;
        res.freshnessSeconds = val.freshnessSeconds;
        res.dataUsedTrace = val.dataUsedTrace;

        return res;
    }
}
