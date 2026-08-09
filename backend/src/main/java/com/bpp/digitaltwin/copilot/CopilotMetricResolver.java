package com.bpp.digitaltwin.copilot;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.*;

@ApplicationScoped
public class CopilotMetricResolver {

    public String resolveMetric(String question, String assetType) {
        if (question == null) return "all";
        String q = question.toLowerCase();

        if (q.contains("temp") || q.contains("thermal") || q.contains("heat") || q.contains("hot")) {
            return "temperature";
        }

        if (q.contains("vibration") || q.contains("shake") || q.contains("rms")) {
            return "vibration";
        }

        if (q.contains("cpu") || q.contains("processor") || q.contains("load")) {
            return "cpu";
        }

        if (q.contains("ram") || q.contains("memory")) {
            return "ram";
        }

        if (q.contains("rpm") || q.contains("speed")) {
            return "rpm";
        }

        if (q.contains("current") || q.contains("amp") || q.contains("amps")) {
            return "current";
        }

        if (q.contains("voltage") || q.contains("volt") || q.contains("volts")) {
            return "voltage";
        }

        if (q.contains("disk") || q.contains("storage") || q.contains("drive")) {
            return "disk";
        }

        return "all";
    }
}
