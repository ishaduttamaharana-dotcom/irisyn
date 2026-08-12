package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "telemetry_records")
public class TelemetryEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "asset_id", nullable = false)
    public String assetId;

    @Column(nullable = false)
    public Instant timestamp;

    @Column(nullable = false)
    public String source; // REAL-TIME LOCAL, SIMULATED, TARGET / FUTURE

    @Column(name = "sequence_number", nullable = false)
    public Long sequenceNumber;

    @Column(nullable = false)
    public Double cpu;

    @Column(name = "cpu_freq_ghz")
    public Double cpuFreqGHz;

    @Column(nullable = false)
    public Double ram;

    @Column(name = "ram_used_gb")
    public Double ramUsedGb;

    @Column(name = "ram_total_gb")
    public Double ramTotalGb;

    @Column(nullable = false)
    public Double disk;

    @Column(name = "disk_used_gb")
    public Double diskUsedGb;

    @Column(name = "disk_total_gb")
    public Double diskTotalGb;

    @Column(nullable = false)
    public Double temperature;

    @Column(name = "network_in_kbps")
    public Double networkInKbps;

    @Column(name = "network_out_kbps")
    public Double networkOutKbps;

    @Column(name = "latency_ms")
    public Double latencyMs;

    @Column(name = "process_count")
    public Integer processCount;

    @Column(name = "thread_count")
    public Integer threadCount;

    @Column(name = "uptime_seconds")
    public Long uptimeSeconds;

    @Column(name = "quality_status")
    public String qualityStatus; // GOOD, STALE, DEGRADED, BUFFERED
}
