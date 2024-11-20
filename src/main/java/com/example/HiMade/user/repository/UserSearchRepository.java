package com.example.HiMade.user.repository;

import com.example.HiMade.user.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // 추가
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSearchRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c.serviceName, c.storeNo, c.servicePrice, c.serviceContent, ci.imageUrl FROM Category c " +
            "LEFT JOIN c.categoryImages ci WHERE c.categoryLevel = :level")
    List<Object[]> findServiceNameStoreNoServicePriceServiceContentAndImageUrlByCategoryLevel(@Param("level") int level);
}
