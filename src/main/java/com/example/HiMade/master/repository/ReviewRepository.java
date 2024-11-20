package com.example.HiMade.master.repository;

import com.example.HiMade.master.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // 특정 스토어에 대한 리뷰 목록 조회
    @Query("SELECT r FROM Review r WHERE r.reservation.store.storeNo = :storeNo")
    List<Review> findByStoreNo(@Param("storeNo") Long storeNo);

    // 평균 평점 조회
    @Query("SELECT AVG(r.reviewRating) FROM Review r WHERE r.reservation.store.storeNo = :storeNo")
    Double findAverageRatingByStoreNo(@Param("storeNo") Long storeNo);

    // 리뷰 개수 조회
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reservation.store.storeNo = :storeNo")
    Long countReviewsByStoreNo(@Param("storeNo") Long storeNo);

}
