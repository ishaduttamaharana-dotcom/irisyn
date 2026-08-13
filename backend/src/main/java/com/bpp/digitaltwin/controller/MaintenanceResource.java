package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/maintenance")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Maintenance & Work Orders API")
public class MaintenanceResource {

    @GET
    @Operation(summary = "List all maintenance work orders and predictive recommendations")
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
            ),
            Map.of(
                "id", "WO-9042",
                "assetId", "dc-node-03",
                "assetName", "Data Center Server Node 03",
                "type", "CORRECTIVE",
                "priority", "MEDIUM",
                "status", "IN_PROGRESS",
                "description", "Clear excessive temp logs and rebalance container workloads.",
                "dueDate", Instant.now().plusSeconds(86400).toString(),
                "assignedEngineer", "Sarah Chen (Cloud Ops)",
                "estimatedHours", 1.0
            )
        );
        return Response.ok(ApiResponseDto.of(workOrders, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Operation(summary = "Create a new maintenance work order")
    public Response createWorkOrder(Map<String, String> payload) {
        String assetId = payload.getOrDefault("assetId", "MOTOR-001");
        String description = payload.getOrDefault("description", "Inspect asset based on predictive risk alert");

        Map<String, Object> newOrder = Map.of(
            "id", "WO-" + (9043 + (int)(Math.random() * 100)),
            "assetId", assetId,
            "type", "PREDICTIVE",
            "priority", "HIGH",
            "status", "PLANNED",
            "description", description,
            "createdAt", Instant.now().toString(),
            "dueDate", Instant.now().plusSeconds(86400 * 3).toString()
        );
        return Response.status(Response.Status.CREATED).entity(ApiResponseDto.of(newOrder, "REAL-TIME LOCAL")).build();
    }

    @PUT
    @Path("/{id}/status")
    @Operation(summary = "Update maintenance work order status")
    public Response updateStatus(@PathParam("id") String id, Map<String, String> payload) {
        String newStatus = payload.getOrDefault("status", "COMPLETED");
        Map<String, Object> updated = Map.of(
            "id", id,
            "status", newStatus,
            "updatedAt", Instant.now().toString(),
            "message", "Work order " + id + " updated to " + newStatus
        );
        return Response.ok(ApiResponseDto.of(updated, "REAL-TIME LOCAL")).build();
    }
}
