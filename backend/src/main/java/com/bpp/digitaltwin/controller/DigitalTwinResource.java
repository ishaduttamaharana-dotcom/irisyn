package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiErrorDto;
import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Path("/api/twins")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Digital Twin State Engine")
public class DigitalTwinResource {

    @Inject
    DigitalTwinEngine digitalTwinEngine;

    @GET
    @Operation(summary = "List all active digital twins with state and source attribution")
    public Response listDigitalTwins(@QueryParam("source") String source) {
        List<AssetDto> twins = digitalTwinEngine.getAllAssets(source);
        return Response.ok(ApiResponseDto.of(twins, source != null ? source : "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get full structured Digital Twin state representation")
    public Response getDigitalTwin(@PathParam("id") String id) {
        AssetDto twin = digitalTwinEngine.getAssetById(id);
        if (twin == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("TWIN_NOT_FOUND", "Digital Twin for asset " + id + " was not found."))
                .build();
        }
        return Response.ok(ApiResponseDto.of(twin, twin.source)).build();
    }

    @GET
    @Path("/{id}/history")
    @Operation(summary = "Get chronological state transition history timeline for a digital twin")
    public Response getDigitalTwinHistory(@PathParam("id") String id) {
        AssetDto twin = digitalTwinEngine.getAssetById(id);
        if (twin == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("TWIN_NOT_FOUND", "Digital Twin for asset " + id + " was not found."))
                .build();
        }
        List<Map<String, Object>> history = digitalTwinEngine.getAssetHistory(id);
        return Response.ok(ApiResponseDto.of(history, twin.source)).build();
    }

    @GET
    @Path("/{id}/sensors")
    @Operation(summary = "Get sensor status matrix (connected, stale, offline, error) for a digital twin")
    public Response getDigitalTwinSensors(@PathParam("id") String id) {
        AssetDto twin = digitalTwinEngine.getAssetById(id);
        if (twin == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("TWIN_NOT_FOUND", "Digital Twin for asset " + id + " was not found."))
                .build();
        }

        List<Map<String, Object>> sensors = List.of(
            Map.of("id", "SENS-CPU-01", "name", "CPU Temperature & Load Sensor", "type", "THERMAL", "status", "CONNECTED", "health", 100),
            Map.of("id", "SENS-RAM-01", "name", "RAM Contention Sensor", "type", "MEMORY", "status", "CONNECTED", "health", 100),
            Map.of("id", "SENS-VIB-01", "name", "Tri-Axial Accelerometer (Vibration)", "type", "ACCELEROMETER", "status", twin.status.equals("CRITICAL") ? "DEGRADED" : "CONNECTED", "health", 85),
            Map.of("id", "SENS-NET-01", "name", "Network Interface Packet Monitor", "type", "NETWORK", "status", "CONNECTED", "health", 100)
        );

        return Response.ok(ApiResponseDto.of(sensors, twin.source)).build();
    }

    @PUT
    @Path("/{id}/operating-mode")
    @Operation(summary = "Manually transition digital twin operating mode (e.g. MAINTENANCE, RUNNING, FAULT)")
    public Response updateOperatingMode(@PathParam("id") String id, Map<String, String> payload) {
        AssetDto twin = digitalTwinEngine.getAssetById(id);
        if (twin == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("TWIN_NOT_FOUND", "Digital Twin for asset " + id + " was not found."))
                .build();
        }
        String newMode = payload.getOrDefault("mode", "RUNNING");
        twin.operatingMode = newMode;

        Map<String, Object> result = Map.of(
            "assetId", id,
            "operatingMode", newMode,
            "updatedAt", Instant.now().toString(),
            "status", "UPDATED"
        );
        return Response.ok(ApiResponseDto.of(result, twin.source)).build();
    }
}
