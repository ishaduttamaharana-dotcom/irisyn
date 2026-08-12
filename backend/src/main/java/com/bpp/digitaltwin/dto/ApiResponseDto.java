package com.bpp.digitaltwin.dto;

public class ApiResponseDto<T> {
    public T data;
    public ApiMetaDto meta;

    public ApiResponseDto() {}

    public ApiResponseDto(T data) {
        this.data = data;
        this.meta = new ApiMetaDto("REAL-TIME LOCAL");
    }

    public ApiResponseDto(T data, String source) {
        this.data = data;
        this.meta = new ApiMetaDto(source);
    }

    public ApiResponseDto(T data, ApiMetaDto meta) {
        this.data = data;
        this.meta = meta;
    }

    public static <T> ApiResponseDto<T> of(T data) {
        return new ApiResponseDto<>(data);
    }

    public static <T> ApiResponseDto<T> of(T data, String source) {
        return new ApiResponseDto<>(data, source);
    }
}
