package com.bpp.digitaltwin.config;

import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;

@OpenAPIDefinition(
    info = @Info(
        title = "Digital Twin API",
        version = "0.1.0",
        description = "AI-Powered Autonomous Data Center Digital Twin — backend REST API (Phase 2 foundation).",
        contact = @Contact(name = "BPP India Platform Team")
    )
)
public class OpenApiConfig {
}
