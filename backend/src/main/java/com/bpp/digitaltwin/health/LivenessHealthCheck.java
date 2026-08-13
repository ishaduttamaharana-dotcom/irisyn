package com.bpp.digitaltwin.health;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;
import jakarta.enterprise.context.ApplicationScoped;

@Liveness
@ApplicationScoped
public class LivenessHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.named("JVM Runtime Liveness Probe")
            .up()
            .withData("uptimeMs", System.currentTimeMillis())
            .withData("status", "ALIVE")
            .build();
    }
}
