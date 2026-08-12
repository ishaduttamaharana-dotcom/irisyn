package com.bpp.digitaltwin.telemetry;

import com.bpp.digitaltwin.dto.TelemetryEventDto;

/**
 * Source-agnostic collector interface for physical host hardware, synthetic simulation,
 * and future industrial edge adapters (PLC, MQTT, OPC-UA, Modbus).
 */
public interface TelemetryCollector {
    TelemetryEventDto captureTelemetry();
}
