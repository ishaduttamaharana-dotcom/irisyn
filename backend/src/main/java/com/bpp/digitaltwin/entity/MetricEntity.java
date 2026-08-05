package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "metrics")
public class MetricEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "server_id", nullable = false)
    public UUID serverId;

    @Column(name = "recorded_at", nullable = false)
    public Instant recordedAt;

    public double cpu;
    public double ram;
    public double disk;
    public double network;
}
