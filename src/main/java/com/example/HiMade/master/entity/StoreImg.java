package com.example.HiMade.master.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "store_img")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class StoreImg {
    @Id
    private String storeImgNo;

    private String storeImgLocation;

    @ManyToOne
    @JoinColumn(name = "store_no")
    @JsonBackReference
    private Store store;
}
