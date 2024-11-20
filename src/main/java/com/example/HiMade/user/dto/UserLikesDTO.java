package com.example.HiMade.user.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserLikesDTO {

    private Long userLikeNo; //찜pk
    private LocalDateTime userLikeDate; //찜등록일시
    private String userId;
    private Long storeNo;
}
