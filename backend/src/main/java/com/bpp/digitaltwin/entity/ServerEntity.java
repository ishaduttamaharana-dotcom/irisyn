package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "servers")
public class ServerEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false, unique = true)
    public String hostname;

    @Column(nullable = false)
    public String rack;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ServerStatus status;

    @Column(name = "cpu_usage")
    public double cpuUsage;

    @Column(name = "ram_usage")
    public double ramUsage;

    @Column(name = "disk_usage")
    public double diskUsage;

    @Column(name = "temperature_c")
    public double temperatureC;

    @Column(name = "uptime_hours")
    public long uptimeHours;
}
