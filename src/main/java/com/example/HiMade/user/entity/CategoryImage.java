package com.example.HiMade.user.entity;

import javax.persistence.*;

@Entity
@Table(name = "category_image")
public class CategoryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int imageId;

    @ManyToOne
    @JoinColumn(name = "category_id") // 외래키 설정
    private Category category;

    private String imageUrl;
    private String imageDescription;
}
