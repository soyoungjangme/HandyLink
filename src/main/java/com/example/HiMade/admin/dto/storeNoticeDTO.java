package com.example.HiMade.admin.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class storeNoticeDTO {

  private int noticeNo;
  private LocalDateTime noticeRegdate;
  private String noticeContent;
  private String noticeType;
  private int storeNo;
  private String storeId;
  private String status;
  private String modi;

}
