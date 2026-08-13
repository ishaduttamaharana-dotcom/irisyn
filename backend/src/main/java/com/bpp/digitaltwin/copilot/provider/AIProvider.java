package com.bpp.digitaltwin.copilot.provider;

import java.util.Map;

/**
 * Enterprise AI Provider Abstraction decoupling domain code from vendor SDKs.
 */
public interface AIProvider {
    String getProviderName();
    String generateResponse(String userPrompt, Map<String, Object> validatedData, String category);
}
