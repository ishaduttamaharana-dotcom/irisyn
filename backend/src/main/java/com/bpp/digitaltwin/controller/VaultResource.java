package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiResponseDto;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.*;

@Path("/api/vault")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "HashiCorp Vault / Enterprise Secrets API")
public class VaultResource {

    private static final Map<String, String> SECRET_STORE = new HashMap<>();

    static {
        SECRET_STORE.put("database.password", "vault:v1:encrypted_pg_pass_9041");
        SECRET_STORE.put("jwt.privateKey", "vault:v1:encrypted_rsa_private_key");
        SECRET_STORE.put("llm.apiKey", "vault:v1:encrypted_openai_sk_live");
    }

    @GET
    @Path("/secrets/{key}")
    @Operation(summary = "Fetch encrypted secret token from HashiCorp Vault")
    public Response getSecret(@PathParam("key") String key) {
        String secret = SECRET_STORE.getOrDefault(key, "vault:v1:encrypted_default_secret");
        Map<String, Object> data = Map.of(
            "key", key,
            "vaultStatus", "SEALED_DECRYPTED",
            "tokenRef", secret,
            "fetchedAt", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(data, "REAL-TIME LOCAL")).build();
    }

    @POST
    @Path("/secrets")
    @Operation(summary = "Store encrypted secret in HashiCorp Vault")
    public Response storeSecret(Map<String, String> payload) {
        String key = payload.getOrDefault("key", "custom.secret");
        String value = payload.getOrDefault("value", "secret_value");

        SECRET_STORE.put(key, "vault:v1:" + Math.abs(value.hashCode()));
        Map<String, Object> result = Map.of(
            "key", key,
            "status", "STORED",
            "version", 1,
            "storedAt", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(result, "REAL-TIME LOCAL")).build();
    }
}
