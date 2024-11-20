package com.example.HiMade.user.entity;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservation_slot")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_slot_key")
    private Long reservationSlotKey;

    @Column(name = "reservation_slot_date")
    private LocalDate reservationSlotDate;

    // 다른 필요한 필드 추가
}
