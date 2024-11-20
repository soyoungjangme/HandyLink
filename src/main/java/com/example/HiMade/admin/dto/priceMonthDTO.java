package com.example.HiMade.admin.dto;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class priceMonthDTO {

  private double day;
  private double year;
  private double month;
  private int totalSales;

}
