package com.example.HiMade.user.service;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.ChatStatusDTO;
import com.example.HiMade.user.dto.UserChatDTO;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

public interface UserChatRoomService {
    void insertChat(UserChatDTO userChatDTO);
    List<UserChatDTO> selectChat(String userId, Long storeNo);
    List<Map<String, Object>> getChatListForUser(String userId);
    StoreRegistDTO getStoreInfoByStoreNo(Long storeNo);
    void updateLastCheckedTime(String userId, Long storeNo, Timestamp lastCheckedTime);
    boolean hasUnreadMessages(String userId);
    void deactivateChat(String userId, Long storeNo);
    void reactivateChat(String userId, Long storeNo);
}
