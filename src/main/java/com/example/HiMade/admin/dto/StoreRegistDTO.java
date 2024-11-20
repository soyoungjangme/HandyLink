package com.example.HiMade.admin.dto;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class StoreRegistDTO {

    private String storeId; //업체id
    private Long storeNo; //업체번호
    private String storePw; //업체pw
    private String storeCate; //업종
    private String deliveryType; //배송유무
    private String storeName; //상호명
    private String storeMaster; //대표자명
    private String managerName; //담당자명
    private String managerPhone; //담당자연락처
    private String zipcode; //우편번호
    private String addr; //주소
    private String addrdetail; //상세주소
    private String storeBusinessNo; //사업자등록번호

    private String storeIntro; //업체소개
    private String storeParkingYn; //주차여부
    private String storeNotice; //공지사항
    private LocalTime storeOpenTime; //영업시작시간
    private LocalTime storeCloseTime; //영업종료시간
    private String accountBank; //업체계좌은행
    private String accountNumber; //업체계좌번호
    private String storeSignup; //가입일시
    private String storeStatus; //업체활동상태
    

    // 포맷된 시간 필드 추가
    private String formattedOpenTime; // 포맷된 영업 시작 시간
    private String formattedCloseTime; // 포맷된 영업 종료 시간

    //sns, img, dayOff
    private List<StoreSnsDTO> storeSns;
    private List<StoreImgDTO> storeImg;
    private List<DayOffDay> dayOffDayList;
    private List<DayOffSet> dayOffSetList;
}
