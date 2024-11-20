package com.example.HiMade.admin.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class adminReserveAdd {

  private String serviceName;
  private int servicePrice;
  private String serviceContent;
  private List<adminRSDTO> categories;
  @JsonProperty("ServiceStart")
  private LocalDateTime ServiceStart;
  @JsonProperty("DateNumCase")
  private Integer DateNumCase;
  @JsonProperty("TimeNumCase")
  private Integer TimeNumCase;
  @JsonProperty("StoreNo")
  private Integer StoreNo;
  @JsonProperty("StoreId")
  private String StoreId;
  private Integer categoryId;
  private LocalDate reservationSlotDate;
}
