package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts")
public class AlertEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public AlertSeverity severity;

    @Column(nullable = false)
    public String message;

    @Column(nullable = false)
    public String source;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    public boolean acknowledged;
}
