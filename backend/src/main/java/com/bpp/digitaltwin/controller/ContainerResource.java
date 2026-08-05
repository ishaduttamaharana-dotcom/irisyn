package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ContainerDto;
import com.bpp.digitaltwin.service.ContainerService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/containers")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Containers")
public class ContainerResource {

    @Inject
    ContainerService containerService;

    @GET
    @Operation(summary = "List all containers")
    public List<ContainerDto> listContainers() {
        return containerService.listContainers();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get container by ID")
    public ContainerDto getContainer(@PathParam("id") UUID id) {
        return containerService.getContainer(id);
    }

    @POST
    @Operation(summary = "Create a new container")
    public Response createContainer(@Valid ContainerDto dto) {
        ContainerDto created = containerService.createContainer(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing container")
    public ContainerDto updateContainer(@PathParam("id") UUID id, @Valid ContainerDto dto) {
        return containerService.updateContainer(id, dto);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a container")
    public Response deleteContainer(@PathParam("id") UUID id) {
        containerService.deleteContainer(id);
        return Response.noContent().build();
    }
}
