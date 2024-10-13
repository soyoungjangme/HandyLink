package com.example.HiMade.user.dto;

import jdk.jfr.Name;
import lombok.*;

import java.sql.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class UserDTO {
    private Long userId; // 시퀀스 PK
    private String userPw;
    private String userName;
    private String userBirth;
    private String userGender;
    private String userPhonenum;
    private Date userSignup;
    private String userImgUrl;
    private Long refundAccountNumber;
    private String userEmail; // 로그인용 아이디
}
