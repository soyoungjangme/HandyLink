package com.example.HiMade.user.controller.PaymentController;

import com.example.HiMade.user.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/userPaymentStatus")
public class UserPaymentStatusController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/updateStatus")
    public ResponseEntity<String> updatePaymentStatus(@RequestParam Long reservationNo, @RequestParam String newStatus) {
        try {
            paymentService.updatePaymentStatus(reservationNo, newStatus);
            return ResponseEntity.ok("결제 상태가 성공적으로 업데이트되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("결제 상태 업데이트 중 오류가 발생했습니다.");
        }
    }
}
