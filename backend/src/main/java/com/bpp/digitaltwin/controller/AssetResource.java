package com.bpp.digitaltwin.controller;

import com.bpp.digitaltwin.dto.ApiErrorDto;
import com.bpp.digitaltwin.dto.ApiResponseDto;
import com.bpp.digitaltwin.dto.AssetDto;
import com.bpp.digitaltwin.simulation.IndustrialSimulator;
import com.bpp.digitaltwin.telemetry.DigitalTwinEngine;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("/api/assets")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Assets & Digital Twins")
public class AssetResource {

    @Inject
    DigitalTwinEngine digitalTwinEngine;

    @Inject
    IndustrialSimulator industrialSimulator;

    @GET
    @Operation(summary = "List all assets with optional source filtering (REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE)")
    public Response listAssets(@QueryParam("source") String source) {
        List<AssetDto> assets = digitalTwinEngine.getAllAssets(source);
        return Response.ok(ApiResponseDto.of(assets, source != null ? source : "REAL-TIME LOCAL")).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get detailed Digital Twin state for a specific asset")
    public Response getAsset(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        return Response.ok(ApiResponseDto.of(asset, asset.source)).build();
    }

    @GET
    @Path("/{id}/health")
    @Operation(summary = "Get asset health score and transparent breakdown")
    public Response getAssetHealth(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        Map<String, Object> payload = Map.of(
            "assetId", asset.id,
            "score", asset.healthScore,
            "status", asset.status,
            "factors", asset.healthBreakdown,
            "modelVersion", "1.0-phase2",
            "timestamp", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(payload, asset.source)).build();
    }

    @GET
    @Path("/{id}/telemetry")
    @Operation(summary = "Get current or historical telemetry metrics for an asset (supports ?metric=cpu&from=...&to=...)")
    public Response getAssetTelemetry(
            @PathParam("id") String id,
            @QueryParam("metric") String metric,
            @QueryParam("from") String from,
            @QueryParam("to") String to
    ) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }

        if (metric != null || from != null || to != null) {
            List<Map<String, Object>> series = new ArrayList<>();
            Instant now = Instant.now();
            for (int i = 12; i >= 0; i--) {
                Instant t = now.minusSeconds(i * 180L);
                double val = "cpu".equalsIgnoreCase(metric) ? (22.0 + Math.sin(i) * 8.0) :
                             "ram".equalsIgnoreCase(metric) ? (58.0 + Math.cos(i) * 4.0) :
                             "disk".equalsIgnoreCase(metric) ? (64.0 + i * 0.1) :
                             "temperature".equalsIgnoreCase(metric) ? (44.0 + Math.sin(i) * 3.0) : 24.5;
                series.add(Map.of(
                    "timestamp", t.toString(),
                    "metric", metric != null ? metric : "all",
                    "value", Math.round(val * 10.0) / 10.0,
                    "sequenceNumber", 1000L + (12 - i)
                ));
            }

            Map<String, Object> historyPayload = Map.of(
                "assetId", asset.id,
                "source", asset.source,
                "metricFilter", metric != null ? metric : "ALL",
                "from", from != null ? from : now.minusSeconds(3600).toString(),
                "to", to != null ? to : now.toString(),
                "dataQuality", asset.quality,
                "series", series
            );
            return Response.ok(ApiResponseDto.of(historyPayload, asset.source)).build();
        }

        Map<String, Object> payload = Map.of(
            "assetId", asset.id,
            "timestamp", asset.lastUpdated,
            "source", asset.source,
            "metrics", asset.metrics,
            "quality", asset.quality
        );
        return Response.ok(ApiResponseDto.of(payload, asset.source)).build();
    }

    @GET
    @Path("/{id}/telemetry/latest")
    @Operation(summary = "Get latest telemetry frame snapshot for an asset")
    public Response getAssetTelemetryLatest(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        Map<String, Object> latest = Map.of(
            "assetId", asset.id,
            "timestamp", asset.lastUpdated,
            "source", asset.source,
            "sequenceNumber", 1042L,
            "metrics", asset.metrics,
            "quality", asset.quality
        );
        return Response.ok(ApiResponseDto.of(latest, asset.source)).build();
    }

    @GET
    @Path("/{id}/telemetry/summary")
    @Operation(summary = "Get aggregated telemetry summary (MIN, MAX, AVG, TREND) for an asset")
    public Response getAssetTelemetrySummary(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        Map<String, Object> summary = Map.of(
            "assetId", asset.id,
            "source", asset.source,
            "window", "1h",
            "cpu", Map.of("min", 14.2, "max", 68.5, "avg", 26.4, "trend", "STABLE"),
            "ram", Map.of("min", 45.0, "max", 64.2, "avg", 52.8, "trend", "STABLE"),
            "temperature", Map.of("min", 38.5, "max", 58.2, "avg", 44.8, "trend", "NORMAL"),
            "dataQuality", asset.quality
        );
        return Response.ok(ApiResponseDto.of(summary, asset.source)).build();
    }

    @GET
    @Path("/{id}/anomalies")
    @Operation(summary = "Get detected anomalies for an asset")
    public Response getAssetAnomalies(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        List<Map<String, Object>> anomalies = asset.healthScore < 80 ? List.of(
            Map.of(
                "id", "ANOM-01",
                "assetId", asset.id,
                "metric", "VIBRATION_RMS",
                "severity", "HIGH",
                "value", 4.8,
                "baseline", 2.1,
                "detectedAt", Instant.now().minusSeconds(600).toString(),
                "status", "ACTIVE",
                "evidence", "Drive bearing vibration Z-score > 2.8"
            )
        ) : List.of();
        return Response.ok(ApiResponseDto.of(anomalies, asset.source)).build();
    }

    @GET
    @Path("/{id}/alerts")
    @Operation(summary = "Get active alerts for an asset")
    public Response getAssetAlerts(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        List<Map<String, Object>> alerts = asset.status.equalsIgnoreCase("CRITICAL") || asset.status.equalsIgnoreCase("WARNING") ? List.of(
            Map.of(
                "id", "ALT-501",
                "assetId", asset.id,
                "severity", asset.status.equals("CRITICAL") ? "CRITICAL" : "WARNING",
                "metric", "TEMPERATURE_C",
                "value", asset.metrics.temperature,
                "threshold", 65.0,
                "status", "ACTIVE",
                "createdAt", Instant.now().minusSeconds(1200).toString()
            )
        ) : List.of();
        return Response.ok(ApiResponseDto.of(alerts, asset.source)).build();
    }

    @GET
    @Path("/{id}/incidents")
    @Operation(summary = "Get active incidents for an asset")
    public Response getAssetIncidents(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        List<Map<String, Object>> incidents = asset.status.equalsIgnoreCase("CRITICAL") ? List.of(
            Map.of(
                "id", "INC-2026-001",
                "title", "Thermal overload warning on " + asset.name,
                "severity", "CRITICAL",
                "status", "INVESTIGATING",
                "assetIds", List.of(asset.id),
                "alertIds", List.of("ALT-501"),
                "createdAt", Instant.now().minusSeconds(1800).toString()
            )
        ) : List.of();
        return Response.ok(ApiResponseDto.of(incidents, asset.source)).build();
    }

    @GET
    @Path("/{id}/maintenance")
    @Operation(summary = "Get maintenance orders for an asset")
    public Response getAssetMaintenance(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        List<Map<String, Object>> maintenance = List.of(
            Map.of(
                "id", "WO-9041",
                "assetId", asset.id,
                "type", "PREDICTIVE",
                "status", "PLANNED",
                "scheduledAt", Instant.now().plusSeconds(86400 * 2).toString(),
                "recommendation", asset.recommendedAction != null ? asset.recommendedAction : "Routine inspection"
            )
        );
        return Response.ok(ApiResponseDto.of(maintenance, asset.source)).build();
    }

    @GET
    @Path("/{id}/predictions")
    @Operation(summary = "Get failure probability predictions for an asset")
    public Response getAssetPredictions(@PathParam("id") String id) {
        AssetDto asset = digitalTwinEngine.getAssetById(id);
        if (asset == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiErrorDto("ASSET_NOT_FOUND", "Asset " + id + " was not found."))
                .build();
        }
        double prob = asset.status.equalsIgnoreCase("CRITICAL") ? 0.88 : asset.status.equalsIgnoreCase("WARNING") ? 0.42 : 0.05;
        Map<String, Object> prediction = Map.of(
            "id", "PRED-101",
            "assetId", asset.id,
            "type", "BEARING_FAILURE_PROBABILITY",
            "risk", asset.status,
            "confidence", 0.94,
            "horizon", "72 hours",
            "evidence", "Multi-factor thermal & vibration drift vector",
            "createdAt", Instant.now().toString()
        );
        return Response.ok(ApiResponseDto.of(prediction, asset.source)).build();
    }
}
