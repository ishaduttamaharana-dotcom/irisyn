package com.bpp.digitaltwin;

import com.bpp.digitaltwin.copilot.CopilotQueryEngine;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class CopilotQueryEngineTest {

    @Inject
    CopilotQueryEngine queryEngine;

    @Test
    public void testCopilotUnhealthyAssetQuery() {
        Map<String, Object> response = queryEngine.processQuery("Which asset is unhealthy right now?");

        assertNotNull(response);
        assertTrue(response.containsKey("answer"));
        assertEquals("INFERRED", response.get("inferenceCategory"));

        List<Map<String, Object>> dataTraces = (List<Map<String, Object>>) response.get("dataTraces");
        assertNotNull(dataTraces);
        assertFalse(dataTraces.isEmpty());
        assertTrue(dataTraces.get(0).containsKey("source"));
    }

    @Test
    public void testCopilotTemperatureQuery() {
        Map<String, Object> response = queryEngine.processQuery("What is MOTOR-001 temperature?");

        assertNotNull(response);
        assertEquals("MOTOR-001", response.get("resolvedAssetId"));
        assertEquals("OBSERVED", response.get("inferenceCategory"));
        assertTrue(response.get("answer").toString().contains("temperature"));
    }

    @Test
    public void testCopilotFailurePredictionQuery() {
        Map<String, Object> response = queryEngine.processQuery("Show failure risk prediction for MOTOR-001");

        assertNotNull(response);
        assertEquals("MOTOR-001", response.get("resolvedAssetId"));
        assertEquals("PREDICTED", response.get("inferenceCategory"));
        assertTrue(response.get("answer").toString().contains("risk"));
    }

    @Test
    public void testCopilotSourceAttributionSeparation() {
        Map<String, Object> localResponse = queryEngine.processQuery("What is LAPTOP-001 temperature?");
        List<Map<String, Object>> localTraces = (List<Map<String, Object>>) localResponse.get("dataTraces");
        assertEquals("REAL-TIME LOCAL", localTraces.get(0).get("source"));

        Map<String, Object> simResponse = queryEngine.processQuery("What is MOTOR-001 temperature?");
        List<Map<String, Object>> simTraces = (List<Map<String, Object>>) simResponse.get("dataTraces");
        assertEquals("SIMULATED", simTraces.get(0).get("source"));
    }
}
