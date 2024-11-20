package com.example.HiMade.admin.service;

import com.example.HiMade.admin.dto.*;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface AdminStoreService {

    Integer updateUnSubcribe(Long storeNo); //탈퇴
    StoreRegistDTO loginCheck(String id, String pw); //로그인
    void registStore(StoreRegistDTO storeRegistDTO); //업체등록
    void updateStoreInfo(StoreRegistDTO storeRegistDTO); //마이페이지 update

    String findAdminId(String managerName, String storeBusinessNo); //아이디찾기
    Integer findAdminPw(String storeId, String storeBusinessNo); //비번찾기
    void updatePw(String newPw, String storeId, String storeBusinessNo); //새비번등록

    void updateStore(StoreRegistDTO storeRegistDTO); //내가게 업데이트
    StoreRegistDTO getMyStore(Long storeNo); //가게관리정보 불러오기


    void updateDay(StoreRegistDTO storeRegistDTO); //고정휴무-update
    List<DayOffDay> getOffDay(Long storeNo);//고정휴무-select
    void registDayOffSet(DayOffSet dayOffSet); //지정휴무
    List<DayOffSet> getOffSet(Long storeNo); //지정휴무-select
    Integer deleteOffSet(Long storeNo, Long setNo); //지정휴무-delete

    void uploadImage(String file , int id); // 이미지 업로드
    Integer duplicatedId(String storeId); //아이디 중복검사
    void deleteImage(int id , String file);
    List<storeNoticeDTO> getNoticeList(int storeNo); // 가게소식
    void setNotice(storeNoticeDTO dto); // 가게 소식 등록
    void setNoticeModi(storeNoticeDTO dto); // 가게 소식 등록
    void setNoticeStatus(storeNoticeDTO dto);
    public storeNoticeDTO getNoticeDetail( int id);

    List<Map<String , Object>> getDailyReportChart(Long storeNo, int year, int month); //리포트 차트-이번달
    List<Map<String , Object>> getMonthlyReportChart(Long storeNo, int year); //리포트 차트-올해/작년
    Map<String, Long> getGenderCount(Long storeNo); //고객성별
    Map<String, Map<String, Long>> getAgeDistribution(Long storeNo); //고객나이별

    Map<String, Integer> getMainCount(Long storeNo);//메인페이지 카운트 통계
    List<Map<String, Object>> getReservationCounts(Long storeNo); //메인-캘린더 예약건수
    List<Integer> getReservationNo(Long storeNo, String reservationSlotDate); //메인-날짜별 예약번호
    List<CustomerReservationDTO> getTodayCustomer(List<Long> reservationNos); //예약자 정보
    List<Integer> getReservationStatus(Long storeNo);
    Integer completeReservationStatus(Long storeNo, Long reservationNo); //예약완료 update

}
