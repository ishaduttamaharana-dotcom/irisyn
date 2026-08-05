package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.UserDto;
import com.bpp.digitaltwin.entity.UserEntity;
import com.bpp.digitaltwin.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    public List<UserDto> listUsers() {
        return userRepository.listAll().stream().map(UserDto::from).toList();
    }

    public UserDto getUser(UUID id) {
        UserEntity entity = userRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("User not found: " + id);
        }
        return UserDto.from(entity);
    }

    @Transactional
    public UserDto createUser(UserDto dto) {
        UserEntity entity = new UserEntity();
        entity.email = dto.email();
        entity.displayName = dto.displayName();
        entity.role = dto.role();
        entity.passwordHash = "$2a$10$eA32bO59H1Vf5g.0K35z4.g2y0hJd4ZgCjM/mH4bLqH7FpB9m8l4."; // default placeholder bcrypt hash
        userRepository.persist(entity);
        return UserDto.from(entity);
    }

    @Transactional
    public UserDto updateUser(UUID id, UserDto dto) {
        UserEntity entity = userRepository.findById(id);
        if (entity == null) {
            throw new NotFoundException("User not found: " + id);
        }
        entity.email = dto.email();
        entity.displayName = dto.displayName();
        entity.role = dto.role();
        return UserDto.from(entity);
    }

    @Transactional
    public void deleteUser(UUID id) {
        boolean deleted = userRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("User not found: " + id);
        }
    }
}
