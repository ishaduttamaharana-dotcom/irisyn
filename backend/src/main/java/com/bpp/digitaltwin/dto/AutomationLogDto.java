package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.AutomationLogEntity;
import java.time.Instant;
import java.util.UUID;

public record AutomationLogDto(UUID id, String jobName, String status, Instant executedAt, String details) {
    public static AutomationLogDto from(AutomationLogEntity e) {
        return new AutomationLogDto(e.id, e.jobName, e.status, e.executedAt, e.details);
    }
}
