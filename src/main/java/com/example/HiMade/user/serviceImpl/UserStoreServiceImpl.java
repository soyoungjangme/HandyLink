package com.example.HiMade.user.serviceImpl;


import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.UserCateDTO;
import com.example.HiMade.user.dto.UserLikesDTO;
import com.example.HiMade.user.mapper.UserReservationMapper;
import com.example.HiMade.user.mapper.UserStoreMapper;
import com.example.HiMade.user.service.UserStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service("UserStoreService")
public class UserStoreServiceImpl implements UserStoreService {

  @Autowired
  UserStoreMapper userStoreMapper;

  @Override
  public List<UserCateDTO> getStoreMainCategory(int id) {

    return userStoreMapper.getStoreMainCategory(id);
  }

  @Override
  public UserCateDTO getStoreMainCategory2(int id) {
    return userStoreMapper.getStoreMainCategory2(id);
  }

  @Override
  public StoreRegistDTO getStoreInfo(int id) {
    return userStoreMapper.getStoreInfo(id);
  }

  @Override
  public void clickLike(UserLikesDTO userLikesDTO) {
    String userId = userLikesDTO.getUserId();
    Long storeNo = userLikesDTO.getStoreNo();

    //동일한 찜이 있는지 확인
    Integer existing = userStoreMapper.existingLike(userId,storeNo);

    if(existing > 0){ //이미 있으면 찜 삭제
      userStoreMapper.deleteLike(userId,storeNo);

    }else { //비어있으면 찜
      userStoreMapper.clickLike(userLikesDTO);
    }
  }

  @Override
  public List<UserLikesDTO> getLike(String userId) {
    return userStoreMapper.getLike(userId);
  }

  @Override
  public List<Map<String, Object>> getLikeInfo(String userId) {
    return userStoreMapper.getLikeInfo(userId);
  }
}
