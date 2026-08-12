package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Path("/api/incidents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IncidentResource {

    @GET
    public Response getIncidents() {
        List<Map<String, Object>> incidents = List.of(
            Map.of(
                "id", "INC-2026-001",
                "title", "High Vibration & Bearing Temperature Warning on MOTOR-001",
                "assetId", "MOTOR-001",
                "severity", "WARNING",
                "status", "OPEN",
                "assignedTo", "Sarah Chen (Engineer)",
                "createdAt", Instant.now().minusSeconds(1800).toString(),
                "summary", "Bearing vibration exceeded 4.2 mm/s baseline during high torque operation."
            )
        );
        return Response.ok(incidents).build();
    }
}
