package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.MetricEntity;
import java.time.Instant;

public record MetricDto(Instant timestamp, double cpu, double ram, double disk, double network) {
    public static MetricDto from(MetricEntity e) {
        return new MetricDto(e.recordedAt, e.cpu, e.ram, e.disk, e.network);
    }
}
