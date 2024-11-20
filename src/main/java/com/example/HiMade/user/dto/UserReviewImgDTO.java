package com.example.HiMade.user.dto;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserReviewImgDTO {

  private  int reviewImgKey;
  private String reviewImgUrl;
  private int reviewNo;
}
