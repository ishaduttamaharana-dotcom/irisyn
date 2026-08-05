package com.bpp.digitaltwin.repository;

import com.bpp.digitaltwin.entity.ServerEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class ServerRepository implements PanacheRepositoryBase<ServerEntity, UUID> {
}
