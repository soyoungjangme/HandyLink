package com.example.HiMade.admin.serviceImpl;

import com.example.HiMade.admin.dto.AdminChatDTO;
import com.example.HiMade.admin.mapper.AdminChatMapper;
import com.example.HiMade.admin.service.AdminChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Service
public class AdminChatServiceImpl implements AdminChatService {

    @Autowired
    private AdminChatMapper adminChatMapper;

    @Override
    public List<AdminChatDTO> getChatHistory(String userId, Long storeNo, int limit) {
        return adminChatMapper.fetchChatHistory(userId, storeNo, limit);
    }

    @Override
    public void saveChatMessage(AdminChatDTO adminChatDTO) {
        // 메시지 저장
        adminChatMapper.insertChatMessage(adminChatDTO);

        // actived 상태 확인 후 재활성화
        Map<String, Object> chatStatus = adminChatMapper.getChatRoomStatus(
                adminChatDTO.getUserId(),
                adminChatDTO.getStoreNo()
        );

        // chatStatus가 null이 아니고 actived가 'N'인 경우 재활성화
        if (chatStatus != null && "N".equals(chatStatus.get("actived"))) {
            adminChatMapper.reactivateChat(adminChatDTO.getUserId(), adminChatDTO.getStoreNo());
        }
    }

    @Override
    public List<Map<String, Object>> getChatListForStore(Long storeNo) {
        return adminChatMapper.getChatListForStore(storeNo);
    }

    @Override
    public void updateLastCheckedTime(String userId, Long storeNo) {
        adminChatMapper.updateLastCheckedTime(userId, storeNo);
    }
}
