package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.UserDto;
import com.bpp.digitaltwin.service.UserService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Users")
public class UserResource {

    @Inject
    UserService userService;

    @GET
    @Operation(summary = "List all users")
    public List<UserDto> listUsers() {
        return userService.listUsers();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a user by ID")
    public UserDto getUser(@PathParam("id") UUID id) {
        return userService.getUser(id);
    }

    @POST
    @Operation(summary = "Create a new user")
    public Response createUser(@Valid UserDto dto) {
        UserDto created = userService.createUser(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing user")
    public UserDto updateUser(@PathParam("id") UUID id, @Valid UserDto dto) {
        return userService.updateUser(id, dto);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a user by ID")
    public Response deleteUser(@PathParam("id") UUID id) {
        userService.deleteUser(id);
        return Response.noContent().build();
    }
}
