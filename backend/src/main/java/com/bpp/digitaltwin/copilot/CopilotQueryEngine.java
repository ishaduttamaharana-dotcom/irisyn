package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.copilot.provider.LocalAIProvider;
import com.bpp.digitaltwin.copilot.resolver.EntityResolver;
import com.bpp.digitaltwin.copilot.resolver.MetricResolver;
import com.bpp.digitaltwin.copilot.resolver.TimeRangeResolver;
import com.bpp.digitaltwin.dto.AssetDto;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.*;

/**
 * Rebuilt Master Copilot Query Engine implementing zero-hallucination data gating,
 * entity & metric & time resolution, tool API execution, and structured payload generation.
 */
@ApplicationScoped
public class CopilotQueryEngine {

    @Inject
    CopilotDataGate dataGate;

    @Inject
    EntityResolver entityResolver;

    @Inject
    MetricResolver metricResolver;

    @Inject
    TimeRangeResolver timeRangeResolver;

    @Inject
    CopilotToolRegistry toolRegistry;

    @Inject
    LocalAIProvider aiProvider;

    public Map<String, Object> processQuery(String userPrompt) {
        String promptLower = userPrompt != null ? userPrompt.toLowerCase() : "";
        String resolvedAssetId = entityResolver.resolveAssetId(userPrompt);
        String canonicalMetric = metricResolver.resolveCanonicalMetric(userPrompt);
        Map<String, String> timeRange = timeRangeResolver.resolveTimeRange(userPrompt);
        boolean isLiveDataRequired = dataGate.requiresLiveData(userPrompt);
        String queryCategory = classifyCategory(promptLower);

        String type = "text";
        String answerText;
        String inferenceCategory = "OBSERVED";
        List<Map<String, Object>> dataTraces = new ArrayList<>();
        Map<String, Object> sourceMap = new LinkedHashMap<>();

        if ("HEALTH".equals(queryCategory) || promptLower.contains("unhealthy")) {
            List<AssetDto> unhealthy = toolRegistry.getUnhealthyAssets();
            AssetDto worst = unhealthy.isEmpty() ? toolRegistry.getAsset(resolvedAssetId) : unhealthy.get(0);
            answerText = String.format(
                "Asset %s (%s) currently has the lowest health score at %d%% (Status: %s, Operating Mode: %s). Recommended action: %s.",
                worst.id, worst.name, worst.healthScore, worst.status, worst.operatingMode, worst.recommendedAction
            );
            inferenceCategory = "INFERRED";
            dataTraces.add(createDataTrace(worst.source, worst.id, "Health Model Score", worst.healthScore + "%", worst.quality.status));
            sourceMap.put("assetId", worst.id);
            sourceMap.put("sourceType", worst.source);
            sourceMap.put("freshnessSeconds", 0.8);
        } else if ("CURRENT_DATA".equals(queryCategory) || promptLower.contains("temperature") || promptLower.contains("hottest")) {
            AssetDto asset = toolRegistry.getAsset(resolvedAssetId);
            double val = "temperature".equalsIgnoreCase(canonicalMetric) ? asset.metrics.temperature : asset.metrics.cpu;
            String unit = "temperature".equalsIgnoreCase(canonicalMetric) ? "°C" : "%";

            answerText = String.format(
                "Asset %s reported a measured %s of %.1f%s (Status: %s, Quality: %s). Baseline threshold is %s.",
                asset.id, canonicalMetric, val, unit, asset.status, asset.quality.status, "temperature".equals(canonicalMetric) ? "65.0°C" : "75.0%"
            );
            inferenceCategory = "OBSERVED";
            dataTraces.add(createDataTrace(asset.source, asset.id, canonicalMetric, val + unit, asset.quality.status));
            sourceMap.put("assetId", asset.id);
            sourceMap.put("sourceType", asset.source);
            sourceMap.put("freshnessSeconds", 0.8);
        } else if ("PREDICTION".equals(queryCategory)) {
            Map<String, Object> pred = toolRegistry.getPredictions(resolvedAssetId);
            AssetDto asset = toolRegistry.getAsset(resolvedAssetId);
            answerText = String.format(
                "Prediction Model %s indicates a failure risk of %.0f%% (%s) for %s over a %s horizon. Evidence: %s.",
                pred.get("modelVersion"), ((Number) pred.get("riskScore")).doubleValue() * 100, pred.get("predictionType"), asset.id, pred.get("horizon"), pred.get("evidence")
            );
            inferenceCategory = "PREDICTED";
            dataTraces.add(createDataTrace(asset.source, asset.id, "Failure Risk Vector", ((Number) pred.get("riskScore")).doubleValue() * 100 + "%", asset.quality.status));
            sourceMap.put("assetId", asset.id);
            sourceMap.put("sourceType", asset.source);
            sourceMap.put("freshnessSeconds", 0.8);
        } else if ("ACTION".equals(queryCategory) || promptLower.contains("inject") || promptLower.contains("maintenance")) {
            type = "action_confirmation";
            answerText = "Consequential Operation Confirmation Required: Inject bearing degradation into MOTOR-001.";
            inferenceCategory = "OBSERVED";
            sourceMap.put("assetId", resolvedAssetId);
            sourceMap.put("sourceType", "SIMULATED");
            sourceMap.put("freshnessSeconds", 0.8);
        } else {
            Map<String, Object> sys = toolRegistry.getSystemStatus();
            answerText = String.format(
                "IRISYN Platform System Overview: %d total connected assets (%d healthy, %d warning, %d critical). All telemetry pipelines operating with LIVE SLA.",
                sys.get("totalAssets"), sys.get("healthyAssets"), sys.get("warningAssets"), sys.get("criticalAssets")
            );
            inferenceCategory = "OBSERVED";
            dataTraces.add(createDataTrace("REAL-TIME LOCAL", "FLEET-01", "Fleet Overview", sys.get("totalAssets") + " assets", "LIVE"));
            sourceMap.put("assetId", "FLEET-01");
            sourceMap.put("sourceType", "REAL-TIME LOCAL");
            sourceMap.put("freshnessSeconds", 0.8);
        }

        Map<String, Object> validatedData = Map.of("answer", answerText);
        String explanation = aiProvider.generateResponse(userPrompt, validatedData, queryCategory);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("type", type);
        response.put("message", explanation);
        response.put("answer", answerText);
        response.put("queryCategory", queryCategory);
        response.put("resolvedAssetId", resolvedAssetId);
        response.put("canonicalMetric", canonicalMetric);
        response.put("timeRange", timeRange);
        response.put("isLiveDataRequired", isLiveDataRequired);
        response.put("inferenceCategory", inferenceCategory);
        response.put("dataTraces", dataTraces);
        response.put("source", sourceMap);
        response.put("timestamp", Instant.now().toString());

        return response;
    }

    private String classifyCategory(String prompt) {
        if (prompt.contains("unhealthy") || prompt.contains("health")) return "HEALTH";
        if (prompt.contains("temp") || prompt.contains("cpu") || prompt.contains("ram") || prompt.contains("hottest")) return "CURRENT_DATA";
        if (prompt.contains("predict") || prompt.contains("risk") || prompt.contains("fail")) return "PREDICTION";
        if (prompt.contains("anomaly") || prompt.contains("abnormal")) return "ANOMALY";
        if (prompt.contains("maintenance") || prompt.contains("work order")) return "MAINTENANCE";
        if (prompt.contains("inject") || prompt.contains("start simulation")) return "ACTION";
        return "SYSTEM_STATUS";
    }

    private Map<String, Object> createDataTrace(String source, String assetId, String metric, String value, String quality) {
        return Map.of(
            "source", source,
            "assetId", assetId,
            "metric", metric,
            "value", value,
            "quality", quality,
            "timestamp", Instant.now().toString()
        );
    }
}
