package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.Map;

/**
 * Global System Operating Modes Engine managing system modes:
 * NORMAL, SIMULATION, DEMO, MAINTENANCE, READ_ONLY, EMERGENCY.
 * Enforces mode restrictions on backend write operations.
 */
@ApplicationScoped
public class SystemModeEngine {

    public enum SystemMode {
        NORMAL,
        SIMULATION,
        DEMO,
        MAINTENANCE,
        READ_ONLY,
        EMERGENCY
    }

    private SystemMode currentMode = SystemMode.NORMAL;
    private String setBy = "ADMIN";
    private Instant lastChanged = Instant.now();

    public SystemMode getCurrentMode() {
        return currentMode;
    }

    public synchronized void setMode(SystemMode mode, String user) {
        this.currentMode = mode;
        this.setBy = user != null ? user : "ADMIN";
        this.lastChanged = Instant.now();
    }

    public boolean isWriteAllowed() {
        return currentMode != SystemMode.READ_ONLY && currentMode != SystemMode.MAINTENANCE;
    }

    public Map<String, Object> getModeDetails() {
        return Map.of(
            "currentMode", currentMode.name(),
            "isWriteAllowed", isWriteAllowed(),
            "setBy", setBy,
            "lastChanged", lastChanged.toString()
        );
    }
}
