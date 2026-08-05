package com.bpp.digitaltwin.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RecoveryRequestDto(
    @NotNull UUID targetId,
    @NotNull RecoveryAction action
) {
    public enum RecoveryAction { RESTART, MIGRATE, SCALE, ISOLATE }
}
