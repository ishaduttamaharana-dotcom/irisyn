package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.telemetry.LocalTelemetryCollector;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/api/system")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "System Observability")
public class SystemTelemetryResource {

    @Inject
    LocalTelemetryCollector localCollector;

    @GET
    @Path("/telemetry-status")
    @Operation(summary = "Get real-time telemetry collector status, data freshness, and system metadata")
    public Map<String, Object> getTelemetryStatus() {
        TelemetryEventDto localEvent = localCollector.captureTelemetry();
        return Map.of(
            "collectorStatus", "ONLINE",
            "collectorSource", "REAL-TIME LOCAL",
            "freshnessMs", localEvent.quality.freshnessMs,
            "dataCompleteness", localEvent.quality.completenessPct + "%",
            "activeHost", localEvent.assetName,
            "operatingSystem", localEvent.operatingSystem,
            "coreCount", localEvent.coreCount,
            "latencyMs", localEvent.quality.latencyMs,
            "websocketPath", "/ws/telemetry"
        );
    }
}
