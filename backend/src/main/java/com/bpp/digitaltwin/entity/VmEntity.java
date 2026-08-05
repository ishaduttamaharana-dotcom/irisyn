package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "vms")
public class VmEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false)
    public String name;

    @Column(name = "host_server_id", nullable = false)
    public UUID hostServerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ServerStatus status;

    public int vcpu;

    @Column(name = "ram_gb")
    public int ramGb;
}
