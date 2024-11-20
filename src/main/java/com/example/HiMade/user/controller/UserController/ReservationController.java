package com.example.HiMade.user.controller.UserController;

import com.example.HiMade.user.entity.Reservation;
import com.example.HiMade.user.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/userReservation")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    // reservationNo로 예약 정보 가져오기
    @GetMapping("/getReservationDetail/{reservationNo}")
    public Reservation getReservationDetail(@PathVariable Long reservationNo) {
        return reservationService.getReservationDetailByNo(reservationNo);
    }



}
