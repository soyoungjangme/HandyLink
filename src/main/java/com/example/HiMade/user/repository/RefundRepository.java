package com.example.HiMade.user.repository;

import com.example.HiMade.user.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByPaymentId(Long paymentId);
}
