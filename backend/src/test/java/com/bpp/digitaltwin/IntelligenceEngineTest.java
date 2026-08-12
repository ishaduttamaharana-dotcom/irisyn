package com.bpp.digitaltwin;

import com.bpp.digitaltwin.intelligence.AnomalyDetectionEngine;
import com.bpp.digitaltwin.intelligence.FeatureBaselineEngine;
import com.bpp.digitaltwin.intelligence.PredictionEngine;
import com.bpp.digitaltwin.intelligence.TrendAnalysisEngine;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class IntelligenceEngineTest {

    @Inject
    FeatureBaselineEngine featureEngine;

    @Inject
    AnomalyDetectionEngine anomalyEngine;

    @Inject
    TrendAnalysisEngine trendEngine;

    @Inject
    PredictionEngine predictionEngine;

    @Test
    public void testFeatureBaselineMath() {
        List<Double> samples = List.of(10.0, 12.0, 14.0, 16.0, 18.0);
        double mean = featureEngine.calculateMean(samples);
        assertEquals(14.0, mean, 0.01);

        double stdDev = featureEngine.calculateStdDev(samples, mean);
        assertTrue(stdDev > 0.0);

        double zScore = featureEngine.calculateZScore(22.0, mean, stdDev);
        assertTrue(zScore > 1.5);
    }

    @Test
    public void testStatisticalAnomalyDetectionWithEvidence() {
        List<Double> baseline = List.of(40.0, 41.0, 40.5, 42.0, 41.5);
        Map<String, Object> result = anomalyEngine.evaluateAnomaly("LAPTOP-001", "TEMPERATURE", 85.0, baseline, 65.0, 80.0);

        assertNotNull(result);
        assertEquals("SEVERE ANOMALY", result.get("status"));
        assertEquals("CRITICAL", result.get("severity"));
        assertTrue(result.containsKey("evidence"));
        assertEquals("INFERRED", result.get("inferenceCategory"));
    }

    @Test
    public void testInsufficientDataQualityGate() {
        List<Double> insufficientSamples = new ArrayList<>();
        Map<String, Object> result = anomalyEngine.evaluateAnomaly("LAPTOP-001", "VIBRATION", 2.5, insufficientSamples, 3.5, 5.0);

        assertNotNull(result);
        assertEquals("INSUFFICIENT_DATA", result.get("status"));
        assertTrue(result.get("evidence").toString().contains("minimum required samples"));
    }

    @Test
    public void testTrendAnalysisDirections() {
        List<Double> risingSeries = List.of(10.0, 15.0, 20.0, 30.0);
        Map<String, Object> result = trendEngine.analyzeTrend("LAPTOP-001", "CPU_LOAD", risingSeries);

        assertNotNull(result);
        assertEquals("RISING", result.get("direction"));

        List<Double> insufficientSeries = List.of(10.0);
        Map<String, Object> insufficientTrend = trendEngine.analyzeTrend("LAPTOP-001", "CPU_LOAD", insufficientSeries);
        assertEquals("INSUFFICIENT_DATA", insufficientTrend.get("direction"));
    }

    @Test
    public void testPredictionEngineConfidenceAndRisk() {
        Map<String, Object> prediction = predictionEngine.generatePrediction("MOTOR-001", 60.0, 85.0, 78.0, 4.5);

        assertNotNull(prediction);
        assertTrue(((Number) prediction.get("riskScore")).doubleValue() > 0.30);
        assertEquals("72 hours", prediction.get("horizon"));
        assertTrue(prediction.containsKey("evidence"));
        assertEquals("v1.0-intelligence", prediction.get("modelVersion"));
        assertEquals("PREDICTED", prediction.get("inferenceCategory"));
    }

    @Test
    public void testPredictionEngineDataQualityGate() {
        Map<String, Object> offlinePrediction = predictionEngine.generatePrediction("CNC-001", 0.0, 0.0, 0.0, 0.0);

        assertNotNull(offlinePrediction);
        assertEquals("INSUFFICIENT_DATA", offlinePrediction.get("status"));
        assertEquals(0.0, offlinePrediction.get("riskScore"));
    }
}
