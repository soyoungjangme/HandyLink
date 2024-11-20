package com.example.HiMade.admin.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class StoreSnsDTO {

    private Integer storeSnsNo; //pk
    private String snsLink;
    private String snsName;
    private Long storeNo;
}
