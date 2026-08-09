package com.bpp.digitaltwin.copilot;

import com.bpp.digitaltwin.dto.AssetDto;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.*;

@ApplicationScoped
public class CopilotEntityResolver {

    @Inject
    CopilotToolRouter toolRouter;

    public static class EntityResolutionResult {
        public String resolvedAssetId;
        public String assetName;
        public String sourceTag;
        public boolean ambiguous;
        public List<String> candidates;

        public EntityResolutionResult() {
            this.candidates = new ArrayList<>();
        }
    }

    public EntityResolutionResult resolveEntity(String question, String pageContextActiveAsset) {
        EntityResolutionResult result = new EntityResolutionResult();
        if (question == null) question = "";

        String q = question.toLowerCase().trim();

        // 1. Explicit Asset ID / Alias Matches
        if (q.contains("motor-001") || q.contains("motor 1") || q.contains("the motor") || q.contains("induction motor") || q.equals("motor")) {
            result.resolvedAssetId = "MOTOR-001";
            result.assetName = "3-Phase Induction Motor (150kW)";
            result.sourceTag = "SIMULATED";
            return result;
        }

        if (q.contains("pump-001") || q.contains("pump 1") || q.contains("the pump") || q.contains("fluid pump") || q.equals("pump")) {
            result.resolvedAssetId = "PUMP-001";
            result.assetName = "Centrifugal Fluid Pump";
            result.sourceTag = "SIMULATED";
            return result;
        }

        if (q.contains("laptop-001") || q.contains("my laptop") || q.contains("host laptop") || q.contains("host computer") || q.contains("host system") || q.contains("laptop")) {
            result.resolvedAssetId = "LAPTOP-001";
            result.assetName = "Host Workstation System";
            result.sourceTag = "REAL-TIME LOCAL";
            return result;
        }

        if (q.contains("cnc-001") || q.contains("cnc machine") || q.contains("milling station") || q.contains("cnc")) {
            result.resolvedAssetId = "CNC-001";
            result.assetName = "5-Axis CNC Milling Station";
            result.sourceTag = "TARGET / FUTURE";
            return result;
        }

        // Server node matching (dc-node-01..06, server 1..6, node 1..6)
        for (int i = 1; i <= 6; i++) {
            String nodeKey = "dc-node-0" + i;
            if (q.contains(nodeKey) || q.contains("node " + i) || q.contains("server " + i) || q.contains("node-0" + i)) {
                result.resolvedAssetId = nodeKey;
                result.assetName = "Data Center Server " + nodeKey;
                result.sourceTag = "SIMULATED";
                return result;
            }
        }

        // 2. Fallback to active page/asset context if question uses pronouns ("it", "this asset", "that machine", "why did health decrease")
        if (pageContextActiveAsset != null && !pageContextActiveAsset.isBlank()) {
            AssetDto activeAsset = toolRouter.getAsset(pageContextActiveAsset);
            if (activeAsset != null) {
                result.resolvedAssetId = activeAsset.id;
                result.assetName = activeAsset.name;
                result.sourceTag = activeAsset.source;
                return result;
            }
        }

        // 3. Ambiguous match check if user says "the machine" or "the asset" without context
        if (q.contains("asset") || q.contains("machine") || q.contains("equipment")) {
            List<AssetDto> all = toolRouter.getAssets();
            result.ambiguous = true;
            for (AssetDto a : all) {
                result.candidates.add(a.id + " (" + a.name + ")");
            }
        }

        return result;
    }
}
