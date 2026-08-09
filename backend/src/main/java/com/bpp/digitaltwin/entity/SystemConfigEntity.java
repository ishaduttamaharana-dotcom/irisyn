package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "system_configs")
public class SystemConfigEntity extends PanacheEntity {

    @Column(name = "config_key", unique = true, nullable = false)
    public String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT", nullable = false)
    public String configValue;

    @Column(name = "updated_by")
    public String updatedBy;

    @Column(name = "updated_at")
    public Instant updatedAt;

    public SystemConfigEntity() {
        this.updatedAt = Instant.now();
    }

    public SystemConfigEntity(String configKey, String configValue, String updatedBy) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.updatedBy = updatedBy;
        this.updatedAt = Instant.now();
    }
}
