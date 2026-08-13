package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;

/**
 * Server-side deterministic numerical calculation engine.
 * Guarantees that statistical metrics (avg, min, max, stdDev, zScore, trend) are computed by Java backend code,
 * never hallucinated by the LLM.
 */
@ApplicationScoped
public class CopilotCalculationEngine {

    public double average(List<Double> samples) {
        if (samples == null || samples.isEmpty()) return 0.0;
        return samples.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    public double minimum(List<Double> samples) {
        if (samples == null || samples.isEmpty()) return 0.0;
        return samples.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
    }

    public double maximum(List<Double> samples) {
        if (samples == null || samples.isEmpty()) return 0.0;
        return samples.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
    }

    public double standardDeviation(List<Double> samples) {
        if (samples == null || samples.size() < 2) return 0.0;
        double avg = average(samples);
        double sumSqDiff = samples.stream().mapToDouble(x -> Math.pow(x - avg, 2)).sum();
        return Math.sqrt(sumSqDiff / samples.size());
    }

    public double zScore(double currentVal, double mean, double stdDev) {
        if (stdDev <= 0.0001) return 0.0;
        return (currentVal - mean) / stdDev;
    }

    public double percentageChange(double startVal, double currentVal) {
        if (Math.abs(startVal) <= 0.00001) return 0.0;
        return ((currentVal - startVal) / startVal) * 100.0;
    }

    public String analyzeTrend(List<Double> samples) {
        if (samples == null || samples.size() < 2) return "STABLE";
        double first = samples.get(0);
        double last = samples.get(samples.size() - 1);
        double diff = last - first;

        if (diff > 2.0) return "RISING";
        if (diff < -2.0) return "FALLING";
        return "STABLE";
    }

    public Map<String, Object> calculateSummary(List<Double> samples) {
        double avg = average(samples);
        double min = minimum(samples);
        double max = maximum(samples);
        double std = standardDeviation(samples);
        String trd = analyzeTrend(samples);

        return Map.of(
            "average", Math.round(avg * 10.0) / 10.0,
            "minimum", Math.round(min * 10.0) / 10.0,
            "maximum", Math.round(max * 10.0) / 10.0,
            "standardDeviation", Math.round(std * 10.0) / 10.0,
            "trend", trd,
            "sampleCount", samples != null ? samples.size() : 0
        );
    }
}
