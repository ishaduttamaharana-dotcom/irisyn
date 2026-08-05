package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "containers")
public class ContainerEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String image;

    @Column(name = "pod_name", nullable = false)
    public String podName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ContainerStatus status;

    @Column(name = "cpu_usage")
    public double cpuUsage;

    @Column(name = "ram_usage")
    public double ramUsage;
}
