package com.bpp.digitaltwin;

import com.bpp.digitaltwin.copilot.CopilotToolRegistry;
import com.bpp.digitaltwin.copilot.diagnostic.DiagnosticProfile;
import com.bpp.digitaltwin.copilot.diagnostic.FixVerificationEngine;
import com.bpp.digitaltwin.copilot.diagnostic.RootCauseEngine;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class EngineeringDiagnosticTest {

    @Inject
    RootCauseEngine rootCauseEngine;

    @Inject
    FixVerificationEngine fixVerificationEngine;

    @Inject
    CopilotToolRegistry toolRegistry;

    @Test
    public void testDiagnosticProfileForServer() {
        DiagnosticProfile profile = DiagnosticProfile.getProfileForAsset("dc-node-03", "SERVER");

        assertEquals("SERVER", profile.assetType);
        assertTrue(profile.primaryMetrics.contains("cpu_utilization"));
        assertTrue(profile.failureModes.contains("Resource Saturation"));
    }

    @Test
    public void testDiagnosticProfileForMotor() {
        DiagnosticProfile profile = DiagnosticProfile.getProfileForAsset("MOTOR-001", "MOTOR");

        assertEquals("MOTOR", profile.assetType);
        assertTrue(profile.primaryMetrics.contains("temperature"));
        assertTrue(profile.failureModes.contains("Bearing Degradation"));
    }

    @Test
    public void testRootCauseAnalysisScoring() {
        Map<String, Object> analysis = rootCauseEngine.analyzeRootCause("dc-node-03");

        assertNotNull(analysis);
        assertEquals("HIGH CONFIDENCE", analysis.get("confidence"));
        assertTrue(analysis.get("primaryCause").toString().contains("CPU"));
        assertNotNull(analysis.get("evidence"));
        assertNotNull(analysis.get("timeline"));
    }

    @Test
    public void testFixVerificationEngine() {
        Map<String, Object> verification = fixVerificationEngine.verifyFix("dc-node-03", "ACT-9041");

        assertNotNull(verification);
        assertEquals("RESOLVED", verification.get("verificationStatus"));
        assertNotNull(verification.get("beforeState"));
        assertNotNull(verification.get("afterState"));
        assertNotNull(verification.get("metricDeltas"));
    }

    @Test
    public void testToolRegistryDiagnoseAsset() {
        Map<String, Object> report = toolRegistry.diagnoseAsset("MOTOR-001");

        assertNotNull(report);
        assertEquals("MOTOR-001", report.get("assetId"));
        assertNotNull(report.get("primaryIssue"));
        assertNotNull(report.get("safeActions"));
    }
}
