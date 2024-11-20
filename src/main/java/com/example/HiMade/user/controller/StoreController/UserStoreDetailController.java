package com.example.HiMade.user.controller.StoreController;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.UserCateDTO;
import com.example.HiMade.user.dto.UserRL;
import com.example.HiMade.user.service.UserReservationService;
import com.example.HiMade.user.service.UserStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/UserStoreDetail")
public class UserStoreDetailController {

  @Autowired
  private UserStoreService userStoreService;

  @GetMapping("/getStoreMainCategory/{id}")
  public List<UserCateDTO> getStoreMainCategory(@PathVariable int id) {
    System.out.println("gg" + id);
    System.out.println( userStoreService.getStoreMainCategory(id));
    return userStoreService.getStoreMainCategory(id);
  }


  @GetMapping("/getStoreMainCategory2/{id}")
  public UserCateDTO getStoreMainCategory2(@PathVariable int id) {
    System.out.println("gg" + id);
//    System.out.println( userStoreService.getStoreMainCategory2(id));
    return userStoreService.getStoreMainCategory2(id);
  }





  @GetMapping("/getStoreInfo/{id}")
  public StoreRegistDTO getStoreInfo(@PathVariable int id) {
    StoreRegistDTO storeInfo = userStoreService.getStoreInfo(id);

    // 시간 형식 변환
    DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    // 포맷된 시간을 DTO에 설정
    if (storeInfo.getStoreOpenTime() != null) {
      storeInfo.setFormattedOpenTime(storeInfo.getStoreOpenTime().format(timeFormatter));
    }

    if (storeInfo.getStoreCloseTime() != null) {
      storeInfo.setFormattedCloseTime(storeInfo.getStoreCloseTime().format(timeFormatter));
    }

    System.out.println("Formatted Open Time: " + storeInfo.getFormattedOpenTime()); // 디버깅용
    System.out.println("Formatted Close Time: " + storeInfo.getFormattedCloseTime()); // 디버깅용

    return storeInfo; // 포맷된 정보를 포함한 storeInfo 리턴
  }


}

