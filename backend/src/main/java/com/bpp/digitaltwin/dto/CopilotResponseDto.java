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
    public List<String> dataSourcesUsed; // REAL-TIME LOCAL, SIMULATED, TARGET ARCHITECTURE
    public String confidence;            // CONFIRMED, LIKELY, POSSIBLE
    
    // Consequential Action Confirmation
    public boolean requiresActionConfirmation;
    public Map<String, Object> actionPayload;

    // Follow-up suggestions & visual chart cards
    public List<String> suggestedQuestions;
    public Map<String, Object> chartData;
    public String timestamp;

    public CopilotResponseDto() {
        this.evidence = new ArrayList<>();
        this.dataSourcesUsed = new ArrayList<>();
        this.suggestedQuestions = new ArrayList<>();
        this.actionPayload = new HashMap<>();
    }
}
