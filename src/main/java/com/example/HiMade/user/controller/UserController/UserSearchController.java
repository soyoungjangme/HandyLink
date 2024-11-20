package com.example.HiMade.user.controller.UserController;

import com.example.HiMade.user.entity.Category;
import com.example.HiMade.user.service.UserSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("userSearchController")
@RequestMapping("/userSearch")
public class UserSearchController {

    @Autowired
    private UserSearchService userSearchService;

    @GetMapping("/categories/level1")
    public List<Object[]> getLevel1Categories() {
        return userSearchService.getLevel1Categories();
    }




}
