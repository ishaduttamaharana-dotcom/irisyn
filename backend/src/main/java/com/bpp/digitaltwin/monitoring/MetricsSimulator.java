package com.bpp.digitaltwin.monitoring;

import com.bpp.digitaltwin.dto.*;
import com.bpp.digitaltwin.entity.*;
import com.bpp.digitaltwin.repository.*;
import com.bpp.digitaltwin.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.websockets.next.OpenConnections;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class MetricsSimulator {

    @Inject
    ServerRepository serverRepository;

    @Inject
    MetricRepository metricRepository;

    @Inject
    AlertRepository alertRepository;

    @Inject
    ClusterService clusterService;

    @Inject
    OpenConnections connections;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    io.micrometer.core.instrument.MeterRegistry registry;

    private ScheduledExecutorService scheduler;
    
    // In-memory tracker for active anomalies to simulate persistent states (e.g., memory leaks)
    private final Map<UUID, String> activeAnomalies = new ConcurrentHashMap<>();
    private final Map<UUID, Double> memoryLeakOffsets = new ConcurrentHashMap<>();

    public void onStart(@Observes StartupEvent ev) {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(this::runCycle, 2, 2, TimeUnit.SECONDS);
        registry.gauge("active_anomalies_count", activeAnomalies, Map::size);
    }

    public void onStop(@Observes ShutdownEvent ev) {
        if (scheduler != null) {
            scheduler.shutdown();
        }
    }

    private void runCycle() {
        try {
            QuarkusTransaction.requiringNew().run(this::tick);
            broadcastUpdates();
        } catch (Exception e) {
            System.err.println("Error in simulation cycle: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void tick() {
        List<ServerEntity> servers = serverRepository.listAll();
        if (servers.isEmpty()) return;

        Random rand = new Random();

        // 10% chance to toggle/start an anomaly on a random server if active anomalies are low
        if (activeAnomalies.size() < 2 && rand.nextDouble() < 0.10) {
            ServerEntity target = servers.get(rand.nextInt(servers.size()));
            if (!activeAnomalies.containsKey(target.id)) {
                String[] anomalies = {"CPU_SPIKE", "MEM_LEAK", "DISK_FULL", "OVERHEAT", "NET_LATENCY"};
                String anomaly = anomalies[rand.nextInt(anomalies.length)];
                activeAnomalies.put(target.id, anomaly);
                if (anomaly.equals("MEM_LEAK")) {
                    memoryLeakOffsets.put(target.id, 0.0);
                }
            }
        }

        Instant now = Instant.now();

        for (ServerEntity server : servers) {
            double cpu = 15 + rand.nextDouble() * 45; // base 15-60
            double ram = 30 + rand.nextDouble() * 30; // base 30-60
            double disk = server.diskUsage + (rand.nextDouble() - 0.48) * 0.2; // slow drift
            disk = Math.max(10, Math.min(99, disk));
            double temp = 35 + rand.nextDouble() * 20; // base 35-55
            double network = 10 + rand.nextDouble() * 50; // base 10-60 Mbps

            // Apply active anomaly if present
            if (activeAnomalies.containsKey(server.id)) {
                String anomaly = activeAnomalies.get(server.id);
                switch (anomaly) {
                    case "CPU_SPIKE" -> {
                        cpu = 92 + rand.nextDouble() * 6.8;
                        if (rand.nextDouble() < 0.2) activeAnomalies.remove(server.id); // 20% chance to resolve on each tick
                    }
                    case "MEM_LEAK" -> {
                        double offset = memoryLeakOffsets.getOrDefault(server.id, 0.0) + 5.0;
                        ram = Math.min(98.5, ram + offset);
                        memoryLeakOffsets.put(server.id, offset);
                        if (ram >= 95.0 && rand.nextDouble() < 0.15) {
                            activeAnomalies.remove(server.id);
                            memoryLeakOffsets.remove(server.id);
                        }
                    }
                    case "DISK_FULL" -> {
                        disk = 96 + rand.nextDouble() * 3.5;
                        if (rand.nextDouble() < 0.1) activeAnomalies.remove(server.id);
                    }
                    case "OVERHEAT" -> {
                        temp = 82 + rand.nextDouble() * 10;
                        if (rand.nextDouble() < 0.2) activeAnomalies.remove(server.id);
                    }
                    case "NET_LATENCY" -> {
                        network = 120 + rand.nextDouble() * 80;
                        if (rand.nextDouble() < 0.3) activeAnomalies.remove(server.id);
                    }
                }
            }

            // Round values
            cpu = Math.round(cpu * 10.0) / 10.0;
            ram = Math.round(ram * 10.0) / 10.0;
            disk = Math.round(disk * 10.0) / 10.0;
            temp = Math.round(temp * 10.0) / 10.0;
            network = Math.round(network * 10.0) / 10.0;

            // Update Server entity
            server.cpuUsage = cpu;
            server.ramUsage = ram;
            server.diskUsage = disk;
            server.temperatureC = temp;
            server.uptimeHours += 1;

            // Status evaluation
            if (cpu > 95 || ram > 95 || temp > 85 || disk > 98) {
                server.status = ServerStatus.CRITICAL;
            } else if (cpu > 90 || ram > 90 || temp > 80 || disk > 95 || network > 120) {
                server.status = ServerStatus.WARNING;
            } else {
                server.status = ServerStatus.HEALTHY;
            }

            serverRepository.persist(server);

            // Record time-series MetricEntity
            MetricEntity metric = new MetricEntity();
            metric.serverId = server.id;
            metric.recordedAt = now;
            metric.cpu = cpu;
            metric.ram = ram;
            metric.disk = disk;
            metric.network = network;
            metricRepository.persist(metric);

            // Trigger Alert Engine rules
            triggerAlertRules(server, cpu, ram, disk, temp, network, now);
        }

        // Clean up old metrics to prevent database bloat (keep last 10 minutes)
        metricRepository.delete("recordedAt < ?1", Instant.now().minusSeconds(600));
    }

    private void triggerAlertRules(ServerEntity server, double cpu, double ram, double disk, double temp, double network, Instant now) {
        if (cpu > 90) {
            raiseAlert(AlertSeverity.CRITICAL, "Node " + server.hostname + " CPU usage is critical: " + cpu + "%", server.hostname, now);
        }
        if (ram > 90) {
            raiseAlert(AlertSeverity.CRITICAL, "Node " + server.hostname + " Memory usage is critical: " + ram + "%", server.hostname, now);
        }
        if (disk > 95) {
            raiseAlert(AlertSeverity.CRITICAL, "Node " + server.hostname + " Disk space is low: " + disk + "%", server.hostname, now);
        }
        if (temp > 80) {
            raiseAlert(AlertSeverity.CRITICAL, "Node " + server.hostname + " temperature is high: " + temp + "°C", server.hostname, now);
        }
        if (network > 120) {
            raiseAlert(AlertSeverity.WARNING, "Node " + server.hostname + " network latency anomaly: " + network + " Mbps", server.hostname, now);
        }
    }

    private void raiseAlert(AlertSeverity severity, String message, String source, Instant now) {
        long count = alertRepository.count("source = ?1 and message = ?2 and acknowledged = false", source, message);
        if (count == 0) {
            AlertEntity alert = new AlertEntity();
            alert.severity = severity;
            alert.message = message;
            alert.source = source;
            alert.createdAt = now;
            alert.acknowledged = false;
            alertRepository.persist(alert);
            
            // Increment custom Prometheus alert counter
            registry.counter("alert_trigger_total", "source", source, "severity", severity.name()).increment();
        }
    }

    private void broadcastUpdates() {
        if (!connections.iterator().hasNext()) return;

        try {
            // Fetch latest tables
            List<ServerDto> servers = serverRepository.listAll().stream().map(ServerDto::from).collect(Collectors.toList());
            List<AlertDto> alerts = alertRepository.list("acknowledged = false order by createdAt desc").stream().map(AlertDto::from).collect(Collectors.toList());
            ClusterSummaryDto cluster = clusterService.summarize();

            // Safely fetch distinct recent timestamps using JPQL
            List<Instant> times = metricRepository.getEntityManager()
                .createQuery("SELECT DISTINCT m.recordedAt FROM MetricEntity m ORDER BY m.recordedAt DESC", Instant.class)
                .setMaxResults(20)
                .getResultList();

            // Reverse list to display chronologically (past to present)
            Collections.reverse(times);

            List<MetricDto> chartMetrics = new ArrayList<>();
            for (Instant t : times) {
                List<MetricEntity> points = metricRepository.list("recordedAt = ?1", t);
                if (!points.isEmpty()) {
                    double avgCpu = points.stream().mapToDouble(p -> p.cpu).average().orElse(0);
                    double avgRam = points.stream().mapToDouble(p -> p.ram).average().orElse(0);
                    double avgDisk = points.stream().mapToDouble(p -> p.disk).average().orElse(0);
                    double avgNet = points.stream().mapToDouble(p -> p.network).average().orElse(0);
                    chartMetrics.add(new MetricDto(
                        t,
                        Math.round(avgCpu * 10.0) / 10.0,
                        Math.round(avgRam * 10.0) / 10.0,
                        Math.round(avgDisk * 10.0) / 10.0,
                        Math.round(avgNet * 10.0) / 10.0
                    ));
                }
            }

            // Construct payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("servers", servers);
            payload.put("alerts", alerts);
            payload.put("cluster", cluster);
            payload.put("metrics", chartMetrics);

            String json = objectMapper.writeValueAsString(payload);
            for (io.quarkus.websockets.next.WebSocketConnection connection : connections) {
                connection.sendTextAndAwait(json);
            }
        } catch (Exception e) {
            System.err.println("Failed to broadcast WebSocket update: " + e.getMessage());
        }
    }
}
