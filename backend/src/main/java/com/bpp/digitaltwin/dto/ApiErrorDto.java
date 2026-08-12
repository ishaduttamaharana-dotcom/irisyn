package com.bpp.digitaltwin.dto;

public class ApiErrorDto {
    public ErrorPayload error;

    public ApiErrorDto() {}

    public ApiErrorDto(String category, String message) {
        this.error = new ErrorPayload(category, message);
    }

    public ApiErrorDto(String category, String message, String details) {
        this.error = new ErrorPayload(category, message, details);
    }

    public static class ErrorPayload {
        public String category; // VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL_ERROR, SERVICE_UNAVAILABLE
        public String message;
        public String details;

        public ErrorPayload() {}

        public ErrorPayload(String category, String message) {
            this.category = category;
            this.message = message;
        }

        public ErrorPayload(String category, String message, String details) {
            this.category = category;
            this.message = message;
            this.details = details;
        }
    }
}
