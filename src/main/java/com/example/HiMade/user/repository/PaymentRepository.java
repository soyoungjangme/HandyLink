package com.example.HiMade.user.repository;

import com.example.HiMade.user.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // reservation_no로 결제 정보 조회
    List<Payment> findByReservationNo(Long reservationNo);

}
