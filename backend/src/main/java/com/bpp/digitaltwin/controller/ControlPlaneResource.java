package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.config.SystemConfigService;
import com.bpp.digitaltwin.monitoring.SystemDiagnosticsEngine;
import com.bpp.digitaltwin.security.SecurityRbacService;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@Path("/api/control-plane")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "IRISYN Control Plane")
public class ControlPlaneResource {

    @Inject
    SystemConfigService configService;

    @Inject
    SecurityRbacService rbacService;

    @Inject
    SystemDiagnosticsEngine diagnosticsEngine;

    @Inject
    ObjectMapper objectMapper;

    @GET
    @Path("/overview")
    @Operation(summary = "Get Master Control Center system overview")
    public Map<String, Object> getOverview() {
        return configService.getAllConfigs();
    }

    @GET
    @Path("/config")
    @Operation(summary = "Get all dynamic configuration values")
    public Map<String, Object> getConfig() {
        return configService.getAllConfigs();
    }

    @POST
    @Path("/config")
    @Operation(summary = "Update a dynamic configuration parameter")
    public Response setConfig(@QueryParam("key") String key,
                              @QueryParam("value") String value,
                              @QueryParam("user") String user,
                              @QueryParam("role") String role) {
        // Enforce RBAC permission
        SecurityRbacService.AccessDecisionResult access = rbacService.evaluateAccess(user, role, "Thresholds.Write", "ControlPlane");
        if ("DENIED".equals(access.decision)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(access)
                .build();
        }

        configService.setConfig(key, value, user);
        return Response.ok(Map.of("status", "UPDATED", "key", key, "value", value, "accessDecision", access)).build();
    }

    @POST
    @Path("/health-weights")
    @Operation(summary = "Update dynamic health model factor weights")
    public Response updateHealthWeights(Map<String, Object> weights,
                                         @QueryParam("user") String user,
                                         @QueryParam("role") String role) {
        SecurityRbacService.AccessDecisionResult access = rbacService.evaluateAccess(user, role, "HealthModel.Write", "HealthEngine");
        if ("DENIED".equals(access.decision)) {
            return Response.status(Response.Status.FORBIDDEN).entity(access).build();
        }

        try {
            String json = objectMapper.writeValueAsString(weights);
            configService.setConfig("health.weights", json, user);
            return Response.ok(Map.of("status", "UPDATED", "healthWeights", weights)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("message", "Invalid JSON format")).build();
        }
    }

    @GET
    @Path("/diagnostics")
    @Operation(summary = "Run full live system diagnostics and test component latency")
    public Map<String, Object> runDiagnostics() {
        return diagnosticsEngine.runFullDiagnostics();
    }

    @GET
    @Path("/rbac-matrix")
    @Operation(summary = "Get Role-Based Access Control permission matrix")
    public List<Map<String, Object>> getRbacMatrix() {
        return rbacService.getRolePermissionMatrix();
    }

    @POST
    @Path("/evaluate-access")
    @Operation(summary = "Evaluate RBAC access decision for a user role and permission")
    public SecurityRbacService.AccessDecisionResult evaluateAccess(@QueryParam("user") String user,
                                                                   @QueryParam("role") String role,
                                                                   @QueryParam("permission") String permission,
                                                                   @QueryParam("resource") String resource) {
        return rbacService.evaluateAccess(user, role, permission, resource != null ? resource : "System");
    }
}
