package com.bpp.digitaltwin.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequestDto(@NotBlank String message, String sessionId) {
}
