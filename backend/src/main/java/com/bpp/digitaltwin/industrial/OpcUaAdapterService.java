package com.bpp.digitaltwin.industrial;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * OPC-UA Binary Gateway Adapter subscribing to PLC tag node identifiers.
 */
@ApplicationScoped
public class OpcUaAdapterService {

    public Map<String, Object> getStatus() {
        return Map.of(
            "id", "INT-OPCUA-02",
            "name", "OPC-UA Server Gateway",
            "protocol", "OPC-UA Binary",
            "endpoint", "opc.tcp://opc-server.factory:4840",
            "status", "CONNECTED",
            "subscribedNodes", List.of(
                "ns=2;s=Device.Motor001.Vibration",
                "ns=2;s=Device.Motor001.Temperature",
                "ns=2;s=Device.Pump001.FlowRate"
            ),
            "quality", "GOOD (0x00000000)",
            "lastSampledAt", Instant.now().toString()
        );
    }
}
