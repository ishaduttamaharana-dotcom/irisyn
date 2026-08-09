package com.bpp.digitaltwin.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AssetDto {
    public String id;
    public String name;
    public String type;             // LAPTOP, SERVER, MOTOR, PUMP, CNC_MACHINE
    public String source;           // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE
    public String manufacturer;
    public String model;
    public String location;
    public String status;           // HEALTHY, WARNING, CRITICAL, OFFLINE
    public String operatingMode;     // NORMAL, HIGH_LOAD, DEGRADATION, FAULT
    public int healthScore;         // 0-100%
    public Map<String, Integer> healthBreakdown;
    public double operatingHours;
    public TelemetryMetricsDto metrics;
    public DataQualityDto quality;
    public String lastUpdated;
    public List<String> activeAlerts;
    public String currentPrediction;
    public String recommendedAction;

    public AssetDto() {
        this.healthBreakdown = new HashMap<>();
        this.metrics = new TelemetryMetricsDto();
        this.quality = new DataQualityDto();
    }
}
