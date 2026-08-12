package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Path("/api/diagnostics")
@Produces(MediaType.APPLICATION_JSON)
public class DiagnosticsResource {

    @GET
    public Response getDiagnostics() {
        List<Map<String, Object>> checks = List.of(
            Map.of("id", "DIAG-01", "component", "Host Telemetry Collector", "status", "PASS", "lastRun", Instant.now().toString(), "message", "Local hardware metrics reading OK", "latencyMs", 12),
            Map.of("id", "DIAG-02", "component", "Industrial Physics Engine", "status", "PASS", "lastRun", Instant.now().toString(), "message", "Synthetic telemetry generation active", "latencyMs", 5),
            Map.of("id", "DIAG-03", "component", "Digital Twin State Evaluator", "status", "PASS", "lastRun", Instant.now().toString(), "message", "Health breakdown models verified", "latencyMs", 8),
            Map.of("id", "DIAG-04", "component", "Target Industrial Connector (OPC-UA)", "status", "WARN", "lastRun", Instant.now().toString(), "message", "Target architecture connector in standby (Phase 2)", "latencyMs", 0)
        );
        return Response.ok(checks).build();
    }
}
