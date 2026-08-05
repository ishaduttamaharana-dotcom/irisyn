package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.VmDto;
import com.bpp.digitaltwin.entity.AutomationLogEntity;
import com.bpp.digitaltwin.entity.ServerEntity;
import com.bpp.digitaltwin.entity.ServerStatus;
import com.bpp.digitaltwin.entity.VmEntity;
import com.bpp.digitaltwin.repository.AutomationLogRepository;
import com.bpp.digitaltwin.repository.ServerRepository;
import com.bpp.digitaltwin.repository.VmRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class VmService {

    @Inject
    VmRepository vmRepository;

    @Inject
    ServerRepository serverRepository;

    @Inject
    AutomationLogRepository logRepository;

    public List<VmDto> listVms() {
        return vmRepository.listAll().stream().map(VmDto::from).toList();
    }

    public VmDto getVm(UUID id) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }
        return VmDto.from(entity);
    }

    @Transactional
    public VmDto createVm(VmDto dto) {
        VmEntity entity = new VmEntity();
        entity.name = dto.name();
        entity.hostServerId = dto.hostServerId();
        entity.status = dto.status() != null ? ServerStatus.valueOf(dto.status()) : ServerStatus.HEALTHY;
        entity.vcpu = dto.vcpu();
        entity.ramGb = dto.ramGb();
        vmRepository.persist(entity);
        return VmDto.from(entity);
    }

    @Transactional
    public VmDto updateVm(UUID id, VmDto dto) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }
        entity.name = dto.name();
        entity.hostServerId = dto.hostServerId();
        if (dto.status() != null) {
            entity.status = ServerStatus.valueOf(dto.status());
        }
        entity.vcpu = dto.vcpu();
        entity.ramGb = dto.ramGb();
        return VmDto.from(entity);
    }

    @Transactional
    public void deleteVm(UUID id) {
        boolean deleted = vmRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("VM not found: " + id);
        }
    }

    @Transactional
    public VmDto restartVm(UUID id) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }
        entity.status = ServerStatus.HEALTHY;
        
        // Log to automation
        AutomationLogEntity log = new AutomationLogEntity();
        log.jobName = "OpenShift Virtualization: Restart VM " + entity.name;
        log.status = "SUCCESS";
        log.executedAt = Instant.now();
        log.details = "VM restarted successfully. Guest agent reports UP status.";
        logRepository.persist(log);

        return VmDto.from(entity);
    }

    @Transactional
    public VmDto stopVm(UUID id) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }
        entity.status = ServerStatus.OFFLINE;

        AutomationLogEntity log = new AutomationLogEntity();
        log.jobName = "OpenShift Virtualization: Shutdown VM " + entity.name;
        log.status = "SUCCESS";
        log.executedAt = Instant.now();
        log.details = "VM shutdown signal received. ACPI shutdown completed.";
        logRepository.persist(log);

        return VmDto.from(entity);
    }

    @Transactional
    public VmDto startVm(UUID id) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }
        entity.status = ServerStatus.HEALTHY;

        AutomationLogEntity log = new AutomationLogEntity();
        log.jobName = "OpenShift Virtualization: Start VM " + entity.name;
        log.status = "SUCCESS";
        log.executedAt = Instant.now();
        log.details = "VM power state set to RUNNING. VNC display active.";
        logRepository.persist(log);

        return VmDto.from(entity);
    }

    @Transactional
    public VmDto migrateVm(UUID id) {
        VmEntity entity = vmRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("VM not found: " + id);
        }

        ServerEntity currentHost = serverRepository.findById(entity.hostServerId);
        if (currentHost == null) {
            throw new NotFoundException("VM Host server not found");
        }

        // Live Migration Logic: Find another healthy server in a different rack
        List<ServerEntity> alternatives = serverRepository.list("status = ?1 and id != ?2", ServerStatus.HEALTHY, currentHost.id);
        if (alternatives.isEmpty()) {
            // fallback to any server if no healthy alternatives
            alternatives = serverRepository.list("id != ?1", currentHost.id);
        }

        if (alternatives.isEmpty()) {
            throw new IllegalStateException("No alternative hypervisors available for live migration");
        }

        ServerEntity newHost = alternatives.get(0);
        entity.hostServerId = newHost.id;
        entity.status = ServerStatus.HEALTHY; // restore health on new host

        // Log live migration
        AutomationLogEntity log = new AutomationLogEntity();
        log.jobName = "OpenShift Virt: Live Migrate VM " + entity.name;
        log.status = "SUCCESS";
        log.executedAt = Instant.now();
        log.details = "Live migration successful.\nSource Host: " + currentHost.hostname + " (" + currentHost.rack + ")\nDestination Host: " + newHost.hostname + " (" + newHost.rack + ")\nWorkload transferred with zero guest downtime.";
        logRepository.persist(log);

        return VmDto.from(entity);
    }
}
