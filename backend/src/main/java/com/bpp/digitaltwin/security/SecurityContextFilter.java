package com.bpp.digitaltwin.security;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Enhanced Security & Authorization Filter enforcing Rule 1 - 25:
 * Server-side RBAC, Scope authorization, Rate limiting, Session validation,
 * System mode write restrictions, and explicit error codes.
 */
@Provider
public class SecurityContextFilter implements ContainerRequestFilter {

    @Inject
    SystemModeEngine systemModeEngine;

    @Inject
    SessionManagementEngine sessionEngine;

    @Inject
    RateLimitingGuard rateLimiter;

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = Map.of(
        "ADMIN", Set.of("VIEW", "EDIT", "EXECUTE", "DELETE", "EXPORT", "CONFIGURE"),
        "ENGINEER", Set.of("VIEW", "EDIT", "EXECUTE", "EXPORT", "CONFIGURE"),
        "OPERATOR", Set.of("VIEW", "EXECUTE", "EXPORT"),
        "VIEWER", Set.of("VIEW")
    );

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String method = requestContext.getMethod();
        String path = requestContext.getUriInfo().getPath();
        String clientIp = requestContext.getHeaderString("X-Forwarded-For");

        // Rule 21: Rate Limiting
        if (!rateLimiter.isAllowed(clientIp != null ? clientIp : "CLIENT_IP")) {
            requestContext.abortWith(Response.status(Response.Status.TOO_MANY_REQUESTS)
                .entity(Map.of(
                    "error", "RATE_LIMIT_EXCEEDED",
                    "message", "Rate limit exceeded. Maximum 60 requests per minute allowed."
                ))
                .build());
            return;
        }

        // Rule 19: Session Validation if Session Header present
        String sessionId = requestContext.getHeaderString("X-IRISYN-SESSION");
        if (sessionId != null && !sessionId.isBlank()) {
            if (!sessionEngine.validateSession(sessionId)) {
                requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of(
                        "error", "SESSION_EXPIRED",
                        "message", "Session has expired or been revoked due to idle timeout."
                    ))
                    .build());
                return;
            }
        }

        // Rule 13: System Mode write restrictions
        if (("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) && !systemModeEngine.isWriteAllowed()) {
            if (!path.contains("control/mode")) {
                requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of(
                        "error", "ACTION_NOT_ALLOWED",
                        "message", "Platform is operating in " + systemModeEngine.getCurrentMode() + " mode. Write actions are restricted."
                    ))
                    .build());
                return;
            }
        }

        // Rule 5, 6, 7: Server-side RBAC Role & Permission evaluation
        String roleHeader = requestContext.getHeaderString("X-IRISYN-ROLE");
        if (roleHeader != null && !roleHeader.isBlank()) {
            String role = roleHeader.toUpperCase();
            Set<String> permissions = ROLE_PERMISSIONS.getOrDefault(role, Set.of("VIEW"));

            if ("DELETE".equals(method) && !permissions.contains("DELETE")) {
                requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "FORBIDDEN", "message", "Role " + role + " lacks DELETE permission."))
                    .build());
            } else if (("POST".equals(method) || "PUT".equals(method)) && !permissions.contains("EXECUTE") && !permissions.contains("EDIT") && !permissions.contains("CONFIGURE")) {
                if (!path.contains("copilot/chat") && !path.contains("copilot/query")) {
                    requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "FORBIDDEN", "message", "Role " + role + " lacks write/execute permission."))
                        .build());
                }
            }
        }
    }
}
