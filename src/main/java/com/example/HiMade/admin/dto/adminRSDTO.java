package com.example.HiMade.admin.dto;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class adminRSDTO {
  private int middleId; // sql
  private int subId;

  private int categoryId;
  private int storeNo;
  private int categoryLevel; // 1,2,3
  private int parentCategoryId; // {cateId}

  private int categoryStatus; //id
  private String serviceName;
  private int servicePrice;
  private String serviceContent;

  private String subCategoryType;
  private String isRequired;
  private String isPaid;

  private List<adminReservationDTO> subCategories;
}
