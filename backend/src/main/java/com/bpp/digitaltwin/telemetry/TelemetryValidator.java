package com.bpp.digitaltwin.telemetry;

import com.bpp.digitaltwin.dto.DataQualityDto;
import com.bpp.digitaltwin.dto.TelemetryEventDto;
import com.bpp.digitaltwin.dto.TelemetryMetricsDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Validates incoming telemetry events: checks UTC ISO-8601 timestamps, numeric range bounds,
 * and monitors monotonically increasing sequence numbers per stream to detect gaps/drops.
 */
@ApplicationScoped
public class TelemetryValidator {

    private final Map<String, Long> lastSequenceMap = new ConcurrentHashMap<>();
    private final Map<String, Long> sequenceGapCountMap = new ConcurrentHashMap<>();

    public TelemetryEventDto validateAndEnrich(TelemetryEventDto event) {
        if (event == null) return null;

        List<String> rangeErrors = new ArrayList<>();
        List<String> missingFields = new ArrayList<>();
        boolean valid = true;

        // 1. Asset ID & Timestamp Validation
        if (event.assetId == null || event.assetId.isBlank()) {
            missingFields.add("assetId");
            valid = false;
        }

        if (event.timestamp == null || event.timestamp.isBlank()) {
            missingFields.add("timestamp");
            event.timestamp = Instant.now().toString();
            valid = false;
        } else {
            try {
                Instant.parse(event.timestamp);
            } catch (Exception e) {
                rangeErrors.add("Malformed UTC timestamp: " + event.timestamp);
                event.timestamp = Instant.now().toString();
                valid = false;
            }
        }

        // 2. Metric Range Bound Checks
        TelemetryMetricsDto m = event.metrics;
        if (m != null) {
            if (m.cpu < 0.0 || m.cpu > 100.0) {
                rangeErrors.add("CPU load out of bounds [0-100%]: " + m.cpu);
                m.cpu = Math.max(0.0, Math.min(100.0, m.cpu));
            }
            if (m.ram < 0.0 || m.ram > 100.0) {
                rangeErrors.add("RAM utilization out of bounds [0-100%]: " + m.ram);
                m.ram = Math.max(0.0, Math.min(100.0, m.ram));
            }
            if (m.disk < 0.0 || m.disk > 100.0) {
                rangeErrors.add("Disk utilization out of bounds [0-100%]: " + m.disk);
                m.disk = Math.max(0.0, Math.min(100.0, m.disk));
            }
            if (m.temperature < -20.0 || m.temperature > 150.0) {
                rangeErrors.add("Temperature out of normal range [-20 to 150°C]: " + m.temperature);
            }
        } else {
            missingFields.add("metrics");
            valid = false;
        }

        // 3. Monotonic Sequence Gap Tracking
        String streamId = event.assetId != null ? event.assetId : "GLOBAL";
        long seq = event.sequenceNumber;
        Long lastSeq = lastSequenceMap.get(streamId);

        if (lastSeq != null && seq > lastSeq + 1) {
            long gap = (seq - lastSeq - 1);
            sequenceGapCountMap.merge(streamId, gap, Long::sum);
            rangeErrors.add("Sequence gap detected: missing " + gap + " events between #" + lastSeq + " and #" + seq);
        }
        lastSequenceMap.put(streamId, seq);

        // 4. Data Quality Attribution
        if (event.quality == null) {
            event.quality = new DataQualityDto();
        }

        event.quality.valid = valid && rangeErrors.isEmpty();
        event.quality.status = event.quality.valid ? "GOOD" : "DEGRADED";
        event.quality.completenessPct = Math.max(0.0, 100.0 - (missingFields.size() * 20.0) - (rangeErrors.size() * 10.0));

        return event;
    }

    public long getSequenceGapCount(String assetId) {
        return sequenceGapCountMap.getOrDefault(assetId, 0L);
    }
}
