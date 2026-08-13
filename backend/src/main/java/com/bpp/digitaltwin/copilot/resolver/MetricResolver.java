package com.bpp.digitaltwin.copilot.resolver;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Resolves natural language metric names ("CPU usage", "processor", "RAM", "temp", "vibration", "RPM")
 * to canonical platform metric keys.
 */
@ApplicationScoped
public class MetricResolver {

    public String resolveCanonicalMetric(String prompt) {
        if (prompt == null) return "temperature";
        String promptLower = prompt.toLowerCase();

        if (promptLower.contains("cpu") || promptLower.contains("processor")) {
            return "cpu_utilization";
        }
        if (promptLower.contains("ram") || promptLower.contains("memory")) {
            return "memory_utilization";
        }
        if (promptLower.contains("temp") || promptLower.contains("heat") || promptLower.contains("thermal")) {
            return "temperature";
        }
        if (promptLower.contains("rpm") || promptLower.contains("speed")) {
            return "rpm";
        }
        if (promptLower.contains("vibration") || promptLower.contains("disk")) {
            return "vibration";
        }
        if (promptLower.contains("current") || promptLower.contains("amps")) {
            return "current";
        }

        return "temperature";
    }
}
