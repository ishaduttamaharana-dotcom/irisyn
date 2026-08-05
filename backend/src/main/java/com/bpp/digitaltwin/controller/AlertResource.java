package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.AlertDto;
import com.bpp.digitaltwin.service.AlertService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/alerts")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Alerts")
public class AlertResource {

    @Inject
    AlertService alertService;

    @GET
    @Operation(summary = "List active alerts")
    public List<AlertDto> listAlerts() {
        return alertService.listAlerts();
    }

    @PUT
    @Path("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert by ID")
    public AlertDto acknowledgeAlert(@PathParam("id") UUID id) {
        return alertService.acknowledgeAlert(id);
    }
}
