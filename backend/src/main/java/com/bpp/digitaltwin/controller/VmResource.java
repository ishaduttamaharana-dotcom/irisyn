package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.VmDto;
import com.bpp.digitaltwin.service.VmService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/vms")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Virtual Machines")
public class VmResource {

    @Inject
    VmService vmService;

    @GET
    @Operation(summary = "List all virtual machines")
    public List<VmDto> listVms() {
        return vmService.listVms();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get VM by ID")
    public VmDto getVm(@PathParam("id") UUID id) {
        return vmService.getVm(id);
    }

    @POST
    @Operation(summary = "Create a new virtual machine")
    public Response createVm(@Valid VmDto dto) {
        VmDto created = vmService.createVm(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing virtual machine")
    public VmDto updateVm(@PathParam("id") UUID id, @Valid VmDto dto) {
        return vmService.updateVm(id, dto);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a virtual machine")
    public Response deleteVm(@PathParam("id") UUID id) {
        vmService.deleteVm(id);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/restart")
    @Operation(summary = "Restart a Virtual Machine")
    public VmDto restartVm(@PathParam("id") UUID id) {
        return vmService.restartVm(id);
    }

    @POST
    @Path("/{id}/stop")
    @Operation(summary = "Shutdown a Virtual Machine")
    public VmDto stopVm(@PathParam("id") UUID id) {
        return vmService.stopVm(id);
    }

    @POST
    @Path("/{id}/start")
    @Operation(summary = "Start a Virtual Machine")
    public VmDto startVm(@PathParam("id") UUID id) {
        return vmService.startVm(id);
    }

    @POST
    @Path("/{id}/migrate")
    @Operation(summary = "Live Migrate VM to another hypervisor node")
    public VmDto migrateVm(@PathParam("id") UUID id) {
        return vmService.migrateVm(id);
    }
}
