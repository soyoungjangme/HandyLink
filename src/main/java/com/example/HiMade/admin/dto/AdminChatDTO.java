package com.example.HiMade.admin.dto;

import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class AdminChatDTO {
        private Long chatNo;
        private String chatMessage;
        private Timestamp sendTime;
        private String userId; // 고객 ID
        private String senderType; // 발신자 유형 (고객/업체 구분)
        private Long storeNo; // 업체 고유 번호
}
