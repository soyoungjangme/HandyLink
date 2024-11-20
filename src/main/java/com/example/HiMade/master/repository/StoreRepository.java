package com.example.HiMade.master.repository;

import com.example.HiMade.master.entity.Store;
import com.example.HiMade.master.entity.StoreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE Store s SET s.storeStatus = :storeStatus WHERE s.storeNo = :storeNo") //
    void updateStoreStatusByStoreNo(@Param("storeNo") Long storeNo, @Param("storeStatus") StoreStatus storeStatus);

    @Query("SELECT s FROM Store s WHERE s.storeNo = :storeNo")
    Optional<Store> findByStoreNo(@Param("storeNo") Long storeNo);

    @Query("SELECT s FROM Store s WHERE s.storeStatus = '활성화' AND " +
            "(SELECT COUNT(c.categoryId) FROM Category c WHERE c.storeNo = s.storeNo AND c.categoryLevel = 1) >= 1")
    List<Store> findActiveStoresWithCategoryLevelOne();

}
