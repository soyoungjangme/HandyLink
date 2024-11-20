package com.example.HiMade.user.controller;

import com.example.HiMade.user.entity.Users;
import com.example.HiMade.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/getUser")
public class UserProfileController {

    @Autowired
    private UserService userService;

    // 사용자 정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<Users> getUserProfile(@PathVariable String userId) {
        Users user = userService.getUserById(userId);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

}
