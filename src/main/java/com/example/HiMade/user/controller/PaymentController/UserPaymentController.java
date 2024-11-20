package com.example.HiMade.user.controller.PaymentController;

import com.example.HiMade.user.entity.Payment;
import com.example.HiMade.user.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/userPayment")
public class UserPaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {

        // payment 객체의 값이 올바르게 들어오는지 로그로 확인
        System.out.println("Received payment: " + payment);
        
        Payment savedPayment = paymentService.createPayment(
                payment.getPaymentMethod(),
                payment.getPaymentAmount(),
                payment.getPaymentStatus(),
                payment.getReservationNo()
        );
        return ResponseEntity.ok(savedPayment);
    }

}
