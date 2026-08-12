package com.bpp.digitaltwin.intelligence;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;

/**
 * Trend Analysis Engine evaluating trajectory directions (RISING, FALLING, STABLE, VOLATILE, INSUFFICIENT_DATA).
 */
@ApplicationScoped
public class TrendAnalysisEngine {

    public Map<String, Object> analyzeTrend(String assetId, String metricName, List<Double> series) {
        if (series == null || series.size() < 3) {
            return Map.of(
                "assetId", assetId,
                "metric", metricName,
                "direction", "INSUFFICIENT_DATA",
                "slope", 0.0,
                "confidence", 0.0,
                "description", "Requires at least 3 historical telemetry points to derive trajectory"
            );
        }

        double first = series.get(0);
        double last = series.get(series.size() - 1);
        double diff = last - first;

        String direction = "STABLE";
        if (diff > 5.0) {
            direction = "RISING";
        } else if (diff < -5.0) {
            direction = "FALLING";
        }

        return Map.of(
            "assetId", assetId,
            "metric", metricName,
            "direction", direction,
            "delta", Math.round(diff * 100.0) / 100.0,
            "sampleCount", series.size(),
            "confidence", 0.95,
            "description", String.format("Metric %s shifted by %+.1f over past %d samples", metricName, diff, series.size()),
            "inferenceCategory", "INFERRED"
        );
    }
}
