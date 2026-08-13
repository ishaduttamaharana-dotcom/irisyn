package com.bpp.digitaltwin.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.UUID;

@Provider
public class CorrelationIdFilter implements ContainerRequestFilter, ContainerResponseFilter {

    public static final String CORRELATION_HEADER = "X-Correlation-ID";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String correlationId = requestContext.getHeaderString(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = "trace-" + UUID.randomUUID().toString().substring(0, 8);
        }
        requestContext.setProperty(CORRELATION_HEADER, correlationId);
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        Object correlationId = requestContext.getProperty(CORRELATION_HEADER);
        if (correlationId != null) {
            responseContext.getHeaders().add(CORRELATION_HEADER, correlationId.toString());
        }
    }
}
