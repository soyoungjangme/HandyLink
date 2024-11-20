package com.example.HiMade.user.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder

public class  UserRD {

  private int reservationNo;
  private int reservationFormKey;
  private String mainCategoryName;
  private int mainPrice;
  private String middleCategoryName;
  private int middlePrice;
  private String subCategoryName;
  private int  subPrice;
  private String middleCategoryValue;

  private String storeName;
  private String accountBank;
  private String accountNumber;

  private String imageUrl;
  private String userDeliveryType;

}
