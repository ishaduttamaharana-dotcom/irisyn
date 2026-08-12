package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/api/simulation")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SimulationResource {

    @Inject
    IndustrialSimulator industrialSimulator;

    @GET
    public Response getSimulationState() {
        return Response.ok(Map.of(
            "activeScenario", industrialSimulator.getActiveScenario(),
            "operatingMode", industrialSimulator.getOperatingMode(),
            "paused", industrialSimulator.isPaused(),
            "speedMultiplier", industrialSimulator.getSpeedMultiplier(),
            "simulatedAssets", List.of("MOTOR-001", "PUMP-001")
        )).build();
    }

    @POST
    @Path("/scenario")
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
}
