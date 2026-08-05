package com.bpp.digitaltwin.repository;

import com.bpp.digitaltwin.entity.AlertEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class AlertRepository implements PanacheRepositoryBase<AlertEntity, UUID> {
}
