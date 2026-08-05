package com.bpp.digitaltwin.dto;

import java.util.UUID;

public record RecoveryResponseDto(UUID targetId, String status, String message) {
}
