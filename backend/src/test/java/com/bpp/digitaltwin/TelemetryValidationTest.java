package com.bpp.digitaltwin;

import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.dto.TelemetryMetricsDto;
import com.bpp.digitaltwin.telemetry.FreshnessService;
import com.bpp.digitaltwin.telemetry.TelemetryValidator;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class TelemetryValidationTest {

    @Inject
    TelemetryValidator validator;

    @Inject
    FreshnessService freshnessService;

    @Test
    public void testValidTelemetryValidation() {
        TelemetryEventDto event = new TelemetryEventDto();
        event.assetId = "LAPTOP-001";
        event.timestamp = Instant.now().toString();
        event.source = "REAL-TIME LOCAL";
        event.sequenceNumber = 100L;

        TelemetryMetricsDto m = new TelemetryMetricsDto();
        m.cpu = 45.2;
        m.ram = 62.1;
        m.disk = 54.0;
        m.temperature = 48.5;
        event.metrics = m;

        TelemetryEventDto validated = validator.validateAndEnrich(event);

        assertNotNull(validated);
        assertTrue(validated.quality.valid);
        assertEquals("GOOD", validated.quality.status);
    }

    @Test
    public void testSequenceGapDetection() {
        TelemetryEventDto e1 = new TelemetryEventDto();
        e1.assetId = "TEST-ASSET-01";
        e1.timestamp = Instant.now().toString();
        e1.sequenceNumber = 1000L;
        e1.metrics = new TelemetryMetricsDto();
        validator.validateAndEnrich(e1);

        TelemetryEventDto e2 = new TelemetryEventDto();
        e2.assetId = "TEST-ASSET-01";
        e2.timestamp = Instant.now().toString();
        e2.sequenceNumber = 1005L; // Gap of 4 missing events
        e2.metrics = new TelemetryMetricsDto();
        validator.validateAndEnrich(e2);

        assertTrue(validator.getSequenceGapCount("TEST-ASSET-01") > 0);
    }

    @Test
    public void testOutofBoundsCpuCorrection() {
        TelemetryEventDto event = new TelemetryEventDto();
        event.assetId = "LAPTOP-001";
        event.timestamp = Instant.now().toString();
        event.sequenceNumber = 200L;

        TelemetryMetricsDto m = new TelemetryMetricsDto();
        m.cpu = 145.0; // Out of bounds > 100%
        m.ram = 50.0;
        m.disk = 50.0;
        m.temperature = 50.0;
        event.metrics = m;

        TelemetryEventDto validated = validator.validateAndEnrich(event);

        assertEquals(100.0, validated.metrics.cpu);
        assertFalse(validated.quality.valid);
        assertEquals("DEGRADED", validated.quality.status);
    }

    @Test
    public void testFreshnessSlaCalculation() {
        Instant now = Instant.now();
        assertEquals("LIVE", freshnessService.calculateFreshnessStatus(now));
        assertEquals("RECENT", freshnessService.calculateFreshnessStatus(now.minusSeconds(10)));
        assertEquals("STALE", freshnessService.calculateFreshnessStatus(now.minusSeconds(30)));
        assertEquals("OFFLINE", freshnessService.calculateFreshnessStatus(now.minusSeconds(120)));
    }
}
