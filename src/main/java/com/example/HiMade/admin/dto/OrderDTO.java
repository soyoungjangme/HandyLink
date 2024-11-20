package com.example.HiMade.admin.dto;

import com.example.HiMade.user.entity.Reservation;
import lombok.*;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class OrderDTO {

  private List<adminReservationDTO> orderedList;
  private Long storeNo;
}
