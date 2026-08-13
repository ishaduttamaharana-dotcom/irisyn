package com.bpp.digitaltwin.copilot.resolver;

import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Resolves natural language asset names and aliases ("Motor 1", "the motor", "node 3", "server 3")
 * to actual canonical asset IDs (MOTOR-001, dc-node-03, LAPTOP-001).
 */
@ApplicationScoped
public class EntityResolver {

    @Inject
    DigitalTwinEngine twinEngine;

    public String resolveAssetId(String prompt) {
        if (prompt == null) return "LAPTOP-001";
        String promptLower = prompt.toLowerCase();

        if (promptLower.contains("motor-001") || promptLower.contains("motor 1") || promptLower.contains("the motor") || promptLower.contains("pmsm")) {
            return "MOTOR-001";
        }
        if (promptLower.contains("dc-node-03") || promptLower.contains("node 3") || promptLower.contains("server 3") || promptLower.contains("that server")) {
            return "dc-node-03";
        }
        if (promptLower.contains("cnc") || promptLower.contains("cnc-001")) {
            return "CNC-001";
        }

        List<AssetDto> assets = twinEngine.getAllAssets("ALL");
        for (AssetDto asset : assets) {
            if (promptLower.contains(asset.id.toLowerCase()) || promptLower.contains(asset.name.toLowerCase())) {
                return asset.id;
            }
        }

        return "LAPTOP-001"; // Real host computer default
    }
}
