package com.example.HiMade.user.mapper;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.ChatStatusDTO;
import com.example.HiMade.user.dto.UserChatDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Mapper
public interface UserChatRoomMapper {
    void insertChat(UserChatDTO userChatDTO);
    List<UserChatDTO> selectChat(String userId, Long storeNo);
    List<Map<String, Object>> getChatListForUser(String userId);
    StoreRegistDTO getStoreInfoByStoreNo(Long storeNo);
    void updateUserLastCheckedTime(String userId, Long storeNo, Timestamp lastCheckedTime );
    boolean hasUnreadMessages(String userId);
    void deactivateChat(String userId, Long storeNo);
    void reactivateChat(String userId, Long storeNo);
    Map<String, Object> getChatRoomStatus(String userId, Long storeNo);
    void insertChatRoomStatus (String userId, Long storeNo, Timestamp userLastCheckedTime);
}
