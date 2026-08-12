package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "maintenance_orders")
public class MaintenanceEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "asset_id", nullable = false)
    public String assetId;

    @Column(name = "asset_name", nullable = false)
    public String assetName;

    @Column(nullable = false)
    public String type; // PREVENTIVE, CORRECTIVE, PREDICTIVE

    @Column(nullable = false)
    public String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(nullable = false)
    public String status; // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(length = 2048, nullable = false)
    public String description;

    @Column(name = "due_date", nullable = false)
    public Instant dueDate;

    @Column(name = "assigned_engineer")
    public String assignedEngineer;

    @Column(name = "estimated_hours")
    public Double estimatedHours;
}
