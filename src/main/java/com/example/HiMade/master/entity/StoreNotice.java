package com.example.HiMade.master.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_notice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class StoreNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가
    @Column(name = "notice_no")
    private int noticeNo;

    @Column(name = "notice_regdate", nullable = false)
    private LocalDateTime noticeRegdate;

    @Column(name = "notice_content")
    private String noticeContent;

    @ManyToOne
    @JoinColumn(name = "store_no")
    @JsonBackReference
    private Store store;

    @Column(name = "notice_type")
    private String noticeType;

    @Column(name = "status")
    private String status;



}