package com.example.HiMade.user.mapper;

import com.example.HiMade.admin.dto.AdminCategoryImgDTO;
import com.example.HiMade.user.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface UserReservationMapper {

  public List<UserRL> getMyReserveList(UserRL dto);

  public List<UserRSlotDTO> getDateTime(UserRSlotDTO Date);
  public List<UserRSlotDTO> getDateTime2(int id);
  public List<UserRSlotDTO> getAllDateTime(int id);
  public int setReservationForm(UserReservationDTO dto);
  public List<UserReservationDTO> getSlotTime(int slotkey);
  public void setMainCategoryImg(AdminCategoryImgDTO dto);
  public int setReservationFormDetail(UserReservationFormDTO dto);
  public List<UserRD> getMyReservationDetail(int id);
  public List<UserRD> getMyReservationDetail2(int id);
  public List<LocalDate> getNoSlot(int id);
  void setUpdateStart(UserRSlotDTO dto);
  void setUpdateSlot(@RequestBody UserUSlotDTO dto);
  void updateReservationStatus(@Param("reservationNo") int reservationNo, @Param("status") String status);
  void updateSlotStatus(@Param("categoryId") int categoryId, @Param("reservationDate") LocalDate reservationDate, @Param("storeNo") int storeNo);
  void updateSlotCount1(UserRSlotDTO dto);


  //리뷰
  List<UserReviewDTO> getReviewList(@Param("id") int id);
  List<UserReviewDTO> getReviewPhotoList(@Param("id") int id);
  int setReview(UserReviewDTO dto);
  void setReviewImg(Map map);
  List<UserReviewDTO> getReviewListByUserId(String userId);
}
