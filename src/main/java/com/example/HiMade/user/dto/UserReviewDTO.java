package com.example.HiMade.user.dto;


import com.example.HiMade.admin.dto.StoreImgDTO;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserReviewDTO {

  private int reviewNo;
  private int reviewRating;
  private String reviewContent;
  private LocalDateTime reviewDate;
  private int reservationNo;

  private int storeNo;
  private String storeName;
  private String userName;
  private String userId;
  private String serviceName;

  private String reviewImgUrl;
  private List<String> userReviewImg;

  private List<StoreImgDTO> storeImg;
//  private List<String> reviewImgUrls;

}
