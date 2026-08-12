package com.bpp.digitaltwin.dto;

import java.util.Map;

public class SystemInfoDTO {
    public String serviceStatus;
    public String apiStatus;
    public String databaseStatus;
    public Map<String, String> dataSourcesStatus;
    public long telemetryFreshnessMs;
    public String environment;
    public String version;
    public long activeAssetsCount;
    public long activeAlertsCount;
    public long openIncidentsCount;

    public SystemInfoDTO() {}

    public SystemInfoDTO(String serviceStatus, String apiStatus, String databaseStatus,
                         Map<String, String> dataSourcesStatus, long telemetryFreshnessMs,
                         String environment, String version, long activeAssetsCount,
                         long activeAlertsCount, long openIncidentsCount) {
        this.serviceStatus = serviceStatus;
        this.apiStatus = apiStatus;
        this.databaseStatus = databaseStatus;
        this.dataSourcesStatus = dataSourcesStatus;
        this.telemetryFreshnessMs = telemetryFreshnessMs;
        this.environment = environment;
        this.version = version;
        this.activeAssetsCount = activeAssetsCount;
        this.activeAlertsCount = activeAlertsCount;
        this.openIncidentsCount = openIncidentsCount;
    }
}
