package com.bpp.digitaltwin.copilot.resolver;

import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * Resolves natural language time expressions ("now", "last 6 hours", "last 24 hours", "today")
 * into exact ISO startTime and endTime timestamps.
 */
@ApplicationScoped
public class TimeRangeResolver {

    public Map<String, String> resolveTimeRange(String prompt) {
        Instant now = Instant.now();
        Instant startTime = now.minus(6, ChronoUnit.HOURS);

        if (prompt != null) {
            String promptLower = prompt.toLowerCase();
            if (promptLower.contains("last hour") || promptLower.contains("past hour")) {
                startTime = now.minus(1, ChronoUnit.HOURS);
            } else if (promptLower.contains("last 24 hours") || promptLower.contains("today")) {
                startTime = now.minus(24, ChronoUnit.HOURS);
            } else if (promptLower.contains("last 7 days") || promptLower.contains("this week")) {
                startTime = now.minus(7, ChronoUnit.DAYS);
            }
        }

        return Map.of(
            "startTime", startTime.toString(),
            "endTime", now.toString(),
            "label", "Last 6 hours"
        );
    }
}
