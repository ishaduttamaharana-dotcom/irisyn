package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.ServerDto;
import com.bpp.digitaltwin.entity.ServerEntity;
import com.bpp.digitaltwin.entity.ServerStatus;
import com.bpp.digitaltwin.repository.ServerRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ServerService {

    @Inject
    ServerRepository serverRepository;

    public List<ServerDto> listServers(String rack, String hostname) {
        if (rack != null && !rack.isBlank() && hostname != null && !hostname.isBlank()) {
            return serverRepository.list("rack = ?1 and hostname like ?2", rack, "%" + hostname + "%")
                    .stream().map(ServerDto::from).toList();
        } else if (rack != null && !rack.isBlank()) {
            return serverRepository.list("rack", rack)
                    .stream().map(ServerDto::from).toList();
        } else if (hostname != null && !hostname.isBlank()) {
            return serverRepository.list("hostname like ?1", "%" + hostname + "%")
                    .stream().map(ServerDto::from).toList();
        }
        return serverRepository.listAll().stream().map(ServerDto::from).toList();
    }

    public ServerDto getServer(UUID id) {
        ServerEntity entity = serverRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("Server not found: " + id);
        }
        return ServerDto.from(entity);
    }

    @Transactional
    public ServerDto createServer(ServerDto dto) {
        ServerEntity entity = new ServerEntity();
        entity.hostname = dto.hostname();
        entity.rack = dto.rack();
        entity.status = dto.status() != null ? ServerStatus.valueOf(dto.status()) : ServerStatus.HEALTHY;
        entity.cpuUsage = dto.cpuUsage();
        entity.ramUsage = dto.ramUsage();
        entity.diskUsage = dto.diskUsage();
        entity.temperatureC = dto.temperatureC();
        entity.uptimeHours = dto.uptimeHours();
        serverRepository.persist(entity);
        return ServerDto.from(entity);
    }

    @Transactional
    public ServerDto updateServer(UUID id, ServerDto dto) {
        ServerEntity entity = serverRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("Server not found: " + id);
        }
        entity.hostname = dto.hostname();
        entity.rack = dto.rack();
        if (dto.status() != null) {
            entity.status = ServerStatus.valueOf(dto.status());
        }
        entity.cpuUsage = dto.cpuUsage();
        entity.ramUsage = dto.ramUsage();
        entity.diskUsage = dto.diskUsage();
        entity.temperatureC = dto.temperatureC();
        entity.uptimeHours = dto.uptimeHours();
        return ServerDto.from(entity);
    }

    @Transactional
    public void deleteServer(UUID id) {
        boolean deleted = serverRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("Server not found: " + id);
        }
    }
}
