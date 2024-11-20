package com.example.HiMade.master.service;

import com.example.HiMade.master.entity.Review;
import com.example.HiMade.master.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsByStoreNo(Long storeNo) {
        return reviewRepository.findByStoreNo(storeNo);
    }

    // 평균 리뷰 평점 가져오기
    public Double getAverageRatingByStoreNo(Long storeNo) {
        return reviewRepository.findAverageRatingByStoreNo(storeNo);
    }
}
