package com.example.HiMade.user.service;

import com.example.HiMade.user.dto.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface
UserReservationService {

  public List<UserRL> getMyReserveList(UserRL dto);
  public List<UserRSlotDTO> getDateTime(UserRSlotDTO Date);
  public List<UserRSlotDTO> getDateTime2(int id);
  public List<UserRSlotDTO> getAllDateTime(int id);

  public int setReservationForm(UserReservationDTO dto);
  public List<UserReservationDTO> getSlotTime(int slotkey);
  public void setReservationFormDetail(List<UserReservationFormDTO> dto);
  public List<UserRD> getMyReservationDetail(int id);
  public List<UserRD> getMyReservationDetail2(int id);

  public List<LocalDate> getNoSlot(int id);

  void setUpdateStart(UserRSlotDTO dto);
  void setUpdateSlot(@RequestBody UserUSlotDTO dto);


  void updateReservationStatus(int reservationNo, String status);
  void updateSlotStatus(int categoryId, LocalDate reservationDate, int storeNo);

  void updateSlotCount1(UserRSlotDTO dto);
  void updateSlotCount2(int slotCount , int categoryId, LocalDate date1 , LocalDate date2);


  // 리뷰
  List<UserReviewDTO> getReviewList(int id);
  List<UserReviewDTO> getReviewPhotoList(int id);
  int setReview(UserReviewDTO dto);
  void setReviewImg(String reviewImgUrl, int reviewNo);
  List<UserReviewDTO> getReviewListByUserId(String userId);


}
