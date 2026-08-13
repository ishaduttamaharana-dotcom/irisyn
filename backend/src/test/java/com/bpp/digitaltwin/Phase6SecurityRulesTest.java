package com.bpp.digitaltwin;

import com.bpp.digitaltwin.copilot.CopilotQueryEngine;
import com.bpp.digitaltwin.security.*;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class Phase6SecurityRulesTest {

    @Inject
    SessionManagementEngine sessionEngine;

    @Inject
    RateLimitingGuard rateLimitingGuard;

    @Inject
    SystemModeEngine systemModeEngine;

    @Inject
    CopilotQueryEngine copilotQueryEngine;

    @Test
    public void testSessionCreationAndRevocation() {
        SessionManagementEngine.UserSession session = sessionEngine.createSession("USR-003", "test@example.com", "OPERATOR");
        assertNotNull(session.sessionId);
        assertTrue(sessionEngine.validateSession(session.sessionId));

        sessionEngine.revokeSession(session.sessionId);
        assertFalse(sessionEngine.validateSession(session.sessionId));
    }

    @Test
    public void testRateLimitingGuard() {
        assertTrue(rateLimitingGuard.isAllowed("TEST_CLIENT"));
        Map<String, Object> metrics = rateLimitingGuard.getRateLimitMetrics();
        assertNotNull(metrics);
        assertEquals("ACTIVE", metrics.get("status"));
    }

    @Test
    public void testCopilotSecurityBoundaryInReadOnlyMode() {
        systemModeEngine.setMode(SystemModeEngine.SystemMode.READ_ONLY, "ADMIN");

        Map<String, Object> response = copilotQueryEngine.processQuery("restart process python.exe on dc-node-03");
        assertNotNull(response);
        assertTrue(response.get("answer").toString().contains("ACTION_NOT_ALLOWED"));

        systemModeEngine.setMode(SystemModeEngine.SystemMode.NORMAL, "ADMIN");
    }
}
