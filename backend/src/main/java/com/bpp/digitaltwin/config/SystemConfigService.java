package com.bpp.digitaltwin.config;

import com.bpp.digitaltwin.entity.SystemConfigEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Centralized Control Plane Configuration Service.
 * Supplies dynamic settings to Telemetry, Digital Twin, Health Engine, Alert Engine, and Copilot.
 */
@ApplicationScoped
public class SystemConfigService {

    @Inject
    ObjectMapper objectMapper;

    private final Map<String, String> inMemoryConfig = new ConcurrentHashMap<>();

    public SystemConfigService() {
        // Safe Default Configurations
        inMemoryConfig.put("system.platformName", "IRISYN");
        inMemoryConfig.put("system.tagline", "Digital Twin Platform");
        inMemoryConfig.put("system.environment", "DEMO / DEVELOPMENT");
        inMemoryConfig.put("system.defaultMode", "HYBRID");
        inMemoryConfig.put("system.timezone", "Asia/Kolkata");
        inMemoryConfig.put("telemetry.collectionIntervalSec", "1");
        inMemoryConfig.put("telemetry.transport", "WebSocket");
        inMemoryConfig.put("telemetry.staleThresholdSec", "10");
        inMemoryConfig.put("telemetry.retentionDays", "30");

        // Health Model Default Weights (Must total 100)
        inMemoryConfig.put("health.weights", "{\"cpu\":20,\"thermal\":20,\"ram\":15,\"disk\":15,\"anomaly\":20,\"availability\":10}");

        // Alert Threshold Defaults
        inMemoryConfig.put("alert.thresholds", "{\"tempWarning\":70.0,\"tempCritical\":80.0,\"vibrationWarning\":3.5,\"vibrationCritical\":8.0}");

        // Feature Flags
        inMemoryConfig.put("featureFlags", "{\"industrialSimulator\":true,\"aiCopilot\":true,\"predictiveMaintenance\":true,\"threeDTwin\":true,\"mqttTarget\":false,\"opcUaTarget\":false,\"redHatIntegration\":false}");
    }

    public String getConfig(String key, String defaultValue) {
        return inMemoryConfig.getOrDefault(key, defaultValue);
    }

    public Map<String, Object> getHealthWeights() {
        try {
            String json = inMemoryConfig.get("health.weights");
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("cpu", 20, "thermal", 20, "ram", 15, "disk", 15, "anomaly", 20, "availability", 10);
        }
    }

    public Map<String, Object> getAlertThresholds() {
        try {
            String json = inMemoryConfig.get("alert.thresholds");
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("tempWarning", 70.0, "tempCritical", 80.0, "vibrationWarning", 3.5, "vibrationCritical", 8.0);
        }
    }

    public Map<String, Boolean> getFeatureFlags() {
        try {
            String json = inMemoryConfig.get("featureFlags");
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("industrialSimulator", true, "aiCopilot", true, "predictiveMaintenance", true, "threeDTwin", true, "mqttTarget", false, "redHatIntegration", false);
        }
    }

    @Transactional
    public synchronized void setConfig(String key, String value, String user) {
        inMemoryConfig.put(key, value);
        try {
            SystemConfigEntity entity = SystemConfigEntity.find("configKey", key).firstResult();
            if (entity == null) {
                entity = new SystemConfigEntity(key, value, user);
            } else {
                entity.configValue = value;
                entity.updatedBy = user;
                entity.updatedAt = Instant.now();
            }
            entity.persist();
        } catch (Exception e) {
            // Keep in-memory config if DB table is uninitialized
        }
    }

    public Map<String, Object> getAllConfigs() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("platformName", getConfig("system.platformName", "IRISYN"));
        result.put("tagline", getConfig("system.tagline", "Digital Twin Platform"));
        result.put("environment", getConfig("system.environment", "DEMO / DEVELOPMENT"));
        result.put("defaultMode", getConfig("system.defaultMode", "HYBRID"));
        result.put("timezone", getConfig("system.timezone", "Asia/Kolkata"));
        result.put("collectionIntervalSec", Integer.parseInt(getConfig("telemetry.collectionIntervalSec", "1")));
        result.put("telemetryTransport", getConfig("telemetry.transport", "WebSocket"));
        result.put("staleThresholdSec", Integer.parseInt(getConfig("telemetry.staleThresholdSec", "10")));
        result.put("healthWeights", getHealthWeights());
        result.put("alertThresholds", getAlertThresholds());
        result.put("featureFlags", getFeatureFlags());
        return result;
    }
}
