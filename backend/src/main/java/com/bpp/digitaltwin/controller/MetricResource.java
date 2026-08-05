package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.MetricDto;
import com.bpp.digitaltwin.service.MetricService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/metrics")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Metrics")
public class MetricResource {

    @Inject
    MetricService metricService;

    @GET
    @Operation(summary = "List recent metric points")
    public List<MetricDto> listMetrics() {
        return metricService.listRecentMetrics();
    }
}
