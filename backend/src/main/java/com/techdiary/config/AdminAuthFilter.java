package com.techdiary.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;

/**
 * Server-side authorization filter protecting mutating API endpoints.
 * 
 * Guarantees:
 * <ul>
 *   <li>Safe methods (GET, HEAD, OPTIONS) are permitted for read-only access (Viewer Mode).</li>
 *   <li>Mutating methods (POST, PUT, DELETE, PATCH) require a valid admin token when configured.</li>
 *   <li>Token verification uses constant-time comparison to prevent timing attacks.</li>
 *   <li>When DEVVAULT_ADMIN_KEY is not set, runs in unauthenticated local development mode.</li>
 * </ul>
 */
@Component
@Order(1)
public class AdminAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthFilter.class);
    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "DELETE", "PATCH");

    private final String adminKey;

    public AdminAuthFilter(@Value("${techdiary.security.admin-key:}") String adminKey) {
        this.adminKey = adminKey != null ? adminKey.trim() : "";
        if (this.adminKey.isEmpty()) {
            log.warn("DevVault is running in OPEN DEVELOPMENT MODE (No DEVVAULT_ADMIN_KEY configured). " +
                     "Set DEVVAULT_ADMIN_KEY before exposing the backend publicly.");
        } else {
            log.info("DevVault server-side admin authorization filter is ACTIVE.");
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod().toUpperCase();

        // 1. Safe methods & preflight CORS requests are always allowed (read-only viewer mode)
        if (!MUTATING_METHODS.contains(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. If no admin key is configured in application environment, allow (local dev mode)
        if (adminKey.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token from Authorization header (Bearer <token>) or X-Admin-Key header
        String providedToken = extractToken(request);

        if (providedToken == null || !isTokenValid(providedToken, adminKey)) {
            log.warn("Blocked unauthorized mutating {} request to {} from IP: {}",
                    method, request.getRequestURI(), request.getRemoteAddr());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("""
                {
                  "status": 401,
                  "message": "Unauthorized: Valid admin authentication token required for modifying records."
                }
                """);
            return;
        }

        // 4. Token valid — proceed to endpoint
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authHeader.substring(7).trim();
        }
        String customHeader = request.getHeader("X-Admin-Key");
        if (customHeader != null && !customHeader.isBlank()) {
            return customHeader.trim();
        }
        return null;
    }

    /**
     * Constant-time comparison to prevent timing side-channel attacks.
     */
    private boolean isTokenValid(String provided, String expected) {
        byte[] a = provided.getBytes(StandardCharsets.UTF_8);
        byte[] b = expected.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(a, b);
    }
}
