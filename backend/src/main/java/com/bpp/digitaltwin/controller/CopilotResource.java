package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.copilot.CopilotEngine;
import com.bpp.digitaltwin.copilot.CopilotToolRouter;
import com.bpp.digitaltwin.dto.CopilotQueryDto;
import com.bpp.digitaltwin.dto.CopilotResponseDto;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/api/copilot")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "IRISYN Copilot AI")
public class CopilotResource {

    @Inject
    CopilotEngine copilotEngine;

    @Inject
    CopilotToolRouter toolRouter;

    @POST
    @Path("/query")
    @Operation(summary = "Ask natural language question to context-aware IRISYN Copilot AI")
    public Response queryCopilot(CopilotQueryDto query) {
        if (query == null || query.question == null || query.question.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("message", "Question cannot be empty"))
                .build();
        }
        CopilotResponseDto response = copilotEngine.processQuery(query);
        return Response.ok(response).build();
    }

    @POST
    @Path("/execute-action")
    @Operation(summary = "Execute confirmed consequential action (e.g. inject fault, reset asset)")
    public Response executeAction(@QueryParam("action") String action,
                                  @QueryParam("target") String target,
                                  @QueryParam("scenario") String scenario) {
        Map<String, Object> result = copilotEngine.executeAction(action, target, scenario);
        return Response.ok(result).build();
    }

    @GET
    @Path("/status")
    @Operation(summary = "Get AI Copilot operational status, connected tools, and data sync latency")
    public Map<String, Object> getStatus() {
        Map<String, Object> sys = toolRouter.getSystemHealth();
        Map<String, Object> dq = toolRouter.getDataQuality();

        return Map.of(
            "aiStatus", "ONLINE",
            "dataConnection", "LIVE",
            "configuredModel", "IRISYN Tool-Augmented Digital Twin Copilot v2.4",
            "activeContextAssets", sys.get("totalAssets"),
            "systemStatus", sys.get("status"),
            "lastDataSync", dq.get("freshnessMs") + " ms ago",
            "latencyMs", dq.get("latencyMs")
        );
    }
}
