package com.example.HiMade.admin.serviceImpl;

import com.example.HiMade.admin.dto.*;
import com.example.HiMade.admin.mapper.AdminReservationMapper;
import com.example.HiMade.admin.service.AdminReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.awt.*;
import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service("AdminReservationService")
public class AdminReservationServiceImpl implements AdminReservationService {

  @Autowired
  AdminReservationMapper adminReservationMapper;

  @Autowired
  private ServletContext servletContext;

  @Override
  public List<adminReservationDTO> getList(int storeNo) {
    return adminReservationMapper.getList(storeNo);
  }

  @Override
  public void setCategory(adminReservationDTO dto) {
      adminReservationMapper.setCategory(dto);
  }

  @Override
  public adminReservationDTO getListDetail(int id) {
    return adminReservationMapper.getListDetail(id);
  }

  @Override
  public List<adminRSDTO> getMiddleItem(int id) {

    List<adminRSDTO> dto = adminReservationMapper.getMiddleItem(id);
    System.out.println("service dto ::  " + dto );

    for (adminRSDTO d : dto ){
      System.out.println(d);
      System.out.println();
      d.setSubCategories(adminReservationMapper.getSubItem(d.getCategoryId()));
    }

    System.out.println(dto);
    return dto;
  }

  @Override
  public Integer setMainCategory(adminReservationDTO dto) {
//    adminReservationMapper.setActivated(id);
    adminReservationMapper.setMainCategory(dto);

    return dto.getCategoryId();
  }

  @Override
  public int setMainCategory2(adminRSDTO dto) {
       adminReservationMapper.setMainCategory2(dto);
       return dto.getMiddleId();
  }

  @Override
  public void setMainCategory3(adminRSDTO dto) {
    adminReservationMapper.setMainCategory3(dto);
  }

  @Override
  public void setMainCategory4(adminReservationDTO dto) {
    adminReservationMapper.setMainCategory4(dto);
  }

  @Override
  public void setCategoryDel(int id) {
    adminReservationMapper.setSlotDel(id);
    adminReservationMapper.setCategoryDel(id);
  }

  @Override
  public void setSlotAll(adminReserveAdd dto) {

      LocalDate startDate = LocalDate.now();
      LocalDate endDate = LocalDate.of(2029, 12, 31);

      while (!startDate.isAfter(endDate)) {
        System.out.println(startDate);
        dto.setReservationSlotDate(startDate);
        adminReservationMapper.setSlotAll(dto);
        startDate = startDate.plusDays(1);
      }

//    LocalDateTime startDate2 = LocalDateTime.now();
//    LocalDateTime endDate2 = dto.getServiceStart();
////    오늘~스타트데이트
//    while (!startDate2.isAfter(endDate2)) {
//      dto.setReservationSlotDate(startDate);
//      adminReservationMapper.setSlotActivated(dto);
//      startDate = startDate.plusDays(1);
//    }


  }

  @Override
  public List<adminReserveMangeDTO> getManageList(int storeNo) {
    return adminReservationMapper.getManageList(storeNo);
  }

  @Override
  public List<adminReserveMangeDTO> getManageFilterList(int storeNo) {
    return adminReservationMapper.getManageFilterList(storeNo);
  }

  @Override
  public List<adminManagerCalDTO> getManageCalender(int storeNo) {
    return adminReservationMapper.getManageCalender(storeNo);
  }

  @Override
  public List<priceMonthDTO> priceMonth(int id, int year) {
    return adminReservationMapper.priceMonth(id, year);
  }

  @Override
  public List<priceMonthDTO> priceDay(int id, int year, int month) {
    return adminReservationMapper.priceDay(id, year, month);
  }

  @Transactional
  @Override
  public void saveOrder(List<adminReservationDTO> orderedList) {

      for (adminReservationDTO r : orderedList) {
        adminReservationMapper.updateOrder(r);
      }


//    adminReservationMapper.updateOrder(orderedList);
  }

  //예약 상태 변경
  @Override
  public void updateStatus(UpdateReservationStatusDTO dto) {
    adminReservationMapper.updateStatus(dto);
  }

  @Override
  public void setMainCategoryImg(String file, int categoryId) {

//      String imageUrl = null;
//
//      try {
//        String uploadDir = "C:/Users/user/Desktop/HiMade/src/main/resources/static/uploads";
//
//// 원하는 경로로 변경
//        File dir = new File(uploadDir);
//        if (!dir.exists()) {
//          dir.mkdirs(); // 디렉토리가 존재하지 않으면 생성
//        }
//
//        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
//        File uploadFile = new File(uploadDir + "/" + fileName); // 파일 경로 설정
//        file.transferTo(uploadFile); // 파일 저장
//
//        // URL 반환
//        imageUrl = "http://localhost:8585/uploads/" + fileName; // 로컬 개발 환경
//        // imageUrl = "https://example.com/uploads/" + fileName; // 운영 환경
//      } catch (Exception e) {
//        e.printStackTrace();
//      }
//
      AdminCategoryImgDTO dto = new AdminCategoryImgDTO();
      dto.setImageUrl(file);
      dto.setCategoryId(categoryId);

      adminReservationMapper.setMainCategoryImg(dto);
  }

  @Override
  public void setActivated(int id) {
    adminReservationMapper.setActivated(id);
  }

  @Override
  public void setSlotModi(int id, int realId) {
    adminReservationMapper.setSlotModi(id, realId);
  }


}
