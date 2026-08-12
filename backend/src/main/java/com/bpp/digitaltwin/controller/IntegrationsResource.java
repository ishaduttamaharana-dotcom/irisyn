package com.bpp.digitaltwin.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/integrations")
@Produces(MediaType.APPLICATION_JSON)
public class IntegrationsResource {

    @GET
    public Response getIntegrations() {
        List<Map<String, Object>> integrations = List.of(
            Map.of(
                "id", "INT-01",
                "name", "Host Hardware Telemetry",
                "protocol", "REST",
                "sourceCategory", "REAL-TIME LOCAL",
                "status", "CONNECTED",
                "endpoint", "local://system-hardware",
                "latencyMs", 15,
                "description", "Direct telemetry extraction from developer's local laptop/host computer."
            ),
            Map.of(
                "id", "INT-02",
                "name", "Synthetic Industrial Simulator",
                "protocol", "REST",
                "sourceCategory", "SIMULATED",
                "status", "CONNECTED",
                "endpoint", "sim://industrial-motor-001",
                "latencyMs", 5,
                "description", "Physics-driven synthetic telemetry generator for MOTOR-001 & PUMP-001."
            ),
            Map.of(
                "id", "INT-03",
                "name", "Industrial MQTT Broker",
                "protocol", "MQTT",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "tcp://edge-broker.industrial.internal:1883",
                "latencyMs", 0,
                "description", "Planned edge MQTT transport connector for field sensors."
            ),
            Map.of(
                "id", "INT-04",
                "name", "OPC-UA Server Gateway",
                "protocol", "OPC-UA",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "opc.tcp://opc-server.factory:4840",
                "latencyMs", 0,
                "description", "Planned OPC-UA industrial protocol adapter."
            ),
            Map.of(
                "id", "INT-05",
                "name", "Modbus TCP Gateway",
                "protocol", "MODBUS",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "modbus://plc-controller.factory:502",
                "latencyMs", 0,
                "description", "Planned Modbus PLC register reader."
            ),
            Map.of(
                "id", "INT-06",
                "name", "Red Hat OpenShift Edge Platform",
                "protocol", "REDHAT_EDGE",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "https://api.openshift-edge.internal:6443",
                "latencyMs", 0,
                "description", "Target Red Hat OpenShift & OpenShift AI cluster deployment."
            )
        );
        return Response.ok(integrations).build();
    }
}
