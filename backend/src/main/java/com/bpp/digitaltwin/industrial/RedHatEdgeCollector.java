package com.bpp.digitaltwin.industrial;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * Red Hat Enterprise Linux (RHEL 9.3) Edge Node Systemd Collector Service.
 */
@ApplicationScoped
public class RedHatEdgeCollector {

    public Map<String, Object> getStatus() {
        return Map.of(
            "id", "INT-RHEL-04",
            "name", "Red Hat Enterprise Linux Edge Node",
            "protocol", "RHEL 9.3 Systemd Collector",
            "endpoint", "https://api.openshift-edge.internal:6443",
            "status", "CONNECTED",
            "osVersion", "Red Hat Enterprise Linux 9.3 (Plow)",
            "systemdStatus", "ACTIVE_RUNNING",
            "cpuCores", 16,
            "memoryGb", 32,
            "lastCheckAt", Instant.now().toString()
        );
    }
}
