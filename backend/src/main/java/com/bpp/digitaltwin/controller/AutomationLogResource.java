package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.AutomationLogDto;
import com.bpp.digitaltwin.service.AutomationLogService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/automation-logs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Automation Logs")
public class AutomationLogResource {

    @Inject
    AutomationLogService logService;

    @GET
    @Operation(summary = "List all automation logs")
    public List<AutomationLogDto> listLogs() {
        return logService.listLogs();
    }

    @POST
    @Operation(summary = "Create a new automation log")
    public Response createLog(@Valid AutomationLogDto dto) {
        AutomationLogDto created = logService.createLog(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}
