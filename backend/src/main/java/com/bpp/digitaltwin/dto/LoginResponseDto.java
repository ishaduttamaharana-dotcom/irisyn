package com.bpp.digitaltwin.dto;

public record LoginResponseDto(
    String token,
    String email,
    String displayName,
    String role
) {
}
