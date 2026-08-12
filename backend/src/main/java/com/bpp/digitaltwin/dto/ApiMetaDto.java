package com.bpp.digitaltwin.dto;

import java.time.Instant;

public class ApiMetaDto {
    public String timestamp;
    public String source;
    public String version;
    public Long latencyMs;

    public ApiMetaDto() {
        this.timestamp = Instant.now().toString();
        this.source = "REAL-TIME LOCAL";
        this.version = "1.0.0-phase1";
    }

    public ApiMetaDto(String source) {
        this.timestamp = Instant.now().toString();
        this.source = source != null ? source : "REAL-TIME LOCAL";
        this.version = "1.0.0-phase1";
    }

    public ApiMetaDto(String source, Long latencyMs) {
        this.timestamp = Instant.now().toString();
        this.source = source != null ? source : "REAL-TIME LOCAL";
        this.version = "1.0.0-phase1";
        this.latencyMs = latencyMs;
    }
}
