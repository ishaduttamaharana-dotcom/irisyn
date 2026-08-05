package com.bpp.digitaltwin.dto;

import java.util.UUID;

public record PredictionResponseDto(
    UUID targetId,
    double predictedFailureProbability,
    String recommendedAction,
    double healthScore,
    String failureType,
    double confidenceScore
) {
}
