package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "sensors")
public class SensorEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "asset_id", nullable = false)
    public UUID assetId;

    @Column(name = "sensor_name", nullable = false)
    public String name;

    @Column(nullable = false)
    public String type; // TEMPERATURE, VIBRATION, SPEED_RPM, TORQUE, POWER, CPU, RAM

    @Column(nullable = false)
    public String unit; // C, mm/s, RPM, Nm, kW, %

    @Column(name = "min_value")
    public Double minValue;

    @Column(name = "max_value")
    public Double maxValue;

    @Column(name = "current_value")
    public Double currentValue;

    @Column(nullable = false)
    public String status; // NORMAL, WARNING, CRITICAL
}
