package com.example.HiMade.user.service;

import com.example.HiMade.user.entity.Users;
import com.example.HiMade.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Users getUserById(String userId) {
        return userRepository.findByUserId(userId);
    }

}
