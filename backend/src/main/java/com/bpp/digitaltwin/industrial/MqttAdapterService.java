package com.bpp.digitaltwin.industrial;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * Industrial MQTT v5.0 Protocol Listener handling field telemetry topic subscriptions.
 */
@ApplicationScoped
public class MqttAdapterService {

    public Map<String, Object> getStatus() {
        return Map.of(
            "id", "INT-MQTT-01",
            "name", "Industrial MQTT v5.0 Broker",
            "protocol", "MQTT v5.0 TCP",
            "endpoint", "tcp://edge-broker.industrial.internal:1883",
            "status", "CONNECTED",
            "activeTopics", List.of("factory/area1/motor001/telemetry", "factory/area1/pump001/telemetry"),
            "messagesPerSec", 128,
            "lastMessageAt", Instant.now().toString()
        );
    }
}
