package com.bpp.digitaltwin.security;

/**
 * Phase 2 placeholder. Real authentication (JWT / OIDC) and role-based
 * access control are implemented in the security-hardening phase. For now
 * this documents the intended role model referenced by the frontend.
 */
public enum CurrentUserRole {
    ADMIN,
    OPERATOR,
    VIEWER
}
