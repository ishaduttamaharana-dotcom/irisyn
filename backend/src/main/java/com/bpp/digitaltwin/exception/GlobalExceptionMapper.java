package com.bpp.digitaltwin.exception;

import com.bpp.digitaltwin.dto.ErrorResponseDto;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

/**
 * Centralized exception handling so controllers never need try/catch boilerplate.
 */
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof ApiException apiException) {
            return build(apiException.getStatus(), apiException.getMessage());
        }
        if (exception instanceof ConstraintViolationException validationException) {
            return build(Response.Status.BAD_REQUEST, validationException.getMessage());
        }
        LOG.error("Unhandled exception", exception);
        return build(Response.Status.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    private Response build(Response.Status status, String message) {
        return Response.status(status)
            .entity(ErrorResponseDto.of(message, status.getStatusCode()))
            .build();
    }
}
