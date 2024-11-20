package com.example.HiMade.admin.service;

import com.example.HiMade.admin.dto.*;
import com.example.HiMade.user.entity.Reservation;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminReservationService
{
  public List<adminReservationDTO> getList(int storeNo);
  public void setCategory(adminReservationDTO dto);
  public  adminReservationDTO  getListDetail(int id);
  public  List<adminRSDTO> getMiddleItem(int id);

  public Integer setMainCategory(adminReservationDTO dto);
  public int setMainCategory2(adminRSDTO dto);
  public void setMainCategory3(adminRSDTO dto);
  public void setMainCategory4(adminReservationDTO dto);

  void setCategoryDel(int id);
  void setSlotAll(adminReserveAdd dto); // 슬롯 삽입

  public List<adminReserveMangeDTO> getManageList(int storeNo);
  public List<adminReserveMangeDTO> getManageFilterList(int storeNo);
  public List<adminManagerCalDTO> getManageCalender(int storeNo);

  List<priceMonthDTO> priceMonth(int id, int year);
  List<priceMonthDTO> priceDay(int id, int year, int month);
  public void saveOrder(List<adminReservationDTO> orderedList);
  //예약 상태 변경
  void updateStatus(UpdateReservationStatusDTO dto);

  //서비스 별 사진 등록
  public void setMainCategoryImg(String file, int categoryId);
  void setActivated(int id);
  void setSlotModi(int id,  int realId);
}
