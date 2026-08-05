package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.AlertDto;
import com.bpp.digitaltwin.entity.AlertEntity;
import com.bpp.digitaltwin.repository.AlertRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AlertService {

    @Inject
    AlertRepository alertRepository;

    public List<AlertDto> listAlerts() {
        // Return alerts sorted by creation time descending (most recent first)
        return alertRepository.list("order by createdAt desc").stream().map(AlertDto::from).toList();
    }

    @Transactional
    public AlertDto acknowledgeAlert(UUID id) {
        AlertEntity entity = alertRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("Alert not found: " + id);
        }
        entity.acknowledged = true;
        return AlertDto.from(entity);
    }
}
