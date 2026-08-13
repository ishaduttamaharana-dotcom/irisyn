package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.dto.LoginRequestDto;
import com.bpp.digitaltwin.dto.LoginResponseDto;
import com.bpp.digitaltwin.entity.UserEntity;
import com.bpp.digitaltwin.repository.UserRepository;
import com.bpp.digitaltwin.security.SessionManagementEngine;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/api/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication & Session API")
public class AuthController {

    @Inject
    UserRepository userRepository;

    @Inject
    SessionManagementEngine sessionEngine;

    @POST
    @Path("/login")
    @Operation(summary = "Login and generate signed JWT token + active session token")
    public Response login(@Valid LoginRequestDto request) {
        UserEntity user = userRepository.find("email", request.email()).firstResult();
        
        if (user == null || request.password().isBlank()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "UNAUTHENTICATED", "message", "Invalid credentials. Seeded users: admin@example.com, operator@example.com, viewer@example.com"))
                .build();
        }

        SessionManagementEngine.UserSession session = sessionEngine.createSession(
            "USR-" + Math.abs(user.email.hashCode() % 1000),
            user.email,
            user.role.name()
        );

        String token = Jwt.issuer("https://digital-twin.local")
            .upn(user.email)
            .groups(user.role.name())
            .claim("displayName", user.displayName)
            .claim("sessionId", session.sessionId)
            .sign();

        LoginResponseDto response = new LoginResponseDto(
            token,
            user.email,
            user.displayName,
            user.role.name()
        );

        return Response.ok(ApiResponseDto.of(response, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/logout")
    @Operation(summary = "Logout and revoke active session token")
    public Response logout(Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        if (sessionId != null) {
            sessionEngine.revokeSession(sessionId);
        }
        return Response.ok(ApiResponseDto.of(Map.of("status", "LOGGED_OUT", "message", "Session successfully revoked"), "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/me")
    @Operation(summary = "Get current authenticated user profile and active session status")
    public Response getCurrentUser(@HeaderParam("X-IRISYN-SESSION") String sessionId) {
        if (sessionId != null && !sessionEngine.validateSession(sessionId)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "SESSION_EXPIRED", "message", "Active session has expired or been revoked"))
                .build();
        }

        Map<String, Object> userProfile = Map.of(
            "email", "admin@example.com",
            "displayName", "Admin User",
            "role", "ADMIN",
            "permissions", java.util.List.of("VIEW", "EDIT", "EXECUTE", "DELETE", "EXPORT", "CONFIGURE"),
            "scope", "IRISYN_ENTERPRISE / SITE_EAST / PLANT_A"
        );
        return Response.ok(ApiResponseDto.of(userProfile, "REAL-TIME LOCAL")).build();
    }
}
