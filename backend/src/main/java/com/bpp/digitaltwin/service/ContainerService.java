package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.ContainerDto;
import com.bpp.digitaltwin.entity.ContainerEntity;
import com.bpp.digitaltwin.entity.ContainerStatus;
import com.bpp.digitaltwin.repository.ContainerRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ContainerService {

    @Inject
    ContainerRepository containerRepository;

    public List<ContainerDto> listContainers() {
        return containerRepository.listAll().stream().map(ContainerDto::from).toList();
    }

    public ContainerDto getContainer(UUID id) {
        ContainerEntity entity = containerRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("Container not found: " + id);
        }
        return ContainerDto.from(entity);
    }

    @Transactional
    public ContainerDto createContainer(ContainerDto dto) {
        ContainerEntity entity = new ContainerEntity();
        entity.name = dto.name();
        entity.image = dto.image();
        entity.podName = dto.podName();
        entity.status = dto.status() != null ? ContainerStatus.valueOf(dto.status()) : ContainerStatus.RUNNING;
        entity.cpuUsage = dto.cpuUsage();
        entity.ramUsage = dto.ramUsage();
        containerRepository.persist(entity);
        return ContainerDto.from(entity);
    }

    @Transactional
    public ContainerDto updateContainer(UUID id, ContainerDto dto) {
        ContainerEntity entity = containerRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("Container not found: " + id);
        }
        entity.name = dto.name();
        entity.image = dto.image();
        entity.podName = dto.podName();
        if (dto.status() != null) {
            entity.status = ContainerStatus.valueOf(dto.status());
        }
        entity.cpuUsage = dto.cpuUsage();
        entity.ramUsage = dto.ramUsage();
        return ContainerDto.from(entity);
    }

    @Transactional
    public void deleteContainer(UUID id) {
        boolean deleted = containerRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("Container not found: " + id);
        }
    }
}
