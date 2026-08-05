package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.Map;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
public class RootResource {

    @GET
    public Map<String, String> getApiRoot() {
        return Map.of(
            "status", "UP",
            "name", "AI-Powered Data Center Digital Twin API",
            "version", "0.1.0-SNAPSHOT",
            "documentation", "/api/swagger-ui"
        );
    }
}
