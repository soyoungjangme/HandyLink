package com.example.HiMade.admin.mapper;

import com.example.HiMade.admin.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminStoreMapper {

    Integer updateUnSubcribe(Long storeNo); //탈퇴
    StoreRegistDTO loginCheck(@Param("id") String id,@Param("pw") String pw); //로그인
    void registStore(StoreRegistDTO storeRegistDTO); //업체등록
    void insertDay(DayOffDay dayOffDay); //가게등록시 고정휴무 세팅
    void updateStoreInfo(StoreRegistDTO storeRegistDTO); //마이페이지 update

    String findAdminId(@Param("managerName") String managerName, @Param("storeBusinessNo") String storeBusinessNo); //아이디찾기
    Integer findAdminPw(@Param("storeId") String storeId, @Param("storeBusinessNo") String storeBusinessNo); //비번찾기
    void updatePw(@Param("newPw") String newPw, @Param("storeId") String storeId, @Param("storeBusinessNo") String storeBusinessNo); //새비번등록

    StoreRegistDTO getMyStore(Long storeNo); //가게관리정보 불러오기
    void updateStore(StoreRegistDTO storeRegistDTO); //내가게 업데이트

    void deleteStoreImg(@Param("storeNo") Long storeNo, @Param("storeImgList") List<StoreImgDTO> storeImgList); //이미지 삭제
    List<String> selectExistingStoreImg(Long storeNo); // DB에 저장된 이미지 경로 확인
    void addStoreImg(StoreImgDTO storeImgDTO); //가게img 추가

    void deleteStoreSns(@Param("storeNo") Long storeNo, @Param("storeSns") List<StoreSnsDTO> storeSns);
    List<String> selectExistingSns(Long storeNo); // DB에 저장된 이미지 경로 확인
    void addStoreSns(StoreSnsDTO storeSnsDTO); //가게img 추가

    void updateDay(StoreRegistDTO storeRegistDTO); //고정휴무-update
    void updateNoDayOff(Long storeNo);//고정휴무-update
    List<DayOffDay> getOffDay(Long storeNo);//고정휴무-select
    void registDayOffSet(DayOffSet dayOffSet); //지정휴무
    List<DayOffSet> getOffSet(Long storeNo); //지정휴무-select
    Integer deleteOffSet(@Param("storeNo") Long storeNo, @Param("setNo") Long setNo); //지정휴무-delete

    Integer duplicatedId(String storeId); //아이디 중복검사

    List<storeNoticeDTO> getNoticeList(int storeNo); // 가게소식
    void setNotice(storeNoticeDTO dto); // 가게 소식 등록
    void setNoticeModi(storeNoticeDTO dto); // 가게 소식 등록
    void setNoticeStatus(storeNoticeDTO dto);
    public storeNoticeDTO getNoticeDetail( int id);

    Integer getUserLikeCount(Long storeNo); //찜수
    Integer getCompleteCount(Long storeNo); //완료된 예약건수-픽업완료
    Integer getReviewCount(Long storeNo); //리뷰등록개수
    Integer getCancledCount(Long storeNo); //예약취소건수
    Integer getWaitCount(Long storeNo); //예약대기건수-결제완료된
    Integer getDoingCount(Long storeNo); //진행중인예약-주문승인된
    Integer getTodayCompleteCount(Long storeNo); //오늘 완료된 예약
    Integer getTodayRemainCount(Long storeNo); //오늘 남은 예약

    List<Map<String , Object>> getDailyReportChart(@Param("storeNo") Long storeNo,@Param("year") int year, @Param("month") int month); //리포트 예약 정보
    List<Map<String , Object>> getMonthlyReportChart(@Param("storeNo") Long storeNo,@Param("year") int year); //리포트 예약 정보
    Map<String, Long> getGenderCount(Long storeNo); //고객성별
    List<Map<String, Object>> getAgeDistribution(Long storeNo); //고객나이별

    List<Map<String, Object>> getReservationCounts(Long storeNo); //메인-캘린더 예약건수
    List<Integer> getReservationNo(@Param("storeNo") Long storeNo,@Param("reservationSlotDate") String reservationSlotDate); //메인-날짜별 예약번호
    List<CustomerReservationDTO> getTodayCustomer(@Param("reservationNos") List<Long> reservationNos);
    List<Integer> getReservationStatus(Long storeNo);
    Integer completeReservationStatus(@Param("storeNo") Long storeNo, @Param("reservationNo")Long reservationNo); //예약완료 update


    void uploadImage(@Param("file") String file , @Param("id") int id);
     void deleteImage( @Param("id") int id, @Param("file") String file);
}
