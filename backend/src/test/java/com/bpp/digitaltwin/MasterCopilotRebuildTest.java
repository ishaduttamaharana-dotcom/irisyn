package com.bpp.digitaltwin;

import com.bpp.digitaltwin.copilot.CopilotCalculationEngine;
import com.bpp.digitaltwin.copilot.CopilotDataGate;
import com.bpp.digitaltwin.copilot.CopilotQueryEngine;
import com.bpp.digitaltwin.copilot.provider.LocalAIProvider;
import com.bpp.digitaltwin.copilot.resolver.EntityResolver;
import com.bpp.digitaltwin.copilot.resolver.MetricResolver;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class MasterCopilotRebuildTest {

    @Inject
    CopilotQueryEngine queryEngine;

    @Inject
    CopilotDataGate dataGate;

    @Inject
    EntityResolver entityResolver;

    @Inject
    MetricResolver metricResolver;

    @Inject
    CopilotCalculationEngine calculationEngine;

    @Inject
    LocalAIProvider aiProvider;

    @Test
    public void testDataGateLiveDataRequirement() {
        assertTrue(dataGate.requiresLiveData("What is MOTOR-001 temperature right now?"));
        assertTrue(dataGate.requiresLiveData("Which asset is unhealthy?"));
        assertFalse(dataGate.requiresLiveData("What is quantum computing?"));
    }

    @Test
    public void testEntityAndMetricResolvers() {
        assertEquals("MOTOR-001", entityResolver.resolveAssetId("What is Motor 1 temperature?"));
        assertEquals("dc-node-03", entityResolver.resolveAssetId("What is CPU of node 3?"));

        assertEquals("cpu_utilization", metricResolver.resolveCanonicalMetric("CPU usage"));
        assertEquals("temperature", metricResolver.resolveCanonicalMetric("core thermal temp"));
    }

    @Test
    public void testDeterministicCalculationEngine() {
        List<Double> samples = List.of(10.0, 20.0, 30.0, 40.0, 50.0);
        assertEquals(30.0, calculationEngine.average(samples), 0.001);
        assertEquals(10.0, calculationEngine.minimum(samples), 0.001);
        assertEquals(50.0, calculationEngine.maximum(samples), 0.001);
        assertEquals("RISING", calculationEngine.analyzeTrend(samples));
    }

    @Test
    public void testMasterCopilotChatEndpointFlow() {
        Map<String, Object> response = queryEngine.processQuery("Which asset has the highest temperature?");

        assertNotNull(response);
        assertEquals("text", response.get("type"));
        assertNotNull(response.get("message"));
        assertNotNull(response.get("source"));
        assertEquals("OBSERVED", response.get("inferenceCategory"));

        Map<String, Object> source = (Map<String, Object>) response.get("source");
        assertNotNull(source.get("assetId"));
        assertNotNull(source.get("sourceType"));
    }
}
