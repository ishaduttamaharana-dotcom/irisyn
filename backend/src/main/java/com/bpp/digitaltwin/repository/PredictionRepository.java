package com.bpp.digitaltwin.repository;

import com.bpp.digitaltwin.entity.PredictionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class PredictionRepository implements PanacheRepositoryBase<PredictionEntity, UUID> {
}
