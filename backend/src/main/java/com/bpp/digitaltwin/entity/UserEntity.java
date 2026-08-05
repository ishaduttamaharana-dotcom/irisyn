package com.bpp.digitaltwin.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(nullable = false, unique = true)
    public String email;

    @Column(name = "display_name", nullable = false)
    public String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public UserRole role;

    // Password hash storage is intentionally deferred to the security-hardening phase.
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;
}
