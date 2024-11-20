package com.example.HiMade.user.service;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.UserCateDTO;
import com.example.HiMade.user.dto.UserLikesDTO;

import java.util.List;
import java.util.Map;

public interface UserStoreService {

  public List<UserCateDTO> getStoreMainCategory(int id);
  public UserCateDTO getStoreMainCategory2(int id);
  public StoreRegistDTO getStoreInfo(int id);
  public void clickLike(UserLikesDTO userLikesDTO); //가게찜
  public List<UserLikesDTO> getLike(String userId); //찜 데이터 가져오기
  public List<Map<String ,Object>> getLikeInfo(String userId); //찜 가게정보 가져오기
}
