package com.example.HiMade.master.service;

import com.example.HiMade.master.entity.Store;
import com.example.HiMade.master.entity.StoreStatus;
import com.example.HiMade.master.repository.ReviewRepository;
import com.example.HiMade.master.repository.StoreRepository;
import com.example.HiMade.user.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;

    @Autowired
    public StoreService(StoreRepository storeRepository, ReviewRepository reviewRepository, ReservationRepository reservationRepository) {
        this.storeRepository = storeRepository;
        this.reviewRepository = reviewRepository;
        this.reservationRepository = reservationRepository;
    }

    // 모든 가게 정보 가져오기
    public List<Store> getAllStores() {
        List<Store> stores = storeRepository.findAll();
        // 각 스토어에 대해 평균 평점과 리뷰 개수 계산
        for (Store store : stores) {
            Double averageRating = reviewRepository.findAverageRatingByStoreNo(store.getStoreNo());
            Long reviewCount = reviewRepository.countReviewsByStoreNo(store.getStoreNo());
            Long reservationCount = reservationRepository.countByStore_StoreNo(store.getStoreNo());

            if (averageRating != null) {
                // 소수점 첫째 자리까지 절삭
                BigDecimal rating = BigDecimal.valueOf(averageRating).setScale(1, RoundingMode.FLOOR);
                store.setAverageRating(rating);
            } else {
                store.setAverageRating(BigDecimal.ZERO); // 리뷰가 없는 경우 0으로 설정
            }

            store.setReviewCount(reviewCount != null ? reviewCount : 0L); // 리뷰 개수
            store.setReservationCount(reservationCount != null ? reservationCount : 0L); // 예약 개수
        }
        return stores;
    }

    // 특정 가게와 관련된 정보 가져오기
    public Store getStoreDetails(Long storeNo) {
        return storeRepository.findByStoreNo(storeNo)
                .orElseThrow(() -> new RuntimeException("Store not found with storeNo: " + storeNo));
    }

    // 가게 활성화
    public Store approveStore(Long storeNo) {
        storeRepository.updateStoreStatusByStoreNo(storeNo, StoreStatus.활성화);
        return getStoreDetails(storeNo);
    }

    // 가게 정지
    public Store deactivateStore(Long storeNo) {
        storeRepository.updateStoreStatusByStoreNo(storeNo, StoreStatus.정지);
        return getStoreDetails(storeNo);
    }

    public List<Store> getActiveStoresWithCategoryLevelOne() {
        // 활성화 상태이고 categoryLevel 1인 카테고리가 하나 이상 있는 가게들 가져오기
        List<Store> stores = storeRepository.findActiveStoresWithCategoryLevelOne();

        // 각 스토어에 대해 평균 평점과 리뷰 개수 계산
        for (Store store : stores) {
            // 평균 평점 계산
            Double averageRating = reviewRepository.findAverageRatingByStoreNo(store.getStoreNo());
            // 리뷰 개수 계산
            Long reviewCount = reviewRepository.countReviewsByStoreNo(store.getStoreNo());
            // 예약 개수 계산
            Long reservationCount = reservationRepository.countByStore_StoreNo(store.getStoreNo());

            if (averageRating != null) {
                // 소수점 첫째 자리까지 절삭
                BigDecimal rating = BigDecimal.valueOf(averageRating).setScale(1, RoundingMode.FLOOR);
                store.setAverageRating(rating);
            } else {
                store.setAverageRating(BigDecimal.ZERO); // 리뷰가 없는 경우 0으로 설정
            }

            store.setReviewCount(reviewCount != null ? reviewCount : 0L); // 리뷰 개수
            store.setReservationCount(reservationCount != null ? reservationCount : 0L); // 예약 개수
        }
        return stores;
    }

}
