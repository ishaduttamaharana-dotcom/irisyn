package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "digital_twin_history")
public class DigitalTwinHistoryEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "asset_id", nullable = false)
    public String assetId;

    @Column(nullable = false)
    public Instant timestamp;

    @Column(name = "previous_mode")
    public String previousMode;

    @Column(name = "new_mode", nullable = false)
    public String newMode; // RUNNING, HIGH_LOAD, DEGRADED, FAULT, OFFLINE

    @Column(name = "trigger_reason")
    public String triggerReason;

    @Column(name = "health_score")
    public Integer healthScore;

    @Column(name = "telemetry_snapshot", length = 2000)
    public String telemetrySnapshot;
}
