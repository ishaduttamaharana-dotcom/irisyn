package com.bpp.digitaltwin.repository;

import com.bpp.digitaltwin.entity.ContainerEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class ContainerRepository implements PanacheRepositoryBase<ContainerEntity, UUID> {
}
