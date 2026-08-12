package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Path("/api/maintenance")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MaintenanceResource {

    @GET
    public Response getMaintenanceOrders() {
        List<Map<String, Object>> workOrders = List.of(
            Map.of(
                "id", "WO-9041",
                "assetId", "MOTOR-001",
                "assetName", "Siemens 150kW Industrial Motor",
                "type", "PREDICTIVE",
                "priority", "HIGH",
                "status", "PLANNED",
                "description", "Inspect drive shaft alignment and grease drive-end bearings based on vibration trend.",
                "dueDate", Instant.now().plusSeconds(86400 * 2).toString(),
                "assignedEngineer", "Alex Rivera (Senior Tech)",
                "estimatedHours", 2.5
            )
        );
        return Response.ok(workOrders).build();
    }
}
