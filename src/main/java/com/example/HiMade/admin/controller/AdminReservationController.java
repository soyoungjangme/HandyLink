package com.example.HiMade.admin.controller;


import com.example.HiMade.admin.dto.*;
import com.example.HiMade.admin.service.AdminMainService;
import com.example.HiMade.admin.service.AdminReservationService;
import com.example.HiMade.user.entity.Reservation;
import com.example.HiMade.user.service.UserService;
import org.apache.ibatis.annotations.Param;
import org.hibernate.criterion.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/adminReservation")
public class AdminReservationController {

  @Autowired
  private AdminReservationService adminReservationService;


  @GetMapping("/priceMonth/{id}/{year}")
  public List<priceMonthDTO> priceMonth(@PathVariable int id, @PathVariable int year){
    return adminReservationService.priceMonth(id,year);
  }

  @GetMapping("/priceDay/{id}/{year}/{month}")
  public List<priceMonthDTO> priceDay(@PathVariable int id, @PathVariable int year, @PathVariable int month){
    return adminReservationService.priceDay(id, year, month);
  }

  @PostMapping("/save-order")
  public ResponseEntity<String> saveOrder(@RequestBody OrderDTO orderRequest) {
    // orderRequest에서 orderedList를 받아서 처리
    List<adminReservationDTO> orderedList = orderRequest.getOrderedList();

    // 순서 변경 처리 로직 (예: DB에 저장)
     adminReservationService.saveOrder(orderedList);

    return ResponseEntity.ok("순서가 성공적으로 저장되었습니다.");
  }

  @PostMapping("/getManageList")
  public List<adminReserveMangeDTO> getManageList(@RequestBody Map<String, Integer> request) {
    int storeNo = request.get("storeNo");
    System.out.println(storeNo);
    System.out.println(adminReservationService.getManageList(storeNo));
    return adminReservationService.getManageList(storeNo);
  }

  @PostMapping("/getManageFilterList")
  public List<adminReserveMangeDTO> getManageFilterList(@RequestBody Map<String, Integer> request) {
    int storeNo = request.get("storeNo");
    System.out.println(storeNo);
    System.out.println(adminReservationService.getManageFilterList(storeNo));
    return adminReservationService.getManageFilterList(storeNo);
  }

  @PostMapping("/getManageCalender")
  public List<adminManagerCalDTO> getManageCalender(@RequestBody Map<String, Integer> request) {
    int storeNo = request.get("storeNo");
    System.out.println(storeNo);
    System.out.println(adminReservationService.getManageCalender(storeNo));
    return adminReservationService.getManageCalender(storeNo);
  }



  @PostMapping("/getList")
  public List<adminReservationDTO> getList(@RequestBody Map<String, Integer> request) {
    int storeNo = request.get("storeNo");
    System.out.println(storeNo);
    System.out.println(adminReservationService.getList(storeNo));
    return adminReservationService.getList(storeNo);
  }

  @GetMapping("/getListDetail/{id}")
  public adminReservationDTO getListDetail(@PathVariable int id) {
    System.out.println(adminReservationService.getListDetail(id));
    System.out.println(id);
    return adminReservationService.getListDetail(id);
  }

  @GetMapping("/getMiddleItem/{id}")
  public List<adminRSDTO> getMiddleItem(@PathVariable int id) {
    System.out.println(adminReservationService.getMiddleItem(id));
    System.out.println(id);
    return adminReservationService.getMiddleItem(id);
  }


  @GetMapping("/setCategoryDel/{id}")
  public void setCategoryDel(@PathVariable int id) {
    adminReservationService.setCategoryDel(id);
  }

  @PostMapping("/setMainCategoryModi/{id}")
  public int setMainCategoryModi(@RequestBody adminReserveAdd dto, @PathVariable int id) {

  // 기존꺼 비활성화 함.
    System.out.println(id + "기존 아이디 ");
    adminReservationService.setActivated(id);

    System.out.println(dto);

    adminReservationDTO dto2 = new adminReservationDTO();
    dto2.setServiceName(dto.getServiceName());
    dto2.setServicePrice(dto.getServicePrice());
    dto2.setServiceContent(dto.getServiceContent());
    dto2.setServiceStart(dto.getServiceStart());
    dto2.setStoreNo(dto.getStoreNo());

    // 대분류 카테고리
    int serviceId = adminReservationService.setMainCategory(dto2); // 대분류 insert
    System.out.println("메인 카테고리 삽입 후 아이디  : " + serviceId);
    int realId = serviceId;
    adminReservationService.setSlotModi(id, realId);
    adminReserveAdd dtoSlot = new adminReserveAdd();
    dtoSlot = dto;
    dtoSlot.setCategoryId(serviceId);
    dtoSlot.setStoreNo(dto.getStoreNo());
    System.out.println(dtoSlot);

    // 중분류 카테고리
    List<adminRSDTO> categories = dto.getCategories();
    for (adminRSDTO category : categories) {
      category.setStoreNo(dto.getStoreNo());
      category.setParentCategoryId(serviceId); // 서비스 ID를 카테고리에 설정
      int serviceId2 = adminReservationService.setMainCategory2(category); // 중분류 insert
      System.out.println("중분류 카테고리 삽입 후 " + serviceId2);
      adminReservationService.setMainCategory3(category); // 중분류 상태 insert


      //subCategory 배열 들어감

//      System.out.println(subCategories);

      if (category.getSubCategoryType().equals("SELECTN") || category.getSubCategoryType().equals("SELECT1") ) {
        System.out.println(category.getSubCategories());
        List<adminReservationDTO> subCategories = category.getSubCategories();
        for (adminReservationDTO subcategory : subCategories) {
          System.out.println(subcategory);
          subcategory.setStoreNo(dto.getStoreNo());
          subcategory.setParentCategoryId(serviceId2); // 삽입된 중분류 아이디를 부모 아이디로 가지고 감
          adminReservationService.setMainCategory4(subcategory); // 소분류 insert
          System.out.println("소분류 삽입됨");
        }
      }

    }
    // 소분류 카테고리
    return serviceId;

  }



  @PostMapping("/setMainCategory")
  public int setMainCategory(@RequestBody adminReserveAdd dto) {

    System.out.println(dto);

    adminReservationDTO dto2 = new adminReservationDTO();
    dto2.setServiceName(dto.getServiceName());
    dto2.setServicePrice(dto.getServicePrice());
    dto2.setServiceContent(dto.getServiceContent());
    dto2.setServiceStart(dto.getServiceStart());
    dto2.setStoreNo(dto.getStoreNo());

    // 대분류 카테고리
    int serviceId = adminReservationService.setMainCategory(dto2); // 대분류 insert
    System.out.println("메인 카테고리 삽입 후 아이디  : " + serviceId);

    adminReserveAdd dtoSlot = new adminReserveAdd();
    dtoSlot = dto;
    dtoSlot.setCategoryId(serviceId);
    dtoSlot.setStoreNo(dto.getStoreNo());
    System.out.println(dtoSlot);

    adminReservationService.setSlotAll(dtoSlot); // 서비스 슬롯 삽입


    // 중분류 카테고리
    List<adminRSDTO> categories = dto.getCategories();
    for (adminRSDTO category : categories) {
      category.setStoreNo(dto.getStoreNo());
      category.setParentCategoryId(serviceId); // 서비스 ID를 카테고리에 설정
      int serviceId2 = adminReservationService.setMainCategory2(category); // 중분류 insert
      System.out.println("중분류 카테고리 삽입 후 " + serviceId2);
      adminReservationService.setMainCategory3(category); // 중분류 상태 insert 

      System.out.println(category.getSubCategories());
      List<adminReservationDTO> subCategories = category.getSubCategories();
      //subCategory 배열 들어감

      System.out.println(subCategories);

      for (adminReservationDTO subcategory : subCategories) {
        System.out.println(subcategory);
        subcategory.setStoreNo(dto.getStoreNo());
        subcategory.setParentCategoryId(serviceId2); // 삽입된 중분류 아이디를 부모 아이디로 가지고 감
        adminReservationService.setMainCategory4(subcategory); // 소분류 insert
        System.out.println("중분류 삽입됨");
      }
    }
    // 소분류 카테고리
    return serviceId;

  }



  @PostMapping("/setCategory")
  public void setCategory(@RequestBody adminReservationDTO dto) {
    adminReservationService.setCategory(dto);
  }

  //예약 상태 변경
  @PostMapping("/updateStatus")
  public void updateStatus(@RequestBody UpdateReservationStatusDTO dto) {
    adminReservationService.updateStatus(dto);
  }

  //사진등록
  @PostMapping("/setMainCategoryImg")
    public void setMainCategoryImg(@RequestParam("dataUrl") String dataUrl,  @RequestParam("category_id") int categoryId) {
    System.out.println("이미지삽입하기" + dataUrl + categoryId);
      adminReservationService.setMainCategoryImg(dataUrl, categoryId);
    }




}
