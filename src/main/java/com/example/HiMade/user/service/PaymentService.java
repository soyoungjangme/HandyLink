package com.example.HiMade.user.service;

import com.example.HiMade.user.entity.Payment;
import com.example.HiMade.user.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment createPayment(String paymentMethod, Long paymentAmount, String paymentStatus, Long reservationNo) {
        Payment payment = new Payment();
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentAmount(paymentAmount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentStatus(paymentStatus);
        payment.setReservationNo(reservationNo);

        return paymentRepository.save(payment);
    }

    // 모든 결제 정보 조회
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // reservation_no로 결제 정보 조회
    public List<Payment> getPaymentInfo(Long reservationNo) {
        return paymentRepository.findByReservationNo(reservationNo);
    }

    // 예약 취소시 status "N" 으로 업데이트
    public Payment updatePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    // 결제 상태 업데이트 메서드
    public void updatePaymentStatus(Long reservationNo, String newStatus) {
        List<Payment> payments = paymentRepository.findByReservationNo(reservationNo);

        if (!payments.isEmpty()) {
            payments.forEach(payment -> {
                payment.setPaymentStatus(newStatus);
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment); // 상태 저장
            });
        } else {
            throw new IllegalArgumentException("Reservation not found for reservationNo: " + reservationNo);
        }
    }




}
