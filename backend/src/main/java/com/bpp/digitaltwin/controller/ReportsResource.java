package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
public class ReportsResource {

    @GET
    public Response getReports() {
        List<Map<String, Object>> reports = List.of(
            Map.of(
                "id", "REP-001",
                "title", "Digital Twin Asset Health Summary Report",
                "category", "HEALTH",
                "generatedAt", Instant.now().minusSeconds(86400).toString(),
                "generatedBy", "IRISYN System",
                "format", "PDF",
                "downloadUrl", "/api/reports/REP-001/download"
            ),
            Map.of(
                "id", "REP-002",
                "title", "Host Telemetry Freshness & Latency Audit",
                "category", "TELEMETRY",
                "generatedAt", Instant.now().minusSeconds(172800).toString(),
                "generatedBy", "Admin User",
                "format", "CSV",
                "downloadUrl", "/api/reports/REP-002/download"
            )
        );
        return Response.ok(reports).build();
    }
}
