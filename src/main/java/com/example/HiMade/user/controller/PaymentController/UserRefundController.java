package com.example.HiMade.user.controller.PaymentController;

import com.example.HiMade.user.entity.Refund;
import com.example.HiMade.user.service.RefundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/userRefund")
public class UserRefundController {

    private final RefundService refundService;

    public UserRefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    @GetMapping("/getRefundInfo/{paymentId}")
    public ResponseEntity<List<Refund>> getRefundsByPaymentId(@PathVariable Long paymentId) {
        List<Refund> refunds = refundService.getRefundsByPaymentId(paymentId);
        if (refunds.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(refunds);
    }
}
