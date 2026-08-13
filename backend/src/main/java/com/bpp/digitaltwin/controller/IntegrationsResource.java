package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@Path("/api/integrations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "External API & Enterprise Protocol Integration Registry")
public class IntegrationsResource {

    @GET
    @Operation(summary = "List all external enterprise APIs and industrial protocol integrations")
    public Response getIntegrations() {
        List<Map<String, Object>> integrations = List.of(
            Map.of(
                "id", "INT-01",
                "name", "Host Hardware Telemetry API",
                "protocol", "REST",
                "sourceCategory", "REAL-TIME LOCAL",
                "status", "CONNECTED",
                "endpoint", "local://system-hardware",
                "latencyMs", 15,
                "description", "Direct telemetry extraction from developer's local laptop/host computer."
            ),
            Map.of(
                "id", "INT-02",
                "name", "Synthetic Industrial Simulator API",
                "protocol", "REST",
                "sourceCategory", "SIMULATED",
                "status", "CONNECTED",
                "endpoint", "sim://industrial-motor-001",
                "latencyMs", 5,
                "description", "Physics-driven synthetic telemetry generator for MOTOR-001 & PUMP-001."
            ),
            Map.of(
                "id", "INT-03",
                "name", "Enterprise OIDC / SSO Identity Provider API",
                "protocol", "OIDC / OAuth2",
                "sourceCategory", "SECURITY",
                "status", "CONNECTED",
                "endpoint", "https://sso.enterprise.internal/auth/realms/irisyn",
                "latencyMs", 12,
                "description", "OpenID Connect / Single Sign-On identity provider (Keycloak / Okta / Azure AD)."
            ),
            Map.of(
                "id", "INT-04",
                "name", "OpenAI / OpenShift AI Model Inference API",
                "protocol", "REST / gRPC",
                "sourceCategory", "AI_PLATFORM",
                "status", "CONNECTED",
                "endpoint", "https://api.openai.com/v1 / KServe vLLM",
                "latencyMs", 45,
                "description", "Remote LLM inference endpoint for OpenAI GPT-4o / Red Hat OpenShift AI models."
            ),
            Map.of(
                "id", "INT-05",
                "name", "HashiCorp Vault / Secrets Manager API",
                "protocol", "REST HTTPS",
                "sourceCategory", "SECURITY",
                "status", "CONNECTED",
                "endpoint", "https://vault.enterprise.internal:8200/v1/secret",
                "latencyMs", 8,
                "description", "Centralized enterprise secret management for DB credentials & signing keys."
            ),
            Map.of(
                "id", "INT-06",
                "name", "Industrial MQTT Broker API",
                "protocol", "MQTT v5.0",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "tcp://edge-broker.industrial.internal:1883",
                "latencyMs", 0,
                "description", "Edge MQTT transport connector for field sensors."
            ),
            Map.of(
                "id", "INT-07",
                "name", "OPC-UA Server Gateway API",
                "protocol", "OPC-UA Binary",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "opc.tcp://opc-server.factory:4840",
                "latencyMs", 0,
                "description", "OPC-UA industrial protocol adapter for PLC tag extraction."
            ),
            Map.of(
                "id", "INT-08",
                "name", "Modbus TCP Gateway API",
                "protocol", "MODBUS TCP",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "modbus://plc-controller.factory:502",
                "latencyMs", 0,
                "description", "Modbus PLC register reader for SCADA synchronization."
            ),
            Map.of(
                "id", "INT-09",
                "name", "Red Hat OpenShift Container Platform API",
                "protocol", "KUBERNETES REST",
                "sourceCategory", "TARGET / FUTURE",
                "status", "TARGET_FUTURE",
                "endpoint", "https://api.openshift-cluster.internal:6443",
                "latencyMs", 0,
                "description", "Target Red Hat OpenShift & OpenShift AI cluster orchestration endpoint."
            )
        );
        return Response.ok(ApiResponseDto.of(integrations, "REAL-TIME LOCAL")).build();
    }
}
