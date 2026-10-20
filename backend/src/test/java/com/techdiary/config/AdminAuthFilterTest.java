package com.techdiary.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminAuthFilterTest {

    @Test
    void testGetRequestsAllowedWithoutToken() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/notes");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testOptionsPreflightAllowedWithoutToken() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/notes");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testPostWithoutTokenBlockedWhenAdminKeyConfigured() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/notes");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(request, response);
        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("Unauthorized"));
    }

    @Test
    void testPostWithInvalidTokenBlocked() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/notes");
        request.addHeader("Authorization", "Bearer wrong-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(request, response);
        assertEquals(401, response.getStatus());
    }

    @Test
    void testPostWithValidBearerTokenAllowed() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/notes");
        request.addHeader("Authorization", "Bearer test-secret-key");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testDeleteWithValidXAdminKeyHeaderAllowed() throws ServletException, IOException {
        AdminAuthFilter filter = new AdminAuthFilter("test-secret-key");
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/v1/notes/123");
        request.addHeader("X-Admin-Key", "test-secret-key");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testDevelopmentModeWithoutKeyAllowsMutation() throws ServletException, IOException {
        // When admin key is empty string, development mode is active
        AdminAuthFilter filter = new AdminAuthFilter("");
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/notes");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }
}
