package com.bpp.digitaltwin.health;

import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

@Readiness
@ApplicationScoped
public class ReadinessHealthCheck implements HealthCheck {

    @Inject
    DigitalTwinEngine twinEngine;

    @Override
    public HealthCheckResponse call() {
        boolean engineReady = twinEngine != null && twinEngine.getAllAssets("ALL").size() > 0;

        return HealthCheckResponse.named("Digital Twin Engine Readiness Probe")
            .status(engineReady)
            .withData("connectedAssets", twinEngine != null ? twinEngine.getAllAssets("ALL").size() : 0)
            .withData("dataFreshnessSLA", "LIVE")
            .build();
    }
}
