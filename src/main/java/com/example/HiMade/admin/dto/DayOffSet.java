package com.example.HiMade.admin.dto;

import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class DayOffSet {

    private Long setNo; //업체휴무pk
    private LocalDate dayOffStart; //지정휴무시작일
    private LocalDate dayOffEnd; //지정휴무종료일
    private Long storeNo; //업체번호
}
