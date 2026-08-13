package com.bpp.digitaltwin;

import com.bpp.digitaltwin.controller.SystemHealthResource;
import com.bpp.digitaltwin.service.BackgroundWorkerService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class Phase7ArchitectureTest {

    @Inject
    SystemHealthResource healthResource;

    @Inject
    BackgroundWorkerService workerService;

    @Test
    public void testLivenessEndpoint() {
        Response response = healthResource.getLiveness();
        assertNotNull(response);
        assertEquals(200, response.getStatus());
    }

    @Test
    public void testReadinessEndpoint() {
        Response response = healthResource.getReadiness();
        assertNotNull(response);
        assertEquals(200, response.getStatus());
    }

    @Test
    public void testSystemHealthAggregator() {
        Response response = healthResource.getSystemHealth();
        assertNotNull(response);
        assertEquals(200, response.getStatus());
    }

    @Test
    public void testBackgroundWorkerStatuses() {
        Map<String, String> statuses = workerService.getWorkerStatuses();
        assertNotNull(statuses);
        assertTrue(statuses.containsKey("telemetry-processor"));
        assertTrue(statuses.containsKey("health-scoring-worker"));
    }
}
