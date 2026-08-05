package com.bpp.digitaltwin.dto;

public record ClusterSummaryDto(
    long totalNodes,
    long healthyNodes,
    long degradedNodes,
    long offlineNodes,
    double cpuAverage,
    double ramAverage,
    int podsCount,
    int deploymentsCount,
    int namespacesCount,
    int servicesCount,
    double storageUsage,
    String overallHealth
) {
}
