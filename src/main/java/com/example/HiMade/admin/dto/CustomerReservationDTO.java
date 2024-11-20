package com.example.HiMade.admin.dto;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class CustomerReservationDTO {

    private String userId;
    private String userName; //예약자
    private String userPhoneNum; //연락처
    private String reservationSlotDate;
    private String reservationTime; //방문시간
    private String paymentMethod; //결제방식
    private String paymentAmount; //결제금액
    private List<OptionDTO> options; //주문정보 (상품명, 옵션)
    private String customerRequest; //요청사항
    private Long reservationNo; // 예약 번호 (Long 타입으로 맞춰져 있음)


}
