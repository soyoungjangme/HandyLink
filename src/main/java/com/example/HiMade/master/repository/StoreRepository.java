package com.example.HiMade.master.repository;

import com.example.HiMade.master.entity.StoreAdmin;
import com.example.HiMade.master.entity.StoreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<StoreAdmin, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE StoreAdmin s SET s.storeStatus = :storeStatus WHERE s.storeNo = :storeNo") //
    void updateStoreStatusByStoreNo(@Param("storeNo") Long storeNo, @Param("storeStatus") StoreStatus storeStatus);

    @Query("SELECT s FROM StoreAdmin s WHERE s.storeNo = :storeNo")
    Optional<StoreAdmin> findByStoreNo(@Param("storeNo") Long storeNo);
}
