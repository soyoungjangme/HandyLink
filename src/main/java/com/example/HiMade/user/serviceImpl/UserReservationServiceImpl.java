package com.example.HiMade.user.serviceImpl;


import com.example.HiMade.user.dto.*;
import com.example.HiMade.user.mapper.UserReservationMapper;
import com.example.HiMade.user.service.UserReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.File;
import java.sql.SQLOutput;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("UserReservationService")
public class UserReservationServiceImpl implements UserReservationService {

  @Autowired
  UserReservationMapper userReservationMapper;

  @Override
  public List<UserRL> getMyReserveList(UserRL dto) {
    return  userReservationMapper.getMyReserveList(dto);
  }

  @Override
  public List<UserRSlotDTO> getDateTime(UserRSlotDTO Date) {
    System.out.println(userReservationMapper.getDateTime(Date));
    return userReservationMapper.getDateTime(Date);
  }


  @Override
  public List<UserRSlotDTO> getDateTime2(int id) {
//    System.out.println(userReservationMapper.getDateTime(id));
    return userReservationMapper.getDateTime2(id);
  }
  @Override
  public List<UserRSlotDTO> getAllDateTime(int id) {

//    System.out.println(userReservationMapper.getAllDateTime(id));
    return userReservationMapper.getAllDateTime(id);
  }

  @Transactional
  @Override
  public int setReservationForm(UserReservationDTO dto) {

    int go = userReservationMapper.setReservationForm(dto);
    System.out.println("insert 된 reservation_id" +  dto.getReservationNo());
    return dto.getReservationNo();
  }

  @Override
  public List<UserReservationDTO> getSlotTime(int slotkey) {
    return userReservationMapper.getSlotTime(slotkey);
  }

  @Transactional
  @Override
  public void setReservationFormDetail(List<UserReservationFormDTO> dto) {
    for (UserReservationFormDTO d : dto ){
      System.out.println("삽입 값" + d);

     int result = userReservationMapper.setReservationFormDetail(d);
      System.out.println(result);
    }
  }

  @Override
  public List<UserRD> getMyReservationDetail(int id) {
    System.out.println(userReservationMapper.getMyReservationDetail(id));
    return userReservationMapper.getMyReservationDetail(id);
  }

  @Override
  public List<UserRD> getMyReservationDetail2(int id) {
    return userReservationMapper.getMyReservationDetail2(id);
  }

  @Override
  public List<LocalDate> getNoSlot(int id) {
    return userReservationMapper.getNoSlot(id);
  }

  @Override
  public void setUpdateStart(UserRSlotDTO dto) {
    userReservationMapper.setUpdateStart(dto);
//    List<UserRSlotDTO> resultDto = userReservationMapper.getAllDateTime(dto.getCategoryId());
//    System.out.println("gg" +resultDto.get(1).getServiceStart());
//    LocalDateTime result = resultDto.get(1).getServiceStart();
  }

  @Override
  public void setUpdateSlot(UserUSlotDTO dto) {

    userReservationMapper.setUpdateSlot(dto);
  }

  @Transactional
  @Override
  public void updateReservationStatus(int reservationNo, String status) {
    userReservationMapper.updateReservationStatus(reservationNo, status);
  }

    @Override
  @Transactional
  public void updateSlotStatus(int categoryId, LocalDate reservationDate, int storeNo) {
    userReservationMapper.updateSlotStatus(categoryId, reservationDate, storeNo);

  }

  @Override
  public void updateSlotCount1(UserRSlotDTO dto) {
    System.out.println(dto);
    userReservationMapper.updateSlotCount1(dto);
  }

  @Override
  public void updateSlotCount2(int slotCount ,int categoryId, LocalDate date1, LocalDate date2) {
    System.out.println(date1);
    System.out.println(date2);
    LocalDate currentDate = date1;
    while (!currentDate.isAfter(date2)) { // currentDate가 date2를 초과하지 않는 동안

      UserRSlotDTO dto = new UserRSlotDTO();
      dto.setCategoryId(categoryId);
      dto.setReservationSlotDate(currentDate);
      dto.setSlotCount(slotCount);
      System.out.println(dto + "----------------------");
      userReservationMapper.updateSlotCount1(dto);

      System.out.println(currentDate);
      currentDate = currentDate.plusDays(1); // 하루 추가
    }


  }

  @Override
  public List<UserReviewDTO> getReviewList(int id) {
    List<UserReviewDTO> reviewList = userReservationMapper.getReviewList(id);

    // 리뷰 목록을 처리하여 이미지 URL을 배열로 묶기
    Map<Integer, UserReviewDTO> reviewMap = new HashMap<>();

    for (UserReviewDTO review : reviewList) {
      // 리뷰가 맵에 없으면 추가
      if (!reviewMap.containsKey(review.getReviewNo())) {
        reviewMap.put(review.getReviewNo(), review);
      }

      // userReviewImg가 null인 경우 초기화
      UserReviewDTO userReviewDTO = reviewMap.get(review.getReviewNo());
      if (userReviewDTO.getUserReviewImg() == null) {
        userReviewDTO.setUserReviewImg(new ArrayList<>()); // 리스트 초기화
      }

      // userReviewImg에 이미지를 추가
      if (review.getReviewImgUrl() != null) {
        userReviewDTO.getUserReviewImg().add(review.getReviewImgUrl());
      }
    }

    System.out.println(reviewMap + "==================");
    return new ArrayList<>(reviewMap.values());
  }

  @Override
  public List<UserReviewDTO> getReviewPhotoList(int id) {
    return userReservationMapper.getReviewPhotoList(id);
  }

  @Override
  public int setReview(UserReviewDTO dto) {
    userReservationMapper.setReview(dto);
    int num = dto.getReviewNo();
    System.out.println("리뷰 등록 번호 " + num);
    return num;

  }

  public void setReviewImg(String reviewImgUrl, int reviewNo) {
    Map<String, Object> params = new HashMap<>();
    params.put("reviewImgUrl", reviewImgUrl);
    params.put("reviewNo", reviewNo);

    userReservationMapper.setReviewImg(params); // 이제 params를 매퍼로 전달합니다.
  }

  @Override
  public List<UserReviewDTO> getReviewListByUserId(String userId) {
    List<UserReviewDTO> reviewList = userReservationMapper.getReviewListByUserId(userId);

    Map<Integer, UserReviewDTO> reviewMap = new HashMap<>();
    for (UserReviewDTO review : reviewList) {
      if (!reviewMap.containsKey(review.getReviewNo())) {
        reviewMap.put(review.getReviewNo(), review);
      }
      UserReviewDTO userReviewDTO = reviewMap.get(review.getReviewNo());
      if (userReviewDTO.getUserReviewImg() == null) {
        userReviewDTO.setUserReviewImg(new ArrayList<>());
      }
      if (review.getReviewImgUrl() != null) {
        userReviewDTO.getUserReviewImg().add(review.getReviewImgUrl());
      }
    }

    return new ArrayList<>(reviewMap.values());
  }

}
