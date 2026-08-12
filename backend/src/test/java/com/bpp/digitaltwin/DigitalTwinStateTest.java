package com.bpp.digitaltwin;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class DigitalTwinStateTest {

    @Inject
    DigitalTwinEngine digitalTwinEngine;

    @Test
    public void testAssetTwinRegistryAndStableIdentity() {
        digitalTwinEngine.updateAllAssets();
        List<AssetDto> assets = digitalTwinEngine.getAllAssets("ALL");

        assertNotNull(assets);
        assertTrue(assets.size() >= 2);

        AssetDto laptop = digitalTwinEngine.getAssetById("LAPTOP-001");
        assertNotNull(laptop);
        assertEquals("LAPTOP-001", laptop.id);
        assertEquals("REAL-TIME LOCAL", laptop.source);
        assertTrue(laptop.stateVersion >= 1);
    }

    @Test
    public void testOperatingModeStateMachine() {
        digitalTwinEngine.updateAllAssets();
        AssetDto motor = digitalTwinEngine.getAssetById("MOTOR-001");

        assertNotNull(motor);
        assertNotNull(motor.operatingMode);
        assertTrue(List.of("RUNNING", "HIGH_LOAD", "DEGRADED", "FAULT", "OFFLINE").contains(motor.operatingMode.toUpperCase()));
    }

    @Test
    public void testStateTransitionHistoryTracking() {
        digitalTwinEngine.updateAllAssets();
        List<Map<String, Object>> history = digitalTwinEngine.getAssetHistory("LAPTOP-001");

        assertNotNull(history);
        assertFalse(history.isEmpty());
        assertTrue(history.get(0).containsKey("timestamp"));
    }

    @Test
    public void testConnectedResourceGraphRelations() {
        digitalTwinEngine.updateAllAssets();
        Map<String, Object> relations = digitalTwinEngine.getAssetRelations("LAPTOP-001");

        assertNotNull(relations);
        assertEquals("LAPTOP-001", relations.get("assetId"));
        assertTrue(relations.containsKey("sensors"));
        assertTrue(relations.containsKey("telemetryStreams"));
        assertTrue(relations.containsKey("maintenance"));
    }
}
