package com.example.HiMade.user.dto;

import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ChatStatusDTO {
    private String userId;
    private Long storeNo;
    private Timestamp userLastCheckedTime;
    private Timestamp storeLastCheckedTime;
    private String actived;
}
