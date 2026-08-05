package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.AutomationLogDto;
import com.bpp.digitaltwin.entity.AutomationLogEntity;
import com.bpp.digitaltwin.repository.AutomationLogRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class AutomationLogService {

    @Inject
    AutomationLogRepository logRepository;

    public List<AutomationLogDto> listLogs() {
        return logRepository.listAll().stream().map(AutomationLogDto::from).toList();
    }

    @Transactional
    public AutomationLogDto createLog(AutomationLogDto dto) {
        AutomationLogEntity entity = new AutomationLogEntity();
        entity.jobName = dto.jobName();
        entity.status = dto.status();
        entity.executedAt = dto.executedAt() != null ? dto.executedAt() : Instant.now();
        entity.details = dto.details();
        logRepository.persist(entity);
        return AutomationLogDto.from(entity);
    }
}
