package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.*;

/**
 * Mandatory Data Gate Interceptor. Enforces Rule 0: The LLM is NOT the source of truth, IRISYN Data is.
 * Every system/data query MUST pass through the Data Gate and require real tool execution.
 */
@ApplicationScoped
public class CopilotDataGate {

    public boolean requiresLiveData(String question) {
        if (question == null || question.isBlank()) return false;
        String q = question.toLowerCase().trim();

        // General knowledge patterns that do NOT require live platform metrics
        if (q.equals("what is a digital twin?") || q.equals("what is digital twin") || q.equals("what is predictive maintenance?") || q.equals("what is opc-ua?") || q.equals("what is mqtt?")) {
            return false;
        }

        // Action patterns
        if (q.contains("inject") || q.contains("start simulation") || q.contains("pause") || q.contains("reset") || q.contains("acknowledge")) {
            return true;
        }

        // Live system keywords requiring data tool calls
        String[] dataKeywords = {
            "usage", "cpu", "ram", "memory", "temp", "temperature", "thermal", "vibration",
            "speed", "rpm", "current", "amps", "voltage", "volts", "health", "unhealthy",
            "abnormal", "worst", "critical", "alert", "incident", "predict", "maintenance",
            "status", "fresh", "stale", "live", "happening", "right now", "compare", "trend",
            "motor", "pump", "laptop", "server", "node", "cnc", "asset"
        };

        for (String kw : dataKeywords) {
            if (q.contains(kw)) {
                return true;
            }
        }

        return false;
    }

    public Set<CopilotQueryCategory> classifyQuery(String question) {
        Set<CopilotQueryCategory> categories = new HashSet<>();
        if (question == null || question.isBlank()) {
            categories.add(CopilotQueryCategory.GENERAL_KNOWLEDGE);
            return categories;
        }

        String q = question.toLowerCase().trim();

        if (q.contains("inject") || q.contains("start") || q.contains("reset") || q.contains("pause") || q.contains("acknowledge")) {
            categories.add(CopilotQueryCategory.ACTION);
        }
        if (q.contains("compare") || q.contains("difference") || q.contains("vs")) {
            categories.add(CopilotQueryCategory.COMPARISON);
        }
        if (q.contains("trend") || q.contains("increasing") || q.contains("decreasing") || q.contains("drift")) {
            categories.add(CopilotQueryCategory.TREND);
        }
        if (q.contains("average") || q.contains("avg") || q.contains("max") || q.contains("min") || q.contains("highest") || q.contains("lowest")) {
            categories.add(CopilotQueryCategory.AGGREGATION);
        }
        if (q.contains("health") || q.contains("unhealthy") || q.contains("score") || q.contains("why")) {
            categories.add(CopilotQueryCategory.HEALTH);
        }
        if (q.contains("anomaly") || q.contains("abnormal")) {
            categories.add(CopilotQueryCategory.ANOMALY);
        }
        if (q.contains("alert") || q.contains("warning")) {
            categories.add(CopilotQueryCategory.ALERT);
        }
        if (q.contains("incident") || q.contains("happened") || q.contains("timeline")) {
            categories.add(CopilotQueryCategory.INCIDENT);
        }
        if (q.contains("maintenance") || q.contains("technician") || q.contains("inspect")) {
            categories.add(CopilotQueryCategory.MAINTENANCE);
        }
        if (q.contains("predict") || q.contains("failure")) {
            categories.add(CopilotQueryCategory.PREDICTION);
        }
        if (q.contains("system") || q.contains("fresh") || q.contains("stale") || q.contains("live") || q.contains("websocket") || q.contains("database")) {
            categories.add(CopilotQueryCategory.SYSTEM_STATUS);
        }
        if (q.contains("simulats") || q.contains("scenario") || q.contains("speed")) {
            categories.add(CopilotQueryCategory.SIMULATION);
        }

        if (categories.isEmpty()) {
            if (requiresLiveData(question)) {
                categories.add(CopilotQueryCategory.CURRENT_DATA);
            } else {
                categories.add(CopilotQueryCategory.GENERAL_KNOWLEDGE);
            }
        }

        return categories;
    }
}
