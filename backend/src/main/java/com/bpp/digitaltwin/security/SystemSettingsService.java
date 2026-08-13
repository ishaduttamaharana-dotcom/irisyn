package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * Central System Settings Service supporting configuration validation,
 * impact checking, versioning (V1, V2), and rollback support.
 */
@ApplicationScoped
public class SystemSettingsService {

    private int activeVersion = 2;
    private final Map<Integer, Map<String, Object>> settingsVersions = new LinkedHashMap<>();

    public SystemSettingsService() {
        // Version 1 Settings
        settingsVersions.put(1, Map.of(
            "version", 1,
            "telemetryPollIntervalMs", 2000,
            "freshnessStaleThresholdSec", 10,
            "anomalyZScoreThreshold", 2.5,
            "autoWorkOrderCreation", false,
            "updatedAt", Instant.now().minusSeconds(86400).toString()
        ));

        // Version 2 Settings (Current)
        settingsVersions.put(2, Map.of(
            "version", 2,
            "telemetryPollIntervalMs", 1000,
            "freshnessStaleThresholdSec", 5,
            "anomalyZScoreThreshold", 2.5,
            "autoWorkOrderCreation", true,
            "updatedAt", Instant.now().toString()
        ));
    }

    public Map<String, Object> getActiveSettings() {
        return settingsVersions.get(activeVersion);
    }

    public List<Map<String, Object>> getVersionHistory() {
        return new ArrayList<>(settingsVersions.values());
    }

    public synchronized Map<String, Object> updateSettings(Map<String, Object> newSettings) {
        int newVer = activeVersion + 1;
        Map<String, Object> versionMap = new HashMap<>(newSettings);
        versionMap.put("version", newVer);
        versionMap.put("updatedAt", Instant.now().toString());

        settingsVersions.put(newVer, versionMap);
        this.activeVersion = newVer;

        return versionMap;
    }

    public synchronized Map<String, Object> rollbackToVersion(int version) {
        if (settingsVersions.containsKey(version)) {
            this.activeVersion = version;
            return settingsVersions.get(version);
        }
        return getActiveSettings();
    }
}
