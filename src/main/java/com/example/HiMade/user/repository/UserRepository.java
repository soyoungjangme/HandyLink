package com.example.HiMade.user.repository;

import com.example.HiMade.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users, String> {
    Users findByUserId(String userId);
}
