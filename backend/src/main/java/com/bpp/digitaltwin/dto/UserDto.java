package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.UserEntity;
import com.bpp.digitaltwin.entity.UserRole;
import java.util.UUID;

public record UserDto(UUID id, String email, String displayName, UserRole role) {
    public static UserDto from(UserEntity e) {
        return new UserDto(e.id, e.email, e.displayName, e.role);
    }
}
