package com.example.HiMade.admin.service;

import com.example.HiMade.admin.dto.AdminChatDTO;
import com.example.HiMade.user.dto.UserChatDTO;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

public interface AdminChatService {
    List<AdminChatDTO> getChatHistory(String userId, Long storeNo, int limit);
    void saveChatMessage(AdminChatDTO adminChatDTO);
    List<Map<String, Object>> getChatListForStore(Long storeNo);
    void updateLastCheckedTime(String userId, Long storeNo);
}
