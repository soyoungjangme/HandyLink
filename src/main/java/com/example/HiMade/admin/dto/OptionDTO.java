package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class OptionDTO {

    private String parentCategoryId; //부모 카테고리 아이디
    private String categoryId; //해당 카테고리 아이디
    private String categoryLevel; //카테고리 레벨
    private String serviceName; //상품명
    private String middleCategoryValue; //텍스트값

}
