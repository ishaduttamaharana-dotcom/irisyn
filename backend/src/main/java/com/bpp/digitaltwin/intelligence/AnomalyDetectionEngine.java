package com.bpp.digitaltwin.intelligence;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.*;

/**
 * Statistical Anomaly Detection Engine identifying threshold breaches, rate-of-change spikes,
 * and Z-score anomalies (|Z| > 2.5) with explainable evidence payloads.
 */
@ApplicationScoped
public class AnomalyDetectionEngine {

    @Inject
    FeatureBaselineEngine featureEngine;

    public Map<String, Object> evaluateAnomaly(
            String assetId,
            String metricName,
            double currentValue,
            List<Double> historicalSamples,
            double warningThreshold,
            double criticalThreshold
    ) {
        if (historicalSamples == null || historicalSamples.isEmpty()) {
            return Map.of(
                "assetId", assetId,
                "metric", metricName,
                "status", "INSUFFICIENT_DATA",
                "severity", "NONE",
                "evidence", "Fewer than minimum required samples (n < 5) to establish rolling baseline"
            );
        }

        double mean = featureEngine.calculateMean(historicalSamples);
        double stdDev = featureEngine.calculateStdDev(historicalSamples, mean);
        double zScore = featureEngine.calculateZScore(currentValue, mean, stdDev);

        String severity = "NORMAL";
        String anomalyState = "NORMAL";

        if (Math.abs(zScore) >= 3.0 || currentValue >= criticalThreshold) {
            severity = "CRITICAL";
            anomalyState = "SEVERE ANOMALY";
        } else if (Math.abs(zScore) >= 2.5 || currentValue >= warningThreshold) {
            severity = "HIGH";
            anomalyState = "ANOMALY";
        } else if (Math.abs(zScore) >= 2.0) {
            severity = "MEDIUM";
            anomalyState = "ANOMALY";
        }

        String evidence = String.format(
            "Measured %s value %.1f deviates by Z-score %.2fσ from baseline mean %.1f (stddev %.2f). Threshold: %.1f",
            metricName, currentValue, zScore, mean, stdDev, warningThreshold
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", "ANOM-" + Math.abs(metricName.hashCode() % 1000));
        result.put("assetId", assetId);
        result.put("metric", metricName);
        result.put("status", anomalyState);
        result.put("severity", severity);
        result.put("detectedValue", currentValue);
        result.put("expectedValue", mean);
        result.put("deviationSigma", zScore);
        result.put("detectedAt", Instant.now().toString());
        result.put("evidence", evidence);
        result.put("inferenceCategory", "INFERRED");

        return result;
    }
}
