package com.example.HiMade.user.service;

import com.example.HiMade.user.entity.Reservation;
import com.example.HiMade.user.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    public Reservation getReservationDetailByNo(Long reservationNo) {
        return reservationRepository.findByReservationNo(reservationNo);
    }
}
