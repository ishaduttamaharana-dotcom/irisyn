package com.bpp.digitaltwin.copilot.provider;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.Map;

/**
 * Local AI Provider implementation explaining validated IRISYN backend data.
 * Guarantees that numerical data comes strictly from backend calculation engines.
 */
@ApplicationScoped
public class LocalAIProvider implements AIProvider {

    @Override
    public String getProviderName() {
        return "IRISYN Local Data-Aware Engine v1.0";
    }

    @Override
    public String generateResponse(String userPrompt, Map<String, Object> validatedData, String category) {
        String answer = (String) validatedData.get("answer");
        if (answer != null && !answer.isBlank()) {
            return answer;
        }

        return String.format(
            "IRISYN Copilot (%s): Processed query '%s' against validated system data. Category: %s.",
            getProviderName(), userPrompt, category
        );
    }
}
