package com.bpp.digitaltwin;

import com.bpp.digitaltwin.deployment.BackupEngine;
import com.bpp.digitaltwin.health.LivenessHealthCheck;
import com.bpp.digitaltwin.health.ReadinessHealthCheck;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class DeploymentReliabilityTest {

    @Inject
    BackupEngine backupEngine;

    @Inject
    LivenessHealthCheck livenessProbe;

    @Inject
    ReadinessHealthCheck readinessProbe;

    @Test
    public void testLivenessProbe() {
        HealthCheckResponse res = livenessProbe.call();
        assertNotNull(res);
        assertEquals("JVM Runtime Liveness Probe", res.getName());
        assertEquals(HealthCheckResponse.Status.UP, res.getStatus());
    }

    @Test
    public void testReadinessProbe() {
        HealthCheckResponse res = readinessProbe.call();
        assertNotNull(res);
        assertEquals("Digital Twin Engine Readiness Probe", res.getName());
    }

    @Test
    public void testBackupCreationAndRollback() {
        BackupEngine.BackupSnapshot snap = backupEngine.createSnapshot("Test Automated Backup", "TEST_RUNNER");
        assertNotNull(snap.snapshotId);
        assertEquals("VERIFIED", snap.status);

        Map<String, Object> rollbackRes = backupEngine.executeRollback(snap.snapshotId);
        assertNotNull(rollbackRes);
        assertEquals("RESTORED", rollbackRes.get("status"));
        assertEquals("PASS", rollbackRes.get("verificationResult"));
    }
}
