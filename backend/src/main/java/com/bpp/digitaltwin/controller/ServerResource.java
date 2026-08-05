package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ServerDto;
import com.bpp.digitaltwin.service.ServerService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/servers")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Servers")
public class ServerResource {

    @Inject
    ServerService serverService;

    @GET
    @Operation(summary = "List all servers with optional filtering")
    public List<ServerDto> listServers(
            @QueryParam("rack") String rack,
            @QueryParam("hostname") String hostname) {
        return serverService.listServers(rack, hostname);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get server by ID")
    public ServerDto getServer(@PathParam("id") UUID id) {
        return serverService.getServer(id);
    }

    @POST
    @RolesAllowed({"ADMIN", "OPERATOR"})
    @Operation(summary = "Create a new server")
    public Response createServer(@Valid ServerDto dto) {
        ServerDto created = serverService.createServer(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "OPERATOR"})
    @Operation(summary = "Update an existing server")
    public ServerDto updateServer(@PathParam("id") UUID id, @Valid ServerDto dto) {
        return serverService.updateServer(id, dto);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    @Operation(summary = "Delete a server")
    public Response deleteServer(@PathParam("id") UUID id) {
        serverService.deleteServer(id);
        return Response.noContent().build();
    }
}
