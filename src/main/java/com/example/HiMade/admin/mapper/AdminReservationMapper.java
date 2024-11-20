package com.example.HiMade.admin.mapper;


import com.example.HiMade.admin.dto.*;
import com.example.HiMade.user.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Mapper
public interface AdminReservationMapper {

  public List<adminReservationDTO> getList(int storeNo);
  public void setCategory(adminReservationDTO dto);
  public adminReservationDTO getListDetail(int id);
  public List<adminRSDTO> getMiddleItem(int id);
  public List<adminReservationDTO> getSubItem(int id);
//  public void setMainCategory(adminRSDTO dto);
  public Integer setMainCategory(adminReservationDTO dto);
  public int setMainCategory2(adminRSDTO dto);
  public void setMainCategory3(adminRSDTO dto);
  public void setMainCategory4(adminReservationDTO dto);

  void setActivated(int id);
  void setSlotModi( @Param("id")int id,  @Param("realId") int realId);
  void setSlotAll(adminReserveAdd dto);  // 슬롯 삽입
  void setSlotActivated(adminReserveAdd dto);

  public List<adminReserveMangeDTO> getManageList(int storeNo);
  public List<adminReserveMangeDTO> getManageFilterList(int storeNo);
  public List<adminManagerCalDTO> getManageCalender(int storeNo);

  //예약 상태 변경
  void updateStatus(UpdateReservationStatusDTO dto);
 // 서비스 별 사진 등록
 public void setMainCategoryImg(AdminCategoryImgDTO dto) ;

 void setCategoryDel(int id);
 void setSlotDel(int id);
  void updateOrder(@Param("orderedList") adminReservationDTO r);

  List<priceMonthDTO> priceMonth(@Param("id") int id, @Param("year") int year);
  List<priceMonthDTO> priceDay(@Param("id") int id, @Param("year") int year, @Param("month") int month);


}
