package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@Path("/api/assets")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Assets & Digital Twins")
public class AssetResource {

    @Inject
    DigitalTwinEngine digitalTwinEngine;

    @Inject
    IndustrialSimulator industrialSimulator;

    @GET
    @Operation(summary = "List all assets with optional source filtering (REAL-TIME LOCAL, SIMULATED, TARGET)")
    public List<AssetDto> listAssets(@QueryParam("source") String source) {
        return digitalTwinEngine.getAllAssets(source);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get detailed Digital Twin state for a specific asset")
    public Response getAsset(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("message", "Asset not found: " + id))
                .build();
        }
        return Response.ok(asset).build();
    }

    @POST
    @Path("/simulation/scenario")
    @Operation(summary = "Inject a failure or operational scenario into the industrial simulator")
    public Response setScenario(@QueryParam("name") String name) {
        if (name == null || name.isBlank()) {
            name = "NORMAL";
        }
        industrialSimulator.setScenario(name);
        return Response.ok(Map.of(
            "status", "UPDATED",
            "scenario", industrialSimulator.getActiveScenario(),
            "operatingMode", industrialSimulator.getOperatingMode()
        )).build();
    }

    @POST
    @Path("/simulation/pause")
    @Operation(summary = "Pause or resume the industrial simulator")
    public Response togglePause(@QueryParam("paused") boolean paused) {
        industrialSimulator.setPaused(paused);
        return Response.ok(Map.of(
            "status", "UPDATED",
            "paused", industrialSimulator.isPaused()
        )).build();
    }

    @POST
    @Path("/simulation/speed")
    @Operation(summary = "Set simulation speed multiplier (1x, 5x, 10x, 50x)")
    public Response setSpeed(@QueryParam("multiplier") int multiplier) {
        industrialSimulator.setSpeedMultiplier(multiplier);
        return Response.ok(Map.of(
            "status", "UPDATED",
            "speedMultiplier", industrialSimulator.getSpeedMultiplier()
        )).build();
    }
}
