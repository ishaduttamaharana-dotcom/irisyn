package com.bpp.digitaltwin.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CopilotResponseDto {
    public String question;
    public String answer;
    public List<String> evidence;
    public String risk;
    public String recommendation;
    public List<String> dataSourcesUsed; // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE
    public String confidence;            // CONFIRMED, LIKELY, POSSIBLE, UNKNOWN, INSUFFICIENT_EVIDENCE
    public com.bpp.digitaltwin.copilot.CopilotMode mode; // CHAT_MODE, INVESTIGATION_MODE, REPORT_MODE, ACTION_MODE
    public Map<String, Object> troubleshootingReport; // Standardized Troubleshooting report for Investigation Mode

    // Data-First Validation & Attribution
    public String freshnessStatus;       // LIVE, STALE, OFFLINE
    public double freshnessSeconds;
    public List<String> dataUsedTrace;    // Expandable Data Used trace
    public List<Map<String, Object>> tableData; // Natural Language analytics comparison tables
    public List<String> rootCauseTimeline;

    // UI Action Triggers
    public Map<String, String> uiAction;

    // Consequential Action Confirmation
    public boolean requiresActionConfirmation;
    public Map<String, Object> actionPayload;

    public List<String> suggestedQuestions;
    public Map<String, Object> chartData;
    public String timestamp;

    public CopilotResponseDto() {
        this.evidence = new ArrayList<>();
        this.dataSourcesUsed = new ArrayList<>();
        this.dataUsedTrace = new ArrayList<>();
        this.tableData = new ArrayList<>();
        this.rootCauseTimeline = new ArrayList<>();
        this.suggestedQuestions = new ArrayList<>();
        this.actionPayload = new HashMap<>();
        this.uiAction = new HashMap<>();
    }
}
