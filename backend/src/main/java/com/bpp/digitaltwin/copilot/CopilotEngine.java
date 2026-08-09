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

@ApplicationScoped
public class CopilotEngine {

    @Inject
    CopilotToolRouter toolRouter;

    @Inject
    IndustrialSimulator industrialSimulator;

    public CopilotResponseDto processQuery(CopilotQueryDto query) {
        CopilotResponseDto response = new CopilotResponseDto();
        response.question = query.question;
        response.timestamp = Instant.now().toString();

        String q = query.question != null ? query.question.trim().toLowerCase() : "";
        String activeAsset = query.activeAssetId;

        // Context awareness fallback
        if ((activeAsset == null || activeAsset.isBlank()) && (q.contains("motor-001") || q.contains("motor"))) {
            activeAsset = "MOTOR-001";
        } else if ((activeAsset == null || activeAsset.isBlank()) && (q.contains("laptop") || q.contains("host"))) {
            activeAsset = "LAPTOP-001";
        }

        // 1. ACTION INTENTS (Require Confirmation Dialog)
        if (q.contains("inject") || q.contains("fault") || q.contains("bearing fault") || q.contains("thermal stress") || q.contains("electrical fault")) {
            return buildActionConfirmationResponse(q, activeAsset != null ? activeAsset : "MOTOR-001");
        }

        // 2. QUERY INTENTS
        if (q.contains("unhealthy") || q.contains("abnormal") || q.contains("critical asset") || q.contains("worst")) {
            return handleUnhealthyAssetsQuery(response);
        }

        if (q.contains("why") && activeAsset != null && !activeAsset.isBlank()) {
            return handleWhyAssetUnhealthyQuery(response, activeAsset);
        }

        if (q.contains("compare")) {
            return handleAssetComparisonQuery(response, q);
        }

        if (q.contains("telemetry") || q.contains("fresh") || q.contains("stale") || q.contains("live")) {
            return handleTelemetryStatusQuery(response);
        }

        if (activeAsset != null && !activeAsset.isBlank() && (q.contains("inspect") || q.contains("status") || q.contains("temperature") || q.contains("vibration") || q.contains("health"))) {
            return handleSpecificAssetDiagnosis(response, activeAsset);
        }

        // Default Overview / System Status Intent
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
        res.suggestedQuestions = List.of(
            "Why is " + (unhealthy.isEmpty() ? "MOTOR-001" : unhealthy.get(0).id) + " unhealthy?",
            "What is the predicted failure?",
            "Inject bearing fault into MOTOR-001"
        );
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
            res.evidence.add("RMS Vibration: " + asset.metrics.disk + " mm/s");
            res.evidence.add("Stator Temperature: " + asset.metrics.temperature + " °C");
            res.evidence.add("Shaft Load: " + asset.metrics.cpu + "%");
        } else {
            res.evidence.add("CPU Utilization: " + asset.metrics.cpu + "%");
            res.evidence.add("Temperature: " + asset.metrics.temperature + " °C");
            res.evidence.add("RAM Load: " + asset.metrics.ram + "%");
        }

        res.risk = asset.healthScore < 60 ? "HIGH: Potential mechanical failure / bearing overheating." : "ELEVATED: Mechanical stress detected.";
        res.recommendation = asset.recommendedAction != null ? asset.recommendedAction : "Inspect bearing housing and thermal radiator.";
        res.dataSourcesUsed.add(asset.source);
        res.confidence = "CONFIRMED";

        res.suggestedQuestions = List.of(
            "What is the predicted failure?",
            "What should the technician inspect?",
            "Reset MOTOR-001 to normal"
        );
        return res;
    }

    private CopilotResponseDto handleSpecificAssetDiagnosis(CopilotResponseDto res, String assetId) {
        AssetDto asset = toolRouter.getAsset(assetId);
        if (asset == null) {
            res.answer = "Asset ID '" + assetId + "' is not currently registered in the platform.";
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

        return res;
    }

    private CopilotResponseDto handleAssetComparisonQuery(CopilotResponseDto res, String q) {
        List<AssetDto> all = toolRouter.getAssets();
        res.answer = "Asset Comparison Matrix across " + all.size() + " registered Digital Twin instances:";
        for (AssetDto a : all) {
            res.evidence.add(a.id + " (" + a.name + "): Health " + a.healthScore + "% | Temp " + a.metrics.temperature + "°C | Mode: " + a.operatingMode + " [" + a.source + "]");
        }
        res.risk = "Comparative load variance detected between physical laptop host and synthetic industrial motor.";
        res.recommendation = "Review individual asset detail pages for spatial breakdown.";
        res.dataSourcesUsed.add("REAL-TIME LOCAL");
        res.dataSourcesUsed.add("SIMULATED");
        res.confidence = "CONFIRMED";
        return res;
    }

    private CopilotResponseDto handleTelemetryStatusQuery(CopilotResponseDto res) {
        Map<String, Object> q = toolRouter.getDataQuality();
        res.answer = "Telemetry pipeline is ONLINE and delivering live data.";
        res.evidence.add("Freshness: " + q.get("freshnessMs") + " ms");
        res.evidence.add("Data Completeness: " + q.get("dataCompletenessPct") + "%");
        res.evidence.add("Transport Latency: " + q.get("latencyMs") + " ms");
        res.evidence.add("Host Hardware Source: " + q.get("source"));
        res.risk = "No telemetry latency or stale data risks detected.";
        res.recommendation = "WebSocket stream active at /ws/telemetry.";
        res.dataSourcesUsed.add("REAL-TIME LOCAL");
        res.confidence = "CONFIRMED";
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
        return res;
    }
}
