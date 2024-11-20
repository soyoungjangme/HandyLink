package com.example.HiMade.user.entity;

import com.example.HiMade.master.entity.Store;
import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;
import java.time.LocalTime;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_no")
    private Long reservationNo;

    @Column(name = "reservation_status")
    private String reservationStatus;

    @Column(name = "reservation_time")
    private LocalTime reservationTime;

    @Column(name = "reg_time")
    private Timestamp regTime;

    @Column(name = "customer_request")
    private String customerRequest;

    @Column(name = "reservation_price")
    private Long reservationPrice;


    @Column(name = "user_id")
    private String userId;

//    @Column(name = "reservation_slot_key")
//    private Long reservationSlotKey;

    @Column(name = "user_delivery_type")
    private String userDeliveryType;

    @ManyToOne
    @JoinColumn(name = "store_no")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "reservation_slot_key", insertable = false, updatable = false)
    private ReservationSlot reservationSlot;




}
