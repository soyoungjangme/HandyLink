package com.example.HiMade.user.repository;

import com.example.HiMade.user.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Reservation findByReservationNo(Long reservationNo);
    Long countByStore_StoreNo(Long storeNo);
}

