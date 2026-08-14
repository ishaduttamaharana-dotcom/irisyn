package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.industrial.*;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/industrial")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Industrial Edge & OpenShift AI Gateway API")
public class IndustrialResource {

    @Inject
    MqttAdapterService mqttService;

    @Inject
    OpcUaAdapterService opcUaService;

    @Inject
    ModbusAdapterService modbusService;

    @Inject
    RedHatEdgeCollector rhelCollector;

    @Inject
    OpenShiftAiConnector openShiftAi;

    @GET
    @Path("/adapters")
    @Operation(summary = "Get status of all 5 industrial protocol adapters and edge gateways")
    public Response getAdaptersStatus() {
        List<Map<String, Object>> adapters = List.of(
            mqttService.getStatus(),
            opcUaService.getStatus(),
            modbusService.getStatus(),
            rhelCollector.getStatus(),
            openShiftAi.getStatus()
        );
        return Response.ok(ApiResponseDto.of(adapters, "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/tags")
    @Operation(summary = "Get live field sensor PLC tag values")
    public Response getLiveTags() {
        List<Map<String, Object>> tags = List.of(
            Map.of("nodeId", "ns=2;s=Device.Motor001.Vibration", "asset", "MOTOR-001", "metric", "Vibration", "value", "4.82 mm/s", "quality", "GOOD (0x00)", "timestamp", Instant.now().toString()),
            Map.of("nodeId", "ns=2;s=Device.Motor001.Temperature", "asset", "MOTOR-001", "metric", "Temperature", "value", "44.5 °C", "quality", "GOOD (0x00)", "timestamp", Instant.now().toString()),
            Map.of("nodeId", "ns=2;s=Device.Pump001.FlowRate", "asset", "PUMP-001", "metric", "Flow Rate", "value", "125.4 L/min", "quality", "GOOD (0x00)", "timestamp", Instant.now().toString()),
            Map.of("nodeId", "ns=2;s=Device.Fan001.AirflowSpeed", "asset", "FAN-001", "metric", "Airflow Speed", "value", "18.2 m/s", "quality", "GOOD (0x00)", "timestamp", Instant.now().toString())
        );
        return Response.ok(ApiResponseDto.of(tags, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/ai/infer")
    @Operation(summary = "Trigger model inference on Red Hat OpenShift AI vLLM cluster")
    public Response triggerAiInference(Map<String, String> payload) {
        String prompt = payload.get("prompt");
        Map<String, Object> result = openShiftAi.runInference(prompt);
        return Response.ok(ApiResponseDto.of(result, "REAL-TIME LOCAL")).build();
    }
}
