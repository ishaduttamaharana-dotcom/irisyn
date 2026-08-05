package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.AlertEntity;
import java.time.Instant;
import java.util.UUID;

public record AlertDto(UUID id, String severity, String message, String source, Instant createdAt, boolean acknowledged) {
    public static AlertDto from(AlertEntity e) {
        return new AlertDto(e.id, e.severity.name(), e.message, e.source, e.createdAt, e.acknowledged);
    }
}
