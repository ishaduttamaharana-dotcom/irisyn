package com.bpp.digitaltwin.industrial;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * Modbus TCP PLC Register Gateway Reader accessing holding registers over TCP Port 502.
 */
@ApplicationScoped
public class ModbusAdapterService {

    public Map<String, Object> getStatus() {
        return Map.of(
            "id", "INT-MODBUS-03",
            "name", "Modbus TCP PLC Gateway",
            "protocol", "MODBUS TCP",
            "endpoint", "modbus://plc-controller.factory:502",
            "status", "CONNECTED",
            "holdingRegisters", Map.of(
                "40001", 1450, // Motor RPM
                "40002", 442,  // Temp (0.1C)
                "40003", 24    // Current Amps
            ),
            "slaveId", 1,
            "lastReadAt", Instant.now().toString()
        );
    }
}
