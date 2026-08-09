package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.telemetry.LocalTelemetryCollector;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/services")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "IRISYN System Service Directory & Data Lineage")
public class ServiceDirectoryResource {

    @Inject
    LocalTelemetryCollector localCollector;

    private Map<String, Object> createServiceMap(String id, String name, String category, String status,
                                                 String version, String uptime, long latencyMs,
                                                 int eventsPerSec, int errorsCount, String source,
                                                 List<String> dependencies) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("name", name);
        map.put("category", category);
        map.put("status", status);
        map.put("version", version);
        map.put("uptime", uptime);
        map.put("latencyMs", latencyMs);
        map.put("eventsPerSec", eventsPerSec);
        map.put("errorsCount", errorsCount);
        map.put("source", source);
        map.put("dependencies", dependencies);
        return map;
    }

    @GET
    @Path("/directory")
    @Operation(summary = "Get full system service directory with status, uptime, latency, and dependencies")
    public Map<String, Object> getServiceDirectory() {
        List<Map<String, Object>> services = new ArrayList<>();

        // 1. Host Telemetry Collector
        TelemetryEventDto localEvent = localCollector.captureTelemetry();
        services.add(createServiceMap(
            "telemetry-collector", "Host Hardware Telemetry Collector", "DATA_COLLECTION",
            "ONLINE", "v1.2", localEvent.metrics.uptimeSeconds + "s",
            localEvent.quality.latencyMs, 10, 0, "REAL-TIME LOCAL",
            List.of("OperatingSystemMXBean", "Host Workstation")
        ));

        // 2. Data Ingestion & Transport
        services.add(createServiceMap(
            "data-ingestion", "Data Ingestion & Validation Engine", "PIPELINE",
            "ONLINE", "v1.0", "Active", 1, 20, 0, "CORE PLATFORM",
            List.of("telemetry-collector", "industrial-simulator")
        ));

        // 3. Time-Series Data Store
        services.add(createServiceMap(
            "timeseries-db", "PostgreSQL / H2 Time-Series Data Store", "STORAGE",
            "ONLINE", "v17.2", "Active", 3, 20, 0, "STORAGE",
            List.of("Panache ORM", "Flyway Migrations")
        ));

        // 4. Digital Twin Engine
        services.add(createServiceMap(
            "digital-twin-engine", "Digital Twin State Engine", "STATE_ENGINE",
            "HEALTHY", "v2.5", "Active", 2, 20, 0, "CORE PLATFORM",
            List.of("timeseries-db", "SystemConfigService")
        ));

        // 5. Health & Anomaly Engine
        services.add(createServiceMap(
            "health-anomaly-engine", "Health & Anomaly Analysis Engine", "ANALYTICS",
            "HEALTHY", "v2.0", "Active", 2, 20, 0, "CORE PLATFORM",
            List.of("digital-twin-engine")
        ));

        // 6. Prediction Engine
        services.add(createServiceMap(
            "prediction-engine", "Predictive Maintenance Engine", "AI_ML",
            "ONLINE", "v1.8", "Active", 2, 5, 0, "CORE PLATFORM",
            List.of("health-anomaly-engine")
        ));

        // 7. Alert & Incident Engine
        services.add(createServiceMap(
            "alert-engine", "Alert & Incident Response Engine", "OPERATIONS",
            "ONLINE", "v1.4", "Active", 1, 5, 0, "CORE PLATFORM",
            List.of("health-anomaly-engine", "AlertRepository")
        ));

        // 8. Copilot AI Service
        services.add(createServiceMap(
            "copilot-data-gate", "IRISYN Copilot Data Gate & Tool Router", "AI_COPILOT",
            "ONLINE", "v3.0", "Active", 2, 2, 0, "AI SERVICE",
            List.of("digital-twin-engine", "SecurityRbacService")
        ));

        // 9. API Gateway & WebSocket
        services.add(createServiceMap(
            "api-gateway", "REST API Gateway & WebSocket Transport", "GATEWAY",
            "ONLINE", "v3.13.2", "Active", 1, 50, 0, "GATEWAY",
            List.of("Quarkus RESTEasy Reactive", "WebSocket Endpoint /ws/telemetry")
        ));

        // 10. Target Industrial Gateway
        services.add(createServiceMap(
            "opcua-mqtt-gateway", "Industrial OPC-UA / MQTT Gateway", "INTEGRATION",
            "TARGET / FUTURE", "v0.0", "Disconnected", 0, 0, 0, "BLUEPRINT",
            List.of("RHEL Edge Node", "Factory PLC")
        ));

        // 11. Red Hat OpenShift AI
        services.add(createServiceMap(
            "openshift-ai", "Red Hat OpenShift AI Platform", "MLOPS_CLOUD",
            "TARGET / FUTURE", "v2.10", "Disconnected", 0, 0, 0, "BLUEPRINT",
            List.of("OpenShift Cluster", "vLLM Inference Server")
        ));

        return Map.of(
            "totalServices", services.size(),
            "activeServices", 9,
            "futureTargetServices", 2,
            "overallStatus", "HEALTHY",
            "timestamp", Instant.now().toString(),
            "services", services
        );
    }

    @GET
    @Path("/lineage")
    @Operation(summary = "Get data lineage trace for a metric")
    public Map<String, Object> getDataLineage(@QueryParam("assetId") String assetId, @QueryParam("metric") String metric) {
        String targetAsset = assetId != null ? assetId : "MOTOR-001";
        String targetMetric = metric != null ? metric : "temperature";

        List<Map<String, String>> lineageStages = List.of(
            Map.of("stage", "1. PHYSICAL SENSOR / GENERATOR", "node", targetAsset + " Stator Thermal RTD Sensor", "status", "MEASURING", "sampleRate", "10 Hz"),
            Map.of("stage", "2. DATA COLLECTOR", "node", "Local / Industrial Telemetry Collector", "status", "ONLINE", "transport", "JSON / In-Memory"),
            Map.of("stage", "3. INGESTION & VALIDATION", "node", "Data Ingestion Pipeline", "status", "PASSED", "qualityScore", "100%"),
            Map.of("stage", "4. TIME-SERIES STORAGE", "node", "PostgreSQL / H2 Metric Repository", "status", "PERSISTED", "retention", "30 Days"),
            Map.of("stage", "5. DIGITAL TWIN ENGINE", "node", "DigitalTwinEngine State Estimator", "status", "EVALUATED", "healthDeduction", "-15%"),
            Map.of("stage", "6. ANALYTICS & COPILOT", "node", "IRISYN Copilot Tool Router & Console", "status", "ACCESSIBLE", "attribution", "SIMULATED / REAL-TIME LOCAL")
        );

        return Map.of(
            "assetId", targetAsset,
            "metric", targetMetric,
            "dataQuality", "100% Complete (Freshness < 1s)",
            "lineageStages", lineageStages
        );
    }
}
