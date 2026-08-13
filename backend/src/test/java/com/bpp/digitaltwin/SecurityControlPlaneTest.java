package com.bpp.digitaltwin;

import com.bpp.digitaltwin.security.SystemModeEngine;
import com.bpp.digitaltwin.security.SystemSettingsService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class SecurityControlPlaneTest {

    @Inject
    SystemModeEngine systemModeEngine;

    @Inject
    SystemSettingsService settingsService;

    @Test
    public void testSystemModeEngineSwitching() {
        systemModeEngine.setMode(SystemModeEngine.SystemMode.NORMAL, "ADMIN");
        assertEquals(SystemModeEngine.SystemMode.NORMAL, systemModeEngine.getCurrentMode());
        assertTrue(systemModeEngine.isWriteAllowed());

        systemModeEngine.setMode(SystemModeEngine.SystemMode.READ_ONLY, "ADMIN");
        assertEquals(SystemModeEngine.SystemMode.READ_ONLY, systemModeEngine.getCurrentMode());
        assertFalse(systemModeEngine.isWriteAllowed());

        systemModeEngine.setMode(SystemModeEngine.SystemMode.NORMAL, "ADMIN");
    }

    @Test
    public void testSettingsVersioningAndRollback() {
        Map<String, Object> active = settingsService.getActiveSettings();
        assertNotNull(active);
        assertEquals(2, active.get("version"));

        Map<String, Object> newSettings = Map.of(
            "telemetryPollIntervalMs", 500,
            "freshnessStaleThresholdSec", 3,
            "anomalyZScoreThreshold", 2.8,
            "autoWorkOrderCreation", true
        );

        Map<String, Object> updated = settingsService.updateSettings(newSettings);
        assertEquals(3, updated.get("version"));

        Map<String, Object> rolledBack = settingsService.rollbackToVersion(2);
        assertEquals(2, rolledBack.get("version"));
    }
}
