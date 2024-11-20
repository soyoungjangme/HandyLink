package com.example.HiMade.user.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserCateDTO {

  private int categoryId;
  private int categoryLevel;
  private int parentCategoryId;
  private String serviceName;
  private int servicePrice;
  private String serviceContent;
  private String storeId;
  private int storeNo;
  private LocalDateTime ServiceStart;
  private int imageId;
  private String activated;

  private String imageUrl;
  private String imageDescription;


}
