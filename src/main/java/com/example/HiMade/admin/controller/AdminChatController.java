package com.example.HiMade.admin.controller;

import com.example.HiMade.admin.dto.AdminChatDTO;
import com.example.HiMade.admin.service.AdminChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/adminChat")
public class AdminChatController {

    @Autowired
    private AdminChatService adminChatService;

    // 채팅 히스토리 가져오기
    @GetMapping("/history")
    public List<AdminChatDTO> getChatHistory(@RequestParam String userId, @RequestParam Long storeNo, @RequestParam int limit) {
        return adminChatService.getChatHistory(userId, storeNo, limit);
    }

    // 새로운 채팅 메시지 저장
    @PostMapping("/save")
    public void saveChatMessage(@RequestBody AdminChatDTO adminChatDTO) {
        adminChatService.saveChatMessage(adminChatDTO);
    }

    // 업체 기준 채팅 목록 조회 (사용자별 최신 메시지)
    @GetMapping("/list")
    public List<Map<String, Object>> getChatListForStore(@RequestParam Long storeNo) {
        return adminChatService.getChatListForStore(storeNo);
    }

    @PostMapping("/updateLastCheckedTime")
    public ResponseEntity<Void> updateLastCheckedTime(@RequestParam Long storeNo, @RequestParam String userId) {
        adminChatService.updateLastCheckedTime(userId, storeNo);
        return ResponseEntity.ok().build();
    }


}
