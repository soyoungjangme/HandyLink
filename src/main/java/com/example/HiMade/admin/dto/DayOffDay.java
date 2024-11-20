package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class DayOffDay {

    private Long dayNo; //고정휴무pk
    private String dayOffType; //휴무타입
    private String dayOffDay; //정기휴무요일
    private String dayOffFixStatus; //정기휴무상태(Y, N).
    private Long storeNo; //업체번호

}
