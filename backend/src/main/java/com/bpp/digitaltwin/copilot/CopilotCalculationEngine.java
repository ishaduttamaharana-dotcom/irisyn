package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.*;

/**
 * Deterministic calculation engine for mathematical calculations.
 * Enforces Rule 0: Java code performs all calculations; the LLM only formats the explanation.
 */
@ApplicationScoped
public class CopilotCalculationEngine {

    public static class CalculationResult {
        public double min;
        public double max;
        public double avg;
        public double median;
        public double stddev;
        public double diff;
        public double pctChange;
        public String trend; // INCREASING, DECREASING, STABLE
        public double zScore;
        public int sampleCount;

        public CalculationResult() {}
    }

    public CalculationResult calculateSummary(List<Double> dataPoints) {
        CalculationResult res = new CalculationResult();
        if (dataPoints == null || dataPoints.isEmpty()) {
            return res;
        }

        res.sampleCount = dataPoints.size();
        double sum = 0.0;
        double min = Double.MAX_VALUE;
        double max = -Double.MAX_VALUE;

        for (double v : dataPoints) {
            sum += v;
            if (v < min) min = v;
            if (v > max) max = v;
        }

        res.min = Math.round(min * 100.0) / 100.0;
        res.max = Math.round(max * 100.0) / 100.0;
        res.avg = Math.round((sum / dataPoints.size()) * 100.0) / 100.0;

        // Median
        List<Double> sorted = new ArrayList<>(dataPoints);
        Collections.sort(sorted);
        int mid = sorted.size() / 2;
        res.median = sorted.size() % 2 != 0 ? sorted.get(mid) : (sorted.get(mid - 1) + sorted.get(mid)) / 2.0;
        res.median = Math.round(res.median * 100.0) / 100.0;

        // StdDev
        double variance = 0.0;
        for (double v : dataPoints) {
            variance += Math.pow(v - res.avg, 2);
        }
        res.stddev = Math.round(Math.sqrt(variance / dataPoints.size()) * 100.0) / 100.0;

        // Trend & Percentage Change
        if (dataPoints.size() >= 2) {
            double first = dataPoints.get(0);
            double last = dataPoints.get(dataPoints.size() - 1);
            res.diff = Math.round((last - first) * 100.0) / 100.0;
            res.pctChange = first != 0 ? Math.round(((last - first) / Math.abs(first)) * 1000.0) / 10.0 : 0.0;

            if (res.pctChange > 5.0) {
                res.trend = "INCREASING";
            } else if (res.pctChange < -5.0) {
                res.trend = "DECREASING";
            } else {
                res.trend = "STABLE";
            }

            if (res.stddev > 0) {
                res.zScore = Math.round(((last - res.avg) / res.stddev) * 100.0) / 100.0;
            }
        } else {
            res.trend = "STABLE";
        }

        return res;
    }

    public Map<String, Object> compareMetrics(double valA, double valB, String labelA, String labelB) {
        double diff = Math.round((valA - valB) * 100.0) / 100.0;
        double pctDiff = valB != 0 ? Math.round(((valA - valB) / Math.abs(valB)) * 1000.0) / 10.0 : 0.0;
        return Map.of(
            "labelA", labelA,
            "valueA", valA,
            "labelB", labelB,
            "valueB", valB,
            "difference", diff > 0 ? "+" + diff : String.valueOf(diff),
            "percentageDifference", (pctDiff > 0 ? "+" + pctDiff : pctDiff) + "%",
            "higherAsset", valA > valB ? labelA : valA < valB ? labelB : "EQUAL"
        );
    }
}
