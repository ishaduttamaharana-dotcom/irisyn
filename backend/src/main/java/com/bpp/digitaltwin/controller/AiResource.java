package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.automation.PredictionService;
import com.bpp.digitaltwin.automation.RecoveryService;
import com.bpp.digitaltwin.dto.*;
import com.bpp.digitaltwin.service.ChatService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import java.util.List;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "AI & Automation")
public class AiResource {

    @Inject
    PredictionService predictionService;

    @Inject
    RecoveryService recoveryService;

    @Inject
    ChatService chatService;

    @POST
    @Path("/predict")
    @Operation(summary = "Request a (mock) failure prediction for a target node")
    public PredictionResponseDto predict(@Valid PredictionRequestDto request) {
        return predictionService.predict(request);
    }

    @GET
    @Path("/prediction/history")
    @Operation(summary = "Get previous failure prediction history")
    public List<PredictionResponseDto> getPredictionHistory() {
        return predictionService.listPredictionHistory();
    }

    @POST
    @Path("/recover")
    @Operation(summary = "Trigger a (mock/simulated) recovery action")
    public RecoveryResponseDto recover(@Valid RecoveryRequestDto request) {
        return recoveryService.triggerRecovery(request);
    }

    @POST
    @Path("/chat")
    @Operation(summary = "Send a message to the OpenClaw assistant (placeholder)")
    public ChatResponseDto chat(@Valid ChatRequestDto request) {
        return chatService.reply(request);
    }
}
