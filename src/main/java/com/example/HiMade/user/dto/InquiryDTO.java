package com.example.HiMade.user.dto;

import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class InquiryDTO {

    private Integer inquityNo;
    private Timestamp inquiryDate;
    private String inquiryContent;
    private String visibility;
    private String inquiryStatus;
    private String storeId;
    private String userId;
}
