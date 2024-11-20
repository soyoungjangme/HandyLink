package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class StoreImgDTO {

    private Integer storeImgNo; //업체사진pk
    private String storeImgLocation; //업체사진경로
    private Long storeNo; //업체번호

}
