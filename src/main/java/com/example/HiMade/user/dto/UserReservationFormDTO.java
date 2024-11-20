package com.example.HiMade.user.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder

public class UserReservationFormDTO {

  private int reservationFormKey;
  private int mainCategoryId;
  private int middleCategoryId;
  private int subCategoryId;
  private String middleCategoryValue;
  private int reservationNo;
}
