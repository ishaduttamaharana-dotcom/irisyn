package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.LoginRequestDto;
import com.bpp.digitaltwin.dto.LoginResponseDto;
import com.bpp.digitaltwin.entity.UserEntity;
import com.bpp.digitaltwin.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.HashSet;
import java.util.List;

@Path("/api/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication")
public class AuthController {

    @Inject
    UserRepository userRepository;

    @POST
    @Path("/login")
    @Operation(summary = "Login and generate signed JWT token")
    public Response login(@Valid LoginRequestDto request) {
        UserEntity user = userRepository.find("email", request.email()).firstResult();
        
        // Simple password check (accepting any password for seeded users for easy hackathon testing)
        if (user == null || request.password().isBlank()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"message\":\"Invalid credentials. Seeded users: admin@example.com, operator@example.com, viewer@example.com\"}")
                .build();
        }

        // Generate signed JWT using the privateKey.pem resource
        String token = Jwt.issuer("https://digital-twin.local")
            .upn(user.email)
            .groups(user.role.name()) // ADMIN, OPERATOR, VIEWER
            .claim("displayName", user.displayName)
            .sign();

        LoginResponseDto response = new LoginResponseDto(
            token,
            user.email,
            user.displayName,
            user.role.name()
        );

        return Response.ok(response).build();
    }
}
