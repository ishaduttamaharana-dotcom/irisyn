package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.deployment.BackupEngine;
import com.bpp.digitaltwin.dto.ApiResponseDto;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/deployment")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Deployment & Reliability Management API")
public class DeploymentResource {

    @Inject
    BackupEngine backupEngine;

    @GET
    @Path("/info")
    @Operation(summary = "Get active environment build version, git commit hash, and SLA metrics")
    public Response getDeploymentInfo() {
        Map<String, Object> info = Map.of(
            "environment", "DEMO",
            "releaseVersion", "v1.0.0-phase7",
            "commitHash", "a994733",
            "builtAt", "2026-08-13T12:35:00Z",
            "deployedAt", Instant.now().minusSeconds(14400).toString(),
            "activeContainers", List.of("irisyn-frontend", "irisyn-backend", "irisyn-db"),
            "healthStatus", "HEALTHY",
            "webSocketStatus", "CONNECTED",
            "databaseStatus", "PERSISTENT (PostgreSQL 15)"
        );
        return Response.ok(ApiResponseDto.of(info, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/backups")
    @Operation(summary = "List all database snapshots and verification status")
    public Response listBackups() {
        return Response.ok(ApiResponseDto.of(backupEngine.getAllSnapshots(), "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/backup/create")
    @Operation(summary = "Trigger on-demand backup snapshot generation")
    public Response createBackup(Map<String, String> payload) {
        String description = payload.getOrDefault("description", "Manual backup snapshot triggered from Deployment Dashboard");
        String user = payload.getOrDefault("user", "ADMIN");

        BackupEngine.BackupSnapshot snap = backupEngine.createSnapshot(description, user);
        return Response.status(Response.Status.CREATED).entity(ApiResponseDto.of(snap, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/rollback")
    @Operation(summary = "Execute deployment rollback to specified backup snapshot")
    public Response rollback(Map<String, String> payload) {
        String snapshotId = payload.get("snapshotId");
        Map<String, Object> result = backupEngine.executeRollback(snapshotId);
        return Response.ok(ApiResponseDto.of(result, "REAL-TIME LOCAL")).build();
    }
}
