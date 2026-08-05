package com.bpp.digitaltwin.automation;

import com.bpp.digitaltwin.dto.PredictionRequestDto;
import com.bpp.digitaltwin.dto.PredictionResponseDto;
import com.bpp.digitaltwin.entity.PredictionEntity;
import com.bpp.digitaltwin.entity.ServerEntity;
import com.bpp.digitaltwin.repository.PredictionRepository;
import com.bpp.digitaltwin.repository.ServerRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@ApplicationScoped
public class PredictionService {

    @Inject
    ServerRepository serverRepository;

    @Inject
    PredictionRepository predictionRepository;

    @Transactional
    public PredictionResponseDto predict(PredictionRequestDto request) {
        ServerEntity server = serverRepository.findById(request.targetId());
        if (server == null) {
            throw new NotFoundException("Server not found: " + request.targetId());
        }

        // Metrics-driven AI simulation
        double cpu = server.cpuUsage;
        double ram = server.ramUsage;
        double disk = server.diskUsage;
        double temp = server.temperatureC;

        double probability = 0.05 + new Random().nextDouble() * 0.15; // baseline
        double health = 100.0 - (cpu * 0.2 + ram * 0.2 + (temp - 35) * 0.4);
        health = Math.max(10.0, Math.min(100.0, health));
        String failureType = "NONE";
        String action = "No action required";
        double confidence = 0.92 + new Random().nextDouble() * 0.07;

        if (cpu > 80) {
            probability = 0.75 + (cpu - 80) * 0.01;
            failureType = "CPU_OVERLOAD";
            action = "Scale horizontal deployment replicas using playbooks/scale-deployment.yml";
        } else if (ram > 80) {
            probability = 0.80 + (ram - 80) * 0.01;
            failureType = "MEMORY_LEAK";
            action = "Restart virtual workloads on server using playbooks/restart-vm.yml";
        } else if (disk > 90) {
            probability = 0.85;
            failureType = "DISK_FAILURE";
            action = "Trigger node log cleaning script using playbooks/cleanup-logs.yml";
        } else if (temp > 75) {
            probability = 0.90;
            failureType = "OVERHEATING";
            action = "Migrate active workloads to Rack C and trigger HVAC cool boost";
        }

        probability = Math.round(probability * 100.0) / 100.0;
        health = Math.round(health * 10.0) / 10.0;
        confidence = Math.round(confidence * 100.0) / 100.0;

        // Persist prediction entity in database
        PredictionEntity entity = new PredictionEntity();
        entity.targetId = request.targetId();
        entity.predictedFailureProbability = probability;
        entity.recommendedAction = action;
        entity.healthScore = health;
        entity.failureType = failureType;
        entity.confidenceScore = confidence;
        entity.createdAt = Instant.now();
        predictionRepository.persist(entity);

        return new PredictionResponseDto(
            request.targetId(),
            probability,
            action,
            health,
            failureType,
            confidence
        );
    }

    public List<PredictionResponseDto> listPredictionHistory() {
        return predictionRepository.list("order by createdAt desc").stream()
            .map(e -> new PredictionResponseDto(
                e.targetId,
                e.predictedFailureProbability,
                e.recommendedAction,
                e.healthScore,
                e.failureType,
                e.confidenceScore
            ))
            .toList();
    }
}
