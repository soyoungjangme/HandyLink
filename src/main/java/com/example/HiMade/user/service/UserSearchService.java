package com.example.HiMade.user.service;

import com.example.HiMade.user.entity.Category;
import com.example.HiMade.user.repository.UserSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserSearchService {
    @Autowired
    private UserSearchRepository userSearchRepository;

    public List<Object[]> getLevel1Categories() {
        return userSearchRepository.findServiceNameStoreNoServicePriceServiceContentAndImageUrlByCategoryLevel(1);
    }
}



