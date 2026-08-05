package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.MetricDto;
import com.bpp.digitaltwin.repository.MetricRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class MetricService {

    @Inject
    MetricRepository metricRepository;

    public List<MetricDto> listRecentMetrics() {
        return metricRepository.listAll().stream().map(MetricDto::from).toList();
    }
}
