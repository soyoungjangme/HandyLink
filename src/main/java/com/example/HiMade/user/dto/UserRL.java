package com.example.HiMade.user.dto;

import lombok.*;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserRL {
  private int reservationNo; // 예약 번호
  private String reservationStatus; // 상태
  private int reservationPrice; // 총액
  private LocalDateTime regTime; // 등록일

  private String storeName; // 업체 이름
  private LocalDate reservationSlotDate; // 예약 일
  private LocalTime reservationTime; // 예약 시간

  private String ServiceName; //서비스 이름
  private String userId;

  private  int reviewCount;

}
