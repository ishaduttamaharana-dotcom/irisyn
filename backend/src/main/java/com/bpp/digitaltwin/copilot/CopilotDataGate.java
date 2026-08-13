package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Data Gate classifying user queries into LIVE/SYSTEM DATA vs GENERAL KNOWLEDGE.
 * Rule: Any question requesting real system state, asset metrics, predictions, or health
 * MUST be gated to retrieve data from IRISYN backend tool APIs.
 */
@ApplicationScoped
public class CopilotDataGate {

    public boolean requiresLiveData(String prompt) {
        if (prompt == null || prompt.isBlank()) return false;
        String promptLower = prompt.toLowerCase();

        return promptLower.contains("right now")
            || promptLower.contains("current")
            || promptLower.contains("motor")
            || promptLower.contains("node")
            || promptLower.contains("server")
            || promptLower.contains("unhealthy")
            || promptLower.contains("temp")
            || promptLower.contains("cpu")
            || promptLower.contains("risk")
            || promptLower.contains("anomaly")
            || promptLower.contains("maintenance")
            || promptLower.contains("predict")
            || promptLower.contains("alert")
            || promptLower.contains("status")
            || promptLower.contains("telemetry")
            || promptLower.contains("twin");
    }
}
