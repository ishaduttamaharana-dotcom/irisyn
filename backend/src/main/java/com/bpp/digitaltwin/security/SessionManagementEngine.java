package com.bpp.digitaltwin.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.*;

/**
 * Session Management Engine handling session creation, validation,
 * idle timeout enforcement (15 minutes), session revocation, and active session listing.
 */
@ApplicationScoped
public class SessionManagementEngine {

    public static class UserSession {
        public String sessionId;
        public String userId;
        public String email;
        public String role;
        public Instant createdAt;
        public Instant lastActiveAt;
        public boolean revoked;

        public UserSession(String sessionId, String userId, String email, String role) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.email = email;
            this.role = role;
            this.createdAt = Instant.now();
            this.lastActiveAt = Instant.now();
            this.revoked = false;
        }

        public boolean isExpired(long timeoutSeconds) {
            return revoked || Instant.now().isAfter(lastActiveAt.plusSeconds(timeoutSeconds));
        }
    }

    private final Map<String, UserSession> activeSessions = new LinkedHashMap<>();
    private static final long DEFAULT_IDLE_TIMEOUT_SECONDS = 900; // 15 minutes

    public SessionManagementEngine() {
        // Seed active administrative session
        UserSession adminSession = new UserSession("SESS-ADMIN-1001", "USR-001", "admin@example.com", "ADMIN");
        activeSessions.put(adminSession.sessionId, adminSession);

        UserSession operatorSession = new UserSession("SESS-OP-1002", "USR-002", "operator@example.com", "OPERATOR");
        activeSessions.put(operatorSession.sessionId, operatorSession);
    }

    public synchronized UserSession createSession(String userId, String email, String role) {
        String sessionId = "SESS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        UserSession session = new UserSession(sessionId, userId, email, role);
        activeSessions.put(sessionId, session);
        return session;
    }

    public synchronized boolean validateSession(String sessionId) {
        if (sessionId == null || !activeSessions.containsKey(sessionId)) return false;
        UserSession session = activeSessions.get(sessionId);
        if (session.isExpired(DEFAULT_IDLE_TIMEOUT_SECONDS)) {
            activeSessions.remove(sessionId);
            return false;
        }
        session.lastActiveAt = Instant.now();
        return true;
    }

    public synchronized boolean revokeSession(String sessionId) {
        if (activeSessions.containsKey(sessionId)) {
            UserSession session = activeSessions.get(sessionId);
            session.revoked = true;
            return true;
        }
        return false;
    }

    public List<UserSession> getActiveSessions() {
        List<UserSession> list = new ArrayList<>();
        for (UserSession s : activeSessions.values()) {
            if (!s.isExpired(DEFAULT_IDLE_TIMEOUT_SECONDS)) {
                list.add(s);
            }
        }
        return list;
    }
}
