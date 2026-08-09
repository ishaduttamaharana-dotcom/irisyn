package com.bpp.digitaltwin.dto;

public class DataQualityDto {
    public boolean valid;
    public long freshnessMs;
    public double completenessPct;
    public long latencyMs;
    public String status; // GOOD, STALE, DEGRADED, BUFFERED

    public DataQualityDto() {
        this.valid = true;
        this.freshnessMs = 0;
        this.completenessPct = 100.0;
        this.latencyMs = 2;
        this.status = "GOOD";
    }

    public DataQualityDto(boolean valid, long freshnessMs, double completenessPct, String status) {
        this.valid = valid;
        this.freshnessMs = freshnessMs;
        this.completenessPct = completenessPct;
        this.status = status;
    }
}
