package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ClusterSummaryDto;
import com.bpp.digitaltwin.service.ClusterService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/cluster")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Cluster")
public class ClusterResource {

    @Inject
    ClusterService clusterService;

    @GET
    @Operation(summary = "Get cluster-wide health summary")
    public ClusterSummaryDto getSummary() {
        return clusterService.summarize();
    }
}
