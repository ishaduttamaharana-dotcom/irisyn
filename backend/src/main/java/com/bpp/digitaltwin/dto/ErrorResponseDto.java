package com.bpp.digitaltwin.dto;

import java.time.Instant;

public record ErrorResponseDto(String message, int status, Instant timestamp) {
    public static ErrorResponseDto of(String message, int status) {
        return new ErrorResponseDto(message, status, Instant.now());
    }
}
