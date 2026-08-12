package com.bpp.digitaltwin.exception;

import com.bpp.digitaltwin.dto.ApiErrorDto;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof WebApplicationException webAppException) {
            Response originalResponse = webAppException.getResponse();
            int statusCode = originalResponse.getStatus();
            
            String category;
            switch (statusCode) {
                case 400: category = "VALIDATION_ERROR"; break;
                case 401: category = "UNAUTHORIZED"; break;
                case 403: category = "FORBIDDEN"; break;
                case 404: category = "NOT_FOUND"; break;
                case 409: category = "CONFLICT"; break;
                case 429: category = "RATE_LIMITED"; break;
                case 503: category = "SERVICE_UNAVAILABLE"; break;
                default: category = "INTERNAL_ERROR"; break;
            }

            String message = webAppException.getMessage() != null ? webAppException.getMessage() : "HTTP " + statusCode + " Exception";

            return Response.status(statusCode)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ApiErrorDto(category, message))
                    .build();
        }

        // Generic unhandled internal server exception mapper (hides internal stack trace)
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ApiErrorDto("INTERNAL_ERROR", "An unexpected operational error occurred on the IRISYN platform API."))
                .build();
    }
}
