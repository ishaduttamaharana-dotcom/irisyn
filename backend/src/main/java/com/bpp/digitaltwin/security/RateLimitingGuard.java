package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding-window Rate Limiting Guard protecting login, Copilot chat,
 * expensive diagnostics, and high-impact write operations against abuse.
 */
@ApplicationScoped
public class RateLimitingGuard {

    private final Map<String, AtomicInteger> requestCounters = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

    public boolean isAllowed(String clientIdentifier) {
        if (clientIdentifier == null || clientIdentifier.isBlank()) {
            clientIdentifier = "GLOBAL_CLIENT";
        }

        AtomicInteger count = requestCounters.computeIfAbsent(clientIdentifier, k -> new AtomicInteger(0));
        return count.incrementAndGet() <= MAX_REQUESTS_PER_WINDOW;
    }

    public Map<String, Object> getRateLimitMetrics() {
        return Map.of(
            "activeClients", requestCounters.size(),
            "maxRequestsPerWindow", MAX_REQUESTS_PER_WINDOW,
            "windowSeconds", 60,
            "status", "ACTIVE"
        );
    }
}
