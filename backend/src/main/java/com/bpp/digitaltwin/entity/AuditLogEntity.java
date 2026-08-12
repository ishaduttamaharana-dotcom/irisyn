package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLogEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false)
    public Instant timestamp;

    @Column(nullable = false)
    public String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    public UserRole userRole;

    @Column(nullable = false)
    public String action;

    @Column(nullable = false)
    public String resource;

    @Column(name = "ip_address")
    public String ipAddress;

    @Column(length = 2048)
    public String details;

    @Column(nullable = false)
    public String outcome; // SUCCESS, FAILURE, DENIED
}
