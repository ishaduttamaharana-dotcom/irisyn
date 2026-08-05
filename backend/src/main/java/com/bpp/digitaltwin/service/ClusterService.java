package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.ClusterSummaryDto;
import com.bpp.digitaltwin.entity.ServerEntity;
import com.bpp.digitaltwin.entity.ServerStatus;
import com.bpp.digitaltwin.repository.ContainerRepository;
import com.bpp.digitaltwin.repository.ServerRepository;
import com.bpp.digitaltwin.repository.VmRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class ClusterService {

    @Inject
    ServerRepository serverRepository;

    @Inject
    ContainerRepository containerRepository;

    @Inject
    VmRepository vmRepository;

    public ClusterSummaryDto summarize() {
        List<ServerEntity> servers = serverRepository.listAll();
        long total = servers.size();
        long healthy = servers.stream().filter(s -> s.status == ServerStatus.HEALTHY).count();
        long degraded = servers.stream().filter(s -> s.status == ServerStatus.WARNING).count();
        long offline = servers.stream().filter(s -> s.status == ServerStatus.OFFLINE).count();
        double avgCpu = servers.stream().mapToDouble(s -> s.cpuUsage).average().orElse(0);
        double avgRam = servers.stream().mapToDouble(s -> s.ramUsage).average().orElse(0);

        // Simulated OpenShift metrics based on actual database counts
        long podCount = containerRepository.count();
        // Fallback to simulated defaults if DB seeding is light
        int pods = podCount > 0 ? (int) podCount * 2 + 5 : 24;
        int deployments = podCount > 0 ? (int) (podCount / 2) + 2 : 8;
        int namespaces = 6;
        int services = podCount > 0 ? (int) podCount + 3 : 12;
        double storageUsage = 64.8; // simulated stable storage usage %

        // Determine overall cluster health
        String overallHealth = "HEALTHY";
        if (servers.stream().anyMatch(s -> s.status == ServerStatus.CRITICAL || s.status == ServerStatus.OFFLINE)) {
            overallHealth = "CRITICAL";
        } else if (servers.stream().anyMatch(s -> s.status == ServerStatus.WARNING)) {
            overallHealth = "WARNING";
        }

        // Round averages
        double roundedCpu = Math.round(avgCpu * 10.0) / 10.0;
        double roundedRam = Math.round(avgRam * 10.0) / 10.0;

        return new ClusterSummaryDto(
            total, healthy, degraded, offline, roundedCpu, roundedRam,
            pods, deployments, namespaces, services, storageUsage, overallHealth
        );
    }
}
