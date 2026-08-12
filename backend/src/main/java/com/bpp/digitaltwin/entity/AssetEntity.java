package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assets")
public class AssetEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "asset_key", nullable = false, unique = true)
    public String assetKey;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String type; // LAPTOP, INDUSTRIAL_MOTOR, PUMP, SERVER, CNC_MACHINE

    @Column(name = "data_source", nullable = false)
    public String source; // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE

    @Column(nullable = false)
    public String manufacturer;

    @Column(nullable = false)
    public String model;

    @Column(nullable = false)
    public String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ServerStatus status; // HEALTHY, WARNING, CRITICAL, OFFLINE

    @Column(name = "operating_mode", nullable = false)
    public String operatingMode; // NORMAL, HIGH_LOAD, DEGRADATION, FAULT

    @Column(name = "health_score", nullable = false)
    public Integer healthScore;

    @Column(name = "operating_hours", nullable = false)
    public Double operatingHours;

    @Column(name = "last_updated", nullable = false)
    public Instant lastUpdated;

    public static AssetEntity findByAssetKey(String assetKey) {
        return find("assetKey", assetKey).firstResult();
    }
}
