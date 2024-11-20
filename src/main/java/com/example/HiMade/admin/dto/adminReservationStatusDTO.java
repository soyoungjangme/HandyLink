package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class adminReservationStatusDTO {

  private int categoryId;
  private int categoryStatus;
  private String subCategoryType;
  private String isRequired;
  private String isPaid;

}
