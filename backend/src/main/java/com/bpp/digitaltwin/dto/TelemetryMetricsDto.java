package com.bpp.digitaltwin.dto;

public class TelemetryMetricsDto {
    public double cpu;            // 0-100%
    public double cpuFreqGHz;     // e.g. 2.8 GHz
    public double ram;            // 0-100%
    public double ramUsedGb;
    public double ramFreeGb;
    public double ramTotalGb;
    public double disk;           // 0-100%
    public double diskUsedGb;
    public double diskTotalGb;
    public double diskReadMbps;
    public double diskWriteMbps;
    public double temperature;    // °C
    public double networkInKbps;  // KB/s or Kbps
    public double networkOutKbps;
    public double networkLatencyMs;
    public int processCount;
    public int threadCount;
    public long uptimeSeconds;
    public double loadAverage;
    public double batteryPct;

    public TelemetryMetricsDto() {}
}
