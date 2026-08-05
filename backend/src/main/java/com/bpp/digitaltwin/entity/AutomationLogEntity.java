package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "automation_logs")
public class AutomationLogEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "job_name", nullable = false)
    public String jobName;

    @Column(nullable = false)
    public String status;

    @Column(name = "executed_at", nullable = false)
    public Instant executedAt;

    @Column(columnDefinition = "TEXT")
    public String details;
}
