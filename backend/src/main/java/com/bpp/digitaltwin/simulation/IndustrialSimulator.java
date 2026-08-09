package com.bpp.digitaltwin.simulation;

import com.bpp.digitaltwin.dto.DataQualityDto;
import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.dto.TelemetryMetricsDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simulates synthetic industrial assets (MOTOR-001, PUMP-001) with correlated physical parameters and fault injection scenarios.
 */
@ApplicationScoped
public class IndustrialSimulator {

    private boolean paused = false;
    private int speedMultiplier = 1; // 1x, 5x, 10x, 50x
    private String activeScenario = "NORMAL"; // NORMAL, THERMAL_STRESS, BEARING_DEGRADATION, OVERLOAD, COOLING_FAILURE, ELECTRICAL_ABNORMALITY
    private String operatingMode = "NORMAL"; // IDLE, NORMAL, HIGH_LOAD, OVERLOAD, DEGRADATION, FAULT

    private double motorOperatingHours = 4120.5;
    private double pumpOperatingHours = 2890.0;
    
    // Degradation drift accumulators
    private double bearingWearFactor = 0.0;
    private double thermalAccumulator = 0.0;

    public synchronized void setPaused(boolean paused) {
        this.paused = paused;
    }

    public synchronized boolean isPaused() {
        return paused;
    }

    public synchronized void setSpeedMultiplier(int speed) {
        this.speedMultiplier = Math.max(1, Math.min(50, speed));
    }

    public synchronized int getSpeedMultiplier() {
        return speedMultiplier;
    }

    public synchronized void setScenario(String scenario) {
        this.activeScenario = scenario;
        if ("NORMAL".equals(scenario)) {
            this.bearingWearFactor = 0.0;
            this.thermalAccumulator = 0.0;
            this.operatingMode = "NORMAL";
        } else if ("BEARING_DEGRADATION".equals(scenario)) {
            this.operatingMode = "DEGRADATION";
        } else if ("OVERLOAD".equals(scenario) || "THERMAL_STRESS".equals(scenario) || "COOLING_FAILURE".equals(scenario)) {
            this.operatingMode = "HIGH_LOAD";
        } else if ("ELECTRICAL_ABNORMALITY".equals(scenario)) {
            this.operatingMode = "FAULT";
        }
    }

    public synchronized String getActiveScenario() {
        return activeScenario;
    }

    public synchronized String getOperatingMode() {
        return operatingMode;
    }

    public synchronized TelemetryEventDto generateMotorTelemetry() {
        TelemetryEventDto event = new TelemetryEventDto();
        event.assetId = "MOTOR-001";
        event.assetName = "3-Phase Induction Motor (150kW)";
        event.assetType = "INDUSTRIAL_MOTOR";
        event.source = "SIMULATED";
        event.timestamp = Instant.now().toString();
        event.operatingSystem = "Embedded PLC / Modbus TCP";
        event.cpuModel = "Siemens S7-1500 Controller";
        event.coreCount = 4;

        if (!paused) {
            motorOperatingHours += (0.00027 * speedMultiplier);
        }

        double baseLoad = 65.0; // % base load
        double baseRpm = 1780.0; // rated 1800 RPM
        double baseTemp = 48.0; // °C
        double baseCurrent = 28.5; // Amps
        double baseVibration = 1.2; // mm/s RMS
        double baseVoltage = 415.0; // Volts 3-phase

        // Apply Scenario Factors
        if ("OVERLOAD".equals(activeScenario)) {
            baseLoad = 94.0;
            baseCurrent = 42.0;
            baseTemp = 74.0;
            baseRpm = 1720.0;
            baseVibration = 3.8;
            operatingMode = "OVERLOAD";
        } else if ("BEARING_DEGRADATION".equals(activeScenario)) {
            bearingWearFactor += 0.05 * speedMultiplier;
            baseVibration = 2.5 + Math.min(12.0, bearingWearFactor * 0.8);
            baseTemp = 58.0 + Math.min(25.0, bearingWearFactor * 0.6);
            baseCurrent = 33.0 + Math.min(8.0, bearingWearFactor * 0.2);
            operatingMode = bearingWearFactor > 5.0 ? "FAULT" : "DEGRADATION";
        } else if ("COOLING_FAILURE".equals(activeScenario)) {
            thermalAccumulator += 0.8 * speedMultiplier;
            baseTemp = 55.0 + Math.min(42.0, thermalAccumulator);
            baseVibration = 2.2 + (thermalAccumulator * 0.05);
            operatingMode = baseTemp > 85.0 ? "CRITICAL" : "HIGH_LOAD";
        } else if ("ELECTRICAL_ABNORMALITY".equals(activeScenario)) {
            baseVoltage = 370.0; // Under-voltage
            baseCurrent = 38.0; // Current imbalance
            baseTemp = 68.0;
            baseVibration = 4.1;
            operatingMode = "FAULT";
        }

        double noise = (Math.random() - 0.5);

        TelemetryMetricsDto m = new TelemetryMetricsDto();
        m.cpu = Math.round(baseLoad + noise * 2.0); // mapped to load %
        m.ram = Math.round(85.0 - (baseTemp * 0.2)); // mapped to efficiency %
        m.temperature = Math.round((baseTemp + noise * 0.8) * 10.0) / 10.0;
        m.disk = Math.round((baseVibration + noise * 0.1) * 10.0) / 10.0; // mapped to vibration mm/s
        m.networkInKbps = Math.round((baseCurrent + noise * 0.3) * 10.0) / 10.0; // mapped to current (A)
        m.networkOutKbps = Math.round((baseVoltage + noise * 1.5) * 10.0) / 10.0; // mapped to voltage (V)
        m.processCount = (int) Math.round(baseRpm + noise * 5.0); // mapped to RPM
        m.threadCount = (int) Math.round((baseCurrent * baseVoltage * 1.732 * 0.88) / 1000.0); // Power (kW)
        m.uptimeSeconds = (long) (motorOperatingHours * 3600);
        m.loadAverage = Math.round((baseLoad / 100.0) * 100.0) / 100.0;

        event.metrics = m;
        event.quality = new DataQualityDto(true, 0, 99.8, "GOOD");

        return event;
    }
}
