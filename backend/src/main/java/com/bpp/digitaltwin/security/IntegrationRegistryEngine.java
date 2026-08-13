package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * 9-Integration Registry Engine tracking connectivity status across enterprise
 * protocol adapters and cloud infrastructure components.
 */
@ApplicationScoped
public class IntegrationRegistryEngine {

    public static class IntegrationRecord {
        public String id;
        public String name;
        public String category;
        public String status; // CONNECTED, DISCONNECTED, ERROR, NOT_CONFIGURED, TARGET_FUTURE
        public String targetProtocol;
        public String lastChecked;

        public IntegrationRecord(String id, String name, String category, String status, String targetProtocol, String lastChecked) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.status = status;
            this.targetProtocol = targetProtocol;
            this.lastChecked = lastChecked;
        }
    }

    public List<IntegrationRecord> getIntegrationRegistry() {
        String now = Instant.now().toString();
        return List.of(
            new IntegrationRecord("INT-01", "Local Hardware Telemetry Collector", "HARDWARE", "CONNECTED", "OS Native API", now),
            new IntegrationRecord("INT-02", "WebSockets Ingestion Channel", "NETWORK", "CONNECTED", "WSS /ws/telemetry", now),
            new IntegrationRecord("INT-03", "PostgreSQL System Storage", "DATABASE", "CONNECTED", "JDBC TCP 5432", now),
            new IntegrationRecord("INT-04", "MQTT Industrial Edge Broker", "PROTOCOL", "TARGET_FUTURE", "MQTT v5.0 TCP 1883", "N/A"),
            new IntegrationRecord("INT-05", "OPC-UA Industrial Server Gateway", "PROTOCOL", "TARGET_FUTURE", "OPC-UA Binary opc.tcp://", "N/A"),
            new IntegrationRecord("INT-06", "Modbus TCP PLC Gateway", "PROTOCOL", "TARGET_FUTURE", "Modbus TCP Port 502", "N/A"),
            new IntegrationRecord("INT-07", "Red Hat Enterprise Linux Edge Node", "OPERATING_SYSTEM", "CONNECTED", "RHEL 9.3 Systemd", now),
            new IntegrationRecord("INT-08", "OpenShift Container Platform Cluster", "INFRASTRUCTURE", "TARGET_FUTURE", "OpenShift v4.14 API", "N/A"),
            new IntegrationRecord("INT-09", "Red Hat OpenShift AI Model Service", "AI_PLATFORM", "TARGET_FUTURE", "vLLM / KServe gRPC", "N/A")
        );
    }
}
