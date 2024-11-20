package com.example.HiMade.admin.dto;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UpdateReservationStatusDTO {

    private int reservationId; // 예약 ID
    private String newStatus;   // 새로운 상태 (예: "취소", "대기", "완료")

}
