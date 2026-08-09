package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.DataQualityDto;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.*;

@ApplicationScoped
public class CopilotResultValidator {

    public static class ValidationResult {
        public String status; // LIVE, STALE, OFFLINE
        public long freshnessMs;
        public double freshnessSeconds;
        public boolean valid;
        public String statusMessage;
        public List<String> dataUsedTrace;

        public ValidationResult() {
            this.dataUsedTrace = new ArrayList<>();
        }
    }

    public ValidationResult validate(DataQualityDto quality, String assetId, String metric, int samples) {
        ValidationResult res = new ValidationResult();
        long freshness = quality != null ? quality.freshnessMs : 0;
        res.freshnessMs = freshness;
        res.freshnessSeconds = Math.round((freshness / 1000.0) * 10.0) / 10.0;

        if (freshness < 3000) {
            res.status = "LIVE";
            res.valid = true;
            res.statusMessage = "LIVE ● Updated " + res.freshnessSeconds + "s ago";
        } else if (freshness < 30000) {
            res.status = "STALE";
            res.valid = true;
            res.statusMessage = "STALE ● Last updated " + res.freshnessSeconds + "s ago";
        } else {
            res.status = "OFFLINE";
            res.valid = false;
            res.statusMessage = "OFFLINE ● Telemetry transport interrupted";
        }

        // Add operational data access trace entries
        res.dataUsedTrace.add("✓ Asset Resolved: " + (assetId != null ? assetId : "FLEET"));
        res.dataUsedTrace.add("✓ Metric Resolved: " + (metric != null ? metric : "COMPOSITE"));
        res.dataUsedTrace.add("✓ Samples Evaluated: " + samples);
        res.dataUsedTrace.add("✓ Freshness: " + res.statusMessage);

        return res;
    }
}
