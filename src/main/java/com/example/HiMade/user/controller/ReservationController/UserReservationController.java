package com.example.HiMade.user.controller.ReservationController;


import com.example.HiMade.admin.dto.adminReserveMangeDTO;
import com.example.HiMade.user.dto.*;
import com.example.HiMade.user.service.UserReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userReservation")
public class UserReservationController {

  @Autowired
  private UserReservationService userReservationService;

  @PostMapping("/getDateTime/{id}")
  public List<UserRSlotDTO> getDateTime(@RequestBody UserRSlotDTO dto, @PathVariable int id){
    dto.setCategoryId(id);
    System.out.println(userReservationService.getDateTime(dto));
    return userReservationService.getDateTime(dto);
  }
  @GetMapping("/getDateTime2/{id}")
  public List<UserRSlotDTO> getDateTime2(@PathVariable int id){
//    dto.setCategoryId(id);
//    System.out.println(userReservationService.getDateTime2(id));
    return userReservationService.getDateTime2(id);
  }

  @GetMapping("/getAllDateTime/{id}")
  public List<UserRSlotDTO> getAllDateTime(@PathVariable int id){
    System.out.println(id);
//    System.out.println(userReservationService.getAllDateTime(id));
    return userReservationService.getAllDateTime(id);
  }

  @PostMapping("/setUpdateStart")
  public void setUpdateStart(@RequestBody UserRSlotDTO dto){
    System.out.println("기록"+dto);
    userReservationService.setUpdateStart(dto);
  }

  @PostMapping("/setUpdateSlot")
  public void setUpdateSlot(@RequestBody UserUSlotDTO dto){
    System.out.println("슬롯 기간별 업데이트 "+dto);
    userReservationService.setUpdateSlot(dto);
  }


  @PostMapping("/setReservationForm")
  public int setReservationForm(@RequestBody UserReservationDTO dto) {
    System.out.println(dto);
    return userReservationService.setReservationForm(dto);
  }


  @PostMapping("/setReservationFormDetail")
  public void setReservationFormDetail(@RequestBody List<UserReservationFormDTO> dto) {
    System.out.println("form에 들어갈 배열 값들 --- " + dto);
    userReservationService.setReservationFormDetail(dto);
  }


  @PostMapping("/getSlotTime")
  public List<UserReservationDTO> getSlotTime(@RequestBody UserRSlotDTO dto){
    int slotkey = dto.getReservationSlotKey();
    System.out.println("슬롯키"  + slotkey);

    return userReservationService.getSlotTime(slotkey);
  }

  @GetMapping("/getNoSlot/{id}")
  public List<LocalDate> getNoSlot(@PathVariable int id){
    System.out.println(userReservationService.getNoSlot(id));
    return userReservationService.getNoSlot(id);
  }

  @PostMapping("/updateSlotStatus")
  public void updateSlotStatus(@RequestBody Map<String, Object> slotUpdate) {
    try {
      System.out.println("updateSlotStatus 호출됨");

      // String에서 Integer로 변환
      int categoryId = Integer.parseInt((String) slotUpdate.get("categoryId"));
      LocalDate reservationDate = LocalDate.parse((String) slotUpdate.get("reservationDate"));
      int storeNo = Integer.parseInt((String) slotUpdate.get("storeNo"));

      // 로그 출력으로 받은 데이터 확인
      System.out.println("categoryId: " + categoryId);
      System.out.println("reservationDate: " + reservationDate);
      System.out.println("storeNo: " + storeNo);

      userReservationService.updateSlotStatus(categoryId, reservationDate, storeNo);
    } catch (NumberFormatException e) {
      System.err.println("숫자 형식 변환 오류: " + e.getMessage());
    } catch (Exception e) {
      System.err.println("오류 발생: " + e.getMessage());
      e.printStackTrace();
    }
  }

  @PostMapping("/updateSlotCount1/{id}")
  public void updateSlotCount1(@RequestBody UserRSlotDTO dto, @PathVariable int id){
    if (dto.getReservationSlotDate() == null){
      System.out.println("date 2개 값 " + dto.getReservationSlotDates().toString());
      List<LocalDate> date = dto.getReservationSlotDates();
      userReservationService.updateSlotCount2(dto.getSlotCount(), id , date.get(0), date.get(1));

    }else {
      System.out.println("date 1개 값 " + dto.getReservationSlotDate());
      dto.setCategoryId(id);
      userReservationService.updateSlotCount1(dto);

    }

    System.out.println(dto);
//    userReservationService.updateSlotCount1(dto);

  }

//  리뷰

  @GetMapping("/getReviewList/{id}")
  public List<UserReviewDTO> getReviewList(@PathVariable int id) {
//    int storeNo = request.get("storeNo");
//    System.out.println(storeNo);
//    System.out.println(userReservationService.getReviewList(id) + "리뷰 리스트");
    System.out.println(userReservationService.getReviewList(id));
    return userReservationService.getReviewList(id);
  }


  @PostMapping("/getReviewList")
  public List<UserReviewDTO> getReviewList(@RequestBody Map<String, Integer> request) {
    int storeNo = request.get("storeNo");
    System.out.println(storeNo);
//    System.out.println(userReservationService.getReviewList(id) + "리뷰 리스트");
      return userReservationService.getReviewList(storeNo);
  }

  @GetMapping("/getReviewPhotoList/{id}")
  public List<UserReviewDTO> getReviewPhotoList(@PathVariable int id) {
    System.out.println("실행됨ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ");
//    System.out.println(userReservationService.getReviewList(id) + "리뷰 리스트");
    return userReservationService.getReviewPhotoList(id);
  }

  @GetMapping("/getMyReviews")
  public List<UserReviewDTO> getMyReviews(Authentication auth) {
    auth = SecurityContextHolder.getContext().getAuthentication();
    String userId = auth.getName();
    return userReservationService.getReviewListByUserId(userId);
  }




}
