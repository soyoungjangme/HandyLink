package com.example.HiMade.user.entity;

import lombok.*;

import javax.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Users {
    @Id
    private String userId;

    private String userPw;
    private String userName;
    private String userBirth;
    private String userGender;
    private String userPhonenum;
    private Date userSignup;
    private String userImgUrl;
    private Long refundAccountNumber;
    private String loginType;
    private String userStatus;
}
