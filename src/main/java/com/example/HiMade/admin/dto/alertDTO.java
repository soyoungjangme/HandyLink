package com.example.HiMade.admin.dto;

import lombok.*;
import org.w3c.dom.Text;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class alertDTO {

  private int alertNo;
  private String storeId ;
  private String userId ;
  private String alertType;
  private String alertContent ;
  private LocalDate alertSendDate ;
}
