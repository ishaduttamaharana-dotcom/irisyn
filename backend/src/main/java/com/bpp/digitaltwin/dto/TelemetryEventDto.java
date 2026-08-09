package com.bpp.digitaltwin.dto;

public class TelemetryEventDto {
    public String assetId;
    public String assetName;
    public String assetType;   // LAPTOP, SERVER, MOTOR, PUMP, CNC_MACHINE
    public String source;      // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE
    public String timestamp;
    public String operatingSystem;
    public String cpuModel;
    public int coreCount;

    public TelemetryMetricsDto metrics;
    public DataQualityDto quality;

    public TelemetryEventDto() {
        this.metrics = new TelemetryMetricsDto();
        this.quality = new DataQualityDto();
    }
}
