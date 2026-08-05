package com.bpp.digitaltwin.repository;

import com.bpp.digitaltwin.entity.AutomationLogEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class AutomationLogRepository implements PanacheRepositoryBase<AutomationLogEntity, UUID> {
}
