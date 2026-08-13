package com.bpp.digitaltwin;

import com.bpp.digitaltwin.security.*;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class ExpandedControlPlaneTest {

    @Inject
    ServiceRegistryEngine serviceRegistryEngine;

    @Inject
    IntegrationRegistryEngine integrationRegistryEngine;

    @Inject
    ConfigurationService configurationService;

    @Test
    public void testResourceScopeHierarchy() {
        ResourceScope parent = new ResourceScope("IRISYN_ENTERPRISE", "SITE_EAST", "PLANT_A", "AREA_SERVERS", "dc-node-03", "SENS-TEMP-01");
        ResourceScope childSameSite = new ResourceScope("IRISYN_ENTERPRISE", "SITE_EAST", "PLANT_A", "AREA_SERVERS", "dc-node-03", "SENS-TEMP-01");
        ResourceScope childDiffSite = new ResourceScope("IRISYN_ENTERPRISE", "SITE_WEST", "PLANT_B", "AREA_MOTORS", "MOTOR-001", "SENS-VIB-01");

        assertTrue(parent.isAuthorized(childSameSite));
        assertFalse(parent.isAuthorized(childDiffSite));
    }

    @Test
    public void testServiceRegistryFourteenServices() {
        List<ServiceRegistryEngine.ServiceRecord> registry = serviceRegistryEngine.getServiceRegistry();

        assertEquals(14, registry.size());
        assertEquals("REST API Gateway", registry.get(0).name);
        assertEquals("ONLINE", registry.get(0).status);
    }

    @Test
    public void testIntegrationRegistryNineIntegrations() {
        List<IntegrationRegistryEngine.IntegrationRecord> registry = integrationRegistryEngine.getIntegrationRegistry();

        assertEquals(9, registry.size());
        assertEquals("Local Hardware Telemetry Collector", registry.get(0).name);
        assertEquals("CONNECTED", registry.get(0).status);
    }

    @Test
    public void testConfigurationEightStageLifecycle() {
        Map<String, Object> proposal = configurationService.proposeConfigChange("telemetry.staleThreshold", 15, "USR-001");

        assertNotNull(proposal);
        assertEquals("PASS", proposal.get("dependencyCheck"));
        assertEquals("PROPOSED", proposal.get("status"));

        ConfigurationService.ConfigItem item = configurationService.applyConfigChange("telemetry.staleThreshold", 15, "USR-001");
        assertNotNull(item);
        assertEquals(2, item.version);
        assertEquals(15, item.value);
    }
}
