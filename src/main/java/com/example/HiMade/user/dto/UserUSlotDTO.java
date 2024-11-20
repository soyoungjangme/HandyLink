package com.example.HiMade.user.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder

public class UserUSlotDTO {

  private LocalDate reservationSlotDate;

  private LocalDate startSlotDate;
  private LocalDate endSlotDate;

  private int slotCount;
  private int limitTime;

  private int categoryId;

}
