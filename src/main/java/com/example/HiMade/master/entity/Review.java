package com.example.HiMade.master.entity;

import com.example.HiMade.user.entity.Reservation;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가
    @Column(name = "review_no")
    private int reviewNo;

    @Column(name = "review_rating")
    private BigDecimal reviewRating;

    @Column(name = "review_content")
    private String reviewContent;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @ManyToOne
    @JoinColumn(name = "reservation_no")
    private Reservation reservation;
}
