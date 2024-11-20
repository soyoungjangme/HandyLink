package com.example.HiMade.user.mapper;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.UserCateDTO;
import com.example.HiMade.user.dto.UserLikesDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserStoreMapper {
  public List<UserCateDTO> getStoreMainCategory(int id);
  public UserCateDTO getStoreMainCategory2(int id);
  public StoreRegistDTO getStoreInfo(int id);
  public void clickLike(UserLikesDTO userLikesDTO); //가게찜
  public void deleteLike(@Param("userId") String userId,@Param("storeNo") Long storeNo); //가게찜-삭제
  public Integer existingLike(@Param("userId") String userId,@Param("storeNo") Long storeNo); //가게찜-삭제
  public List<UserLikesDTO> getLike(String userId); //찜 데이터 가져오기
  public List<Map<String ,Object>> getLikeInfo(String userId); //찜 가게정보 가져오기

}
