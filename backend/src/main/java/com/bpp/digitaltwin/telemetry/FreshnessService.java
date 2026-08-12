package com.bpp.digitaltwin.telemetry;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;

/**
 * Shared Platform Freshness Service classifying telemetry state into 4 standard SLA tiers:
 * LIVE (0-5s), RECENT (5-15s), STALE (15-60s), OFFLINE (>60s).
 */
@ApplicationScoped
public class FreshnessService {

    public String calculateFreshnessStatus(Instant lastUpdatedTimestamp) {
        if (lastUpdatedTimestamp == null) {
            return "OFFLINE";
        }

        long ageSeconds = Instant.now().getEpochSecond() - lastUpdatedTimestamp.getEpochSecond();
        if (ageSeconds < 0) ageSeconds = 0;

        if (ageSeconds <= 5) {
            return "LIVE";
        } else if (ageSeconds <= 15) {
            return "RECENT";
        } else if (ageSeconds <= 60) {
            return "STALE";
        } else {
            return "OFFLINE";
        }
    }

    public long calculateFreshnessMs(Instant lastUpdatedTimestamp) {
        if (lastUpdatedTimestamp == null) return 999999L;
        long ms = Instant.now().toEpochMilli() - lastUpdatedTimestamp.toEpochMilli();
        return Math.max(0L, ms);
    }
}
