package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/incidents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Incidents API")
public class IncidentResource {

    @GET
    @Operation(summary = "List operational incidents")
    public Response getIncidents() {
        List<Map<String, Object>> incidents = List.of(
            Map.of(
                "id", "INC-2026-001",
                "title", "High Vibration & Bearing Temperature Warning on MOTOR-001",
                "assetId", "MOTOR-001",
                "severity", "WARNING",
                "status", "INVESTIGATING",
                "assignedTo", "Sarah Chen (Engineer)",
                "createdAt", Instant.now().minusSeconds(1800).toString(),
                "summary", "Bearing vibration exceeded 4.2 mm/s baseline during high torque operation."
            ),
            Map.of(
                "id", "INC-2026-002",
                "title", "CPU Saturation & Workload Contention on dc-node-03",
                "assetId", "dc-node-03",
                "severity", "CRITICAL",
                "status", "OPEN",
                "assignedTo", "Alex Rivera (Cloud Ops)",
                "createdAt", Instant.now().minusSeconds(3600).toString(),
                "summary", "High CPU workload caused disk I/O latency spike."
            )
        );
        return Response.ok(ApiResponseDto.of(incidents, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/{id}/timeline")
    @Operation(summary = "Get incident resolution timeline")
    public Response getIncidentTimeline(@PathParam("id") String id) {
        List<Map<String, Object>> timeline = List.of(
            Map.of("timestamp", Instant.now().minusSeconds(1800).toString(), "event", "Incident " + id + " opened automatically by Anomaly Detector"),
            Map.of("timestamp", Instant.now().minusSeconds(1200).toString(), "event", "Copilot Root Cause Engine initiated investigation"),
            Map.of("timestamp", Instant.now().minusSeconds(600).toString(), "event", "Assigned engineer acknowledged incident")
        );
        return Response.ok(ApiResponseDto.of(timeline, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Operation(summary = "Report a new operational incident")
    public Response createIncident(Map<String, String> payload) {
        String assetId = payload.getOrDefault("assetId", "dc-node-03");
        String title = payload.getOrDefault("title", "Operational Incident on " + assetId);

        Map<String, Object> incident = Map.of(
            "id", "INC-2026-" + (100 + (int)(Math.random() * 900)),
            "assetId", assetId,
            "title", title,
            "severity", payload.getOrDefault("severity", "WARNING"),
            "status", "OPEN",
            "createdAt", Instant.now().toString()
        );
        return Response.status(Response.Status.CREATED).entity(ApiResponseDto.of(incident, "REAL-TIME LOCAL")).build();
    }
}
