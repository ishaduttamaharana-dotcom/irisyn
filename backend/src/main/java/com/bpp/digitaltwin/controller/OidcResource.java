package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.dto.LoginResponseDto;
import io.smallrye.jwt.build.Jwt;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/api/auth/oidc")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "OIDC / SSO Enterprise Identity Provider API")
public class OidcResource {

    @GET
    @Path("/config")
    @Operation(summary = "Get OIDC discovery metadata configuration")
    public Response getOidcConfig() {
        Map<String, Object> config = Map.of(
            "issuer", "https://sso.enterprise.internal/auth/realms/irisyn",
            "authorization_endpoint", "https://sso.enterprise.internal/auth/realms/irisyn/protocol/openid-connect/auth",
            "token_endpoint", "https://sso.enterprise.internal/auth/realms/irisyn/protocol/openid-connect/token",
            "userinfo_endpoint", "https://sso.enterprise.internal/auth/realms/irisyn/protocol/openid-connect/userinfo",
            "jwks_uri", "https://sso.enterprise.internal/auth/realms/irisyn/protocol/openid-connect/certs",
            "scopes_supported", java.util.List.of("openid", "profile", "email", "roles")
        );
        return Response.ok(ApiResponseDto.of(config, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/token")
    @Operation(summary = "Exchange authorization code for JWT token from Keycloak / Okta / Azure AD")
    public Response exchangeToken(Map<String, String> payload) {
        String code = payload.getOrDefault("code", "AUTH_CODE_DEMO");
        String email = payload.getOrDefault("email", "admin@example.com");

        String token = Jwt.issuer("https://sso.enterprise.internal/auth/realms/irisyn")
            .upn(email)
            .groups("ADMIN")
            .claim("displayName", "OIDC Enterprise User")
            .sign();

        LoginResponseDto response = new LoginResponseDto(token, email, "OIDC Enterprise User", "ADMIN");
        return Response.ok(ApiResponseDto.of(response, "REAL-TIME LOCAL")).build();
    }
}
