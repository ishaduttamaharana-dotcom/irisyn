package com.bpp.digitaltwin.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AssetDto {
    public String id;
    public String name;
    public String type;             // LAPTOP, SERVER, INDUSTRIAL_MOTOR, PUMP, CNC_MACHINE
    public String source;           // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE
    public String manufacturer;
    public String model;
    public String serialNumber;
    public String location;
    public String installationDate;
    public String configVersion;
    public String status;           // HEALTHY, WARNING, CRITICAL, OFFLINE
    public String operatingMode;    // OFFLINE, IDLE, STARTING, RUNNING, HIGH_LOAD, DEGRADED, FAULT, MAINTENANCE, UNKNOWN
    public int healthScore;         // 0-100%
    public Map<String, Integer> healthBreakdown;
    public double operatingHours;
    public long stateVersion;       // Monotonically incremented counter on meaningful state changes
    public String twinVersion = "v2.4";
    public TelemetryMetricsDto metrics;
    public DataQualityDto quality;
    public String lastUpdated;
    public List<String> activeAlerts;
    public String currentPrediction;
    public String recommendedAction;
    public String lastMaintenanceDate;
    public String nextMaintenanceDate;
    public String maintenanceStatus; // OK, DUE_SOON, OVERDUE, SCHEDULED

    public AssetDto() {
        this.healthBreakdown = new HashMap<>();
        this.metrics = new TelemetryMetricsDto();
        this.quality = new DataQualityDto();
        this.stateVersion = 1L;
    }
}
