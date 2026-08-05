package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "predictions")
public class PredictionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "target_id", nullable = false)
    public UUID targetId;

    @Column(name = "predicted_failure_probability")
    public double predictedFailureProbability;

    @Column(name = "recommended_action", nullable = false)
    public String recommendedAction;

    @Column(name = "health_score")
    public double healthScore;

    @Column(name = "failure_type", nullable = false)
    public String failureType;

    @Column(name = "confidence_score")
    public double confidenceScore;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;
}
