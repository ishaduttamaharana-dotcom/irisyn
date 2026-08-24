package com.bpp.digitaltwin;

import com.bpp.digitaltwin.copilot.CopilotDataGate;
import com.bpp.digitaltwin.copilot.CopilotEngine;
import com.bpp.digitaltwin.copilot.CopilotMode;
import com.bpp.digitaltwin.dto.CopilotQueryDto;
import com.bpp.digitaltwin.dto.CopilotResponseDto;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class CopilotBehaviorSpecificationTest {

    @Inject
    CopilotDataGate dataGate;

    @Inject
    CopilotEngine copilotEngine;

    @Test
    public void testCopilotOperatingModesResolution() {
        assertEquals(CopilotMode.CHAT_MODE, dataGate.resolveMode("What is a Digital Twin?", null));
        assertEquals(CopilotMode.INVESTIGATION_MODE, dataGate.resolveMode("Why is MOTOR-001 unhealthy? Diagnose the issue.", null));
        assertEquals(CopilotMode.REPORT_MODE, dataGate.resolveMode("Generate operational summary report comparing all assets", null));
        assertEquals(CopilotMode.ACTION_MODE, dataGate.resolveMode("Inject bearing fault scenario into MOTOR-001", null));
    }

    @Test
    public void testInvestigationModeTroubleshootingReport() {
        CopilotQueryDto dto = new CopilotQueryDto();
        dto.question = "Why is MOTOR-001 unhealthy?";
        dto.activeAssetId = "MOTOR-001";
        dto.mode = CopilotMode.INVESTIGATION_MODE;

        CopilotResponseDto response = copilotEngine.processQuery(dto);

        assertNotNull(response);
        assertEquals(CopilotMode.INVESTIGATION_MODE, response.mode);
        assertEquals("CONFIRMED", response.confidence);
        assertNotNull(response.troubleshootingReport);

        Map<String, Object> report = response.troubleshootingReport;
        assertTrue(report.containsKey("PROBLEM"));
        assertTrue(report.containsKey("ROOT_CAUSE"));
        assertTrue(report.containsKey("EVIDENCE"));
        assertTrue(report.containsKey("IMPACT"));
        assertTrue(report.containsKey("RECOMMENDED_FIX"));
        assertTrue(report.containsKey("VERIFICATION"));
        assertTrue(report.containsKey("CONFIDENCE"));
        assertTrue(report.containsKey("DATA_QUALITY"));
    }

    @Test
    public void testHallucinationPreventionMissingData() {
        CopilotQueryDto dto = new CopilotQueryDto();
        dto.question = "Why is NONEXISTENT-ASSET-999 unhealthy?";
        dto.activeAssetId = "NONEXISTENT-ASSET-999";
        dto.mode = CopilotMode.INVESTIGATION_MODE;

        CopilotResponseDto response = copilotEngine.processQuery(dto);

        assertNotNull(response);
        assertEquals("I don't have enough data to determine that.", response.answer);
        assertEquals("INSUFFICIENT_EVIDENCE", response.confidence);
    }
}
