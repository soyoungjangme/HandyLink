package com.example.HiMade.user.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "refund_seq")
    @SequenceGenerator(name = "refund_seq", sequenceName = "refund_seq", allocationSize = 1)
    private Long refundId;

    @Column(name = "refund_method", nullable = false)
    private String refundMethod;

    @Column(name = "refund_amount", nullable = false)
    private Long refundAmount;

    @Column(name = "refund_date")
    private LocalDateTime refundDate;

    @Column(name = "payment_id")
    private Long paymentId;

}
