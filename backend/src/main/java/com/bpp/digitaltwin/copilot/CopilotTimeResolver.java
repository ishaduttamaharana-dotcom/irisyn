package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@ApplicationScoped
public class CopilotTimeResolver {

    public static class TimeRangeResult {
        public Instant startTime;
        public Instant endTime;
        public long durationMinutes;
        public String label;

        public TimeRangeResult(Instant startTime, Instant endTime, long durationMinutes, String label) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.durationMinutes = durationMinutes;
            this.label = label;
        }
    }

    public TimeRangeResult resolveTimeRange(String question) {
        Instant now = Instant.now();
        if (question == null) {
            return new TimeRangeResult(now.minus(5, ChronoUnit.MINUTES), now, 5, "Last 5 minutes (Live)");
        }

        String q = question.toLowerCase();

        if (q.contains("last 24 hours") || q.contains("24 hours") || q.contains("today") || q.contains("yesterday")) {
            return new TimeRangeResult(now.minus(24, ChronoUnit.HOURS), now, 1440, "Last 24 hours");
        }

        if (q.contains("last 6 hours") || q.contains("6 hours")) {
            return new TimeRangeResult(now.minus(6, ChronoUnit.HOURS), now, 360, "Last 6 hours");
        }

        if (q.contains("last hour") || q.contains("1 hour") || q.contains("past hour")) {
            return new TimeRangeResult(now.minus(1, ChronoUnit.HOURS), now, 60, "Last 1 hour");
        }

        if (q.contains("last 30 minutes") || q.contains("30 mins") || q.contains("30 minutes")) {
            return new TimeRangeResult(now.minus(30, ChronoUnit.MINUTES), now, 30, "Last 30 minutes");
        }

        // Default to live current sample
        return new TimeRangeResult(now.minus(2, ChronoUnit.MINUTES), now, 2, "Current (Live)");
    }
}
