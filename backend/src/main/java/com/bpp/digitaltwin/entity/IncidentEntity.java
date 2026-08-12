package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class IncidentEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false)
    public String title;

    @Column(name = "asset_id", nullable = false)
    public String assetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public AlertSeverity severity; // INFO, WARNING, CRITICAL

    @Column(nullable = false)
    public String status; // OPEN, INVESTIGATING, MITIGATED, RESOLVED

    @Column(name = "assigned_to")
    public String assignedTo;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(name = "resolved_at")
    public Instant resolvedAt;

    @Column(length = 2048)
    public String summary;
}
