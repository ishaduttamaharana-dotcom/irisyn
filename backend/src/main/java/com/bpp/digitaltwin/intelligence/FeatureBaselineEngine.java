package com.bpp.digitaltwin.intelligence;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/**
 * Feature & Baseline Engine calculating rolling mean, standard deviation, Z-score (sigma),
 * rate of change, and baseline deviation across telemetry streams.
 */
@ApplicationScoped
public class FeatureBaselineEngine {

    public double calculateMean(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        double sum = 0.0;
        for (double v : values) sum += v;
        return Math.round((sum / values.size()) * 100.0) / 100.0;
    }

    public double calculateStdDev(List<Double> values, double mean) {
        if (values == null || values.size() <= 1) return 1.0; // avoid division by zero
        double sumSq = 0.0;
        for (double v : values) {
            sumSq += Math.pow(v - mean, 2);
        }
        double std = Math.sqrt(sumSq / (values.size() - 1));
        return Math.max(0.1, Math.round(std * 100.0) / 100.0);
    }

    public double calculateZScore(double currentValue, double mean, double stdDev) {
        if (stdDev <= 0.0) return 0.0;
        double z = (currentValue - mean) / stdDev;
        return Math.round(z * 100.0) / 100.0;
    }

    public double calculateRateOfChange(double previousValue, double currentValue, double timeIntervalSeconds) {
        if (timeIntervalSeconds <= 0) return 0.0;
        double roc = (currentValue - previousValue) / timeIntervalSeconds;
        return Math.round(roc * 100.0) / 100.0;
    }
}
