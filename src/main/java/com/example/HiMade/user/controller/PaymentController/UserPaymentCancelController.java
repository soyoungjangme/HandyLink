package com.example.HiMade.user.controller.PaymentController;

import com.example.HiMade.user.entity.Payment;
import com.example.HiMade.user.service.PaymentService;
import com.example.HiMade.user.service.RefundService;
import com.example.HiMade.user.service.UserReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userPaymentCancel")
public class UserPaymentCancelController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private UserReservationService userReservationService;

    @PostMapping("/updatePaymentStatus/{reservationNo}")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable Long reservationNo, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("paymentStatus");
        String storeName = statusUpdate.get("storeName");
        String reservationStatus = statusUpdate.get("reservationStatus");

        List<Payment> payments = paymentService.getPaymentInfo(reservationNo);

        if (payments.isEmpty()) {
            return ResponseEntity.badRequest().body("결제 정보가 없습니다.");
        }

        for (Payment payment : payments) {
            payment.setPaymentStatus(newStatus); // 결제 상태 업데이트
            paymentService.updatePayment(payment); // 결제 정보 업데이트

            // 예약 상태를 "취소"로 업데이트
            userReservationService.updateReservationStatus(reservationNo.intValue(), reservationStatus); // 수정된 부분

            // 환불 정보 생성 (상태가 N일 경우)
            if ("결제취소".equals(newStatus)) {
                try {
                    refundService.createRefund(
                            payment.getPaymentId(),
                            payment.getPaymentMethod(),  // 결제 방법을 환불 방법으로 사용
                            payment.getPaymentAmount()    // 결제 금액을 환불 금액으로 사용
                    );
                } catch (Exception e) {
                    System.err.println("오류 발생: " + e.getMessage());
                    return ResponseEntity.status(500).body("환불 처리 중 오류가 발생했습니다: " + e.getMessage());
                }
            }
        }
        return ResponseEntity.ok("결제 상태 및 예약 상태가 업데이트되었습니다.");
    }



}
