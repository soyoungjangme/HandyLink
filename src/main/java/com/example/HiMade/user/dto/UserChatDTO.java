package com.example.HiMade.user.dto;

import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserChatDTO {
    private Long chatNo;
    private String chatMessage;
    private Timestamp sendTime;
    private String storeId;
    private String userId;
    private String senderType;
    private Long storeNo;
}
