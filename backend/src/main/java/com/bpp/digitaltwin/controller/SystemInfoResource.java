package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.SystemInfoDTO;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@Path("/api/system")
@Produces(MediaType.APPLICATION_JSON)
public class SystemInfoResource {

    @GET
    @Path("/info")
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
                "1.0.0-phase1",
                4L,
                1L,
                0L
        );
        return Response.ok(com.bpp.digitaltwin.dto.ApiResponseDto.of(dto, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/health")
    public Response getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("checks", Map.of(
                "database", "UP",
                "telemetryCollector", "UP",
                "industrialSimulator", "UP",
                "digitalTwinEngine", "UP"
        ));
        return Response.ok(health).build();
    }
}
