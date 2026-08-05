package com.bpp.digitaltwin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PredictionRequestDto(
    @NotNull UUID targetId,
    @Min(1) int horizonMinutes
) {
}
