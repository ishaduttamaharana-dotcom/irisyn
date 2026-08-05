package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.ServerEntity;
import java.util.UUID;

public record ServerDto(
    UUID id,
    String hostname,
    String rack,
    String status,
    double cpuUsage,
    double ramUsage,
    double diskUsage,
    double temperatureC,
    long uptimeHours
) {
    public static ServerDto from(ServerEntity e) {
        return new ServerDto(e.id, e.hostname, e.rack, e.status.name(), e.cpuUsage, e.ramUsage, e.diskUsage, e.temperatureC, e.uptimeHours);
    }
}
