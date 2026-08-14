package com.bpp.digitaltwin;

import com.bpp.digitaltwin.controller.IndustrialResource;
import com.bpp.digitaltwin.industrial.*;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class Phase8IndustrialReadinessTest {

    @Inject
    IndustrialResource industrialResource;

    @Inject
    MqttAdapterService mqttService;

    @Inject
    OpcUaAdapterService opcUaService;

    @Inject
    ModbusAdapterService modbusService;

    @Inject
    RedHatEdgeCollector rhelCollector;

    @Inject
    OpenShiftAiConnector openShiftAi;

    @Test
    public void testAdaptersStatusEndpoint() {
        Response response = industrialResource.getAdaptersStatus();
        assertNotNull(response);
        assertEquals(200, response.getStatus());
    }

    @Test
    public void testLiveTagsEndpoint() {
        Response response = industrialResource.getLiveTags();
        assertNotNull(response);
        assertEquals(200, response.getStatus());
    }

    @Test
    public void testOpenShiftAiInference() {
        Map<String, Object> res = openShiftAi.runInference("Analyze MOTOR-001 vibration tag");
        assertNotNull(res);
        assertEquals("Granite-7b-Lab-Industrial", res.get("model"));
        assertTrue(res.get("prediction").toString().contains("vibration"));
    }
}
