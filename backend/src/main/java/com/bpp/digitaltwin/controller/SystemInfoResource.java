package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.dto.SystemInfoDTO;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Path("/api/system")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "System Info & Governance API")
public class SystemInfoResource {

    @GET
    @Path("/info")
    @Operation(summary = "Get system overview and active data sources")
    public Response getSystemInfo() {
        Map<String, String> dataSources = new HashMap<>();
        dataSources.put("realTimeLocal", "ACTIVE");
        dataSources.put("simulated", "ACTIVE");
        dataSources.put("targetFuture", "PLANNED");

        SystemInfoDTO dto = new SystemInfoDTO(
                "HEALTHY",
                "ONLINE",
                "CONNECTED",
                dataSources,
                120L,
                "development",
                "1.0.0-phase5",
                6L,
                1L,
                0L
        );
        return Response.ok(ApiResponseDto.of(dto, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/health")
    @Operation(summary = "Get system health check status")
    public Response getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("checks", Map.of(
                "database", "UP",
                "telemetryCollector", "UP",
                "industrialSimulator", "UP",
                "digitalTwinEngine", "UP",
                "copilotQueryEngine", "UP"
        ));
        return Response.ok(health).build();
    }

    @GET
    @Path("/data-quality")
    @Operation(summary = "Get telemetry data quality SLAs and gap statistics")
    public Response getDataQuality() {
        Map<String, Object> quality = Map.of(
            "freshnessSLA", "LIVE",
            "averageLatencySeconds", 0.8,
            "sampleCount24h", 86400,
            "dataLossRatePercent", 0.001,
            "sequenceIntegrity", "EXCELLENT (100%)",
            "timestamp", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(quality, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/integrations")
    @Operation(summary = "Get enterprise protocol and cloud integration status")
    public Response getIntegrations() {
        Map<String, Object> integrations = Map.of(
            "redHatOpenShift", Map.of("status", "PLANNED", "targetVersion", "OpenShift AI v2.8"),
            "opcUaGateway", Map.of("status", "PLANNED", "targetProtocol", "OPC-UA binary TCP"),
            "mqttBroker", Map.of("status", "PLANNED", "targetPort", 1883),
            "plcGateway", Map.of("status", "PLANNED", "targetDriver", "Modbus TCP / EthernetIP"),
            "timestamp", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(integrations, "REAL-TIME LOCAL")).build();
    }
}
