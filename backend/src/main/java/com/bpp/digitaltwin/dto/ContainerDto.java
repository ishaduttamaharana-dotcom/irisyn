package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.ContainerEntity;
import java.util.UUID;

public record ContainerDto(UUID id, String name, String image, String podName, String status, double cpuUsage, double ramUsage) {
    public static ContainerDto from(ContainerEntity e) {
        return new ContainerDto(e.id, e.name, e.image, e.podName, e.status.name(), e.cpuUsage, e.ramUsage);
    }
}
