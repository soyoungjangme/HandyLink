package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class AdminCategoryImgDTO {

  private int imageId;
  private int categoryId;
  private String imageUrl;
  private String imageDescription;

}
