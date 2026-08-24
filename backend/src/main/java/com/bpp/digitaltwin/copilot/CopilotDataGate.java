package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.CopilotQueryDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.EnumSet;
import java.util.Set;

/**
 * Data Gate classifying user queries into LIVE/SYSTEM DATA vs GENERAL KNOWLEDGE,
 * and mapping queries into IRISYN Copilot Operating Modes.
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
            || promptLower.contains("twin")
            || promptLower.contains("diagnose")
            || promptLower.contains("why");
    }

    public Set<CopilotQueryCategory> classifyQuery(String prompt) {
        Set<CopilotQueryCategory> categories = EnumSet.noneOf(CopilotQueryCategory.class);
        if (prompt == null || prompt.isBlank()) {
            categories.add(CopilotQueryCategory.GENERAL_KNOWLEDGE);
            return categories;
        }

        String promptLower = prompt.toLowerCase();

        if (promptLower.contains("inject") || promptLower.contains("restart") || promptLower.contains("reset") || promptLower.contains("set scenario")) {
            categories.add(CopilotQueryCategory.ACTION);
        }
        if (promptLower.contains("compare") || promptLower.contains("vs") || promptLower.contains("matrix")) {
            categories.add(CopilotQueryCategory.COMPARISON);
        }
        if (promptLower.contains("trend") || promptLower.contains("history") || promptLower.contains("last")) {
            categories.add(CopilotQueryCategory.TREND);
            categories.add(CopilotQueryCategory.HISTORICAL_DATA);
        }
        if (promptLower.contains("health") || promptLower.contains("unhealthy") || promptLower.contains("why")) {
            categories.add(CopilotQueryCategory.HEALTH);
        }
        if (promptLower.contains("anomaly") || promptLower.contains("abnormal")) {
            categories.add(CopilotQueryCategory.ANOMALY);
        }
        if (promptLower.contains("alert")) {
            categories.add(CopilotQueryCategory.ALERT);
        }
        if (promptLower.contains("predict") || promptLower.contains("risk")) {
            categories.add(CopilotQueryCategory.PREDICTION);
        }
        if (promptLower.contains("status") || promptLower.contains("telemetry")) {
            categories.add(CopilotQueryCategory.SYSTEM_STATUS);
        }

        if (categories.isEmpty()) {
            if (requiresLiveData(promptLower)) {
                categories.add(CopilotQueryCategory.CURRENT_DATA);
            } else {
                categories.add(CopilotQueryCategory.GENERAL_KNOWLEDGE);
            }
        }
        return categories;
    }

    public CopilotMode resolveMode(String prompt, CopilotQueryDto dto) {
        if (dto != null && dto.mode != null) {
            return dto.mode;
        }
        if (prompt == null || prompt.isBlank()) {
            return CopilotMode.CHAT_MODE;
        }

        String promptLower = prompt.toLowerCase();

        if (promptLower.contains("inject") || promptLower.contains("restart") || promptLower.contains("reset") || promptLower.contains("execute")) {
            return CopilotMode.ACTION_MODE;
        }
        if (promptLower.contains("why") || promptLower.contains("diagnose") || promptLower.contains("root cause") || promptLower.contains("unhealthy") || promptLower.contains("fix")) {
            return CopilotMode.INVESTIGATION_MODE;
        }
        if (promptLower.contains("report") || promptLower.contains("summary") || promptLower.contains("compare") || promptLower.contains("history") || promptLower.contains("matrix")) {
            return CopilotMode.REPORT_MODE;
        }

        return CopilotMode.CHAT_MODE;
    }
}
