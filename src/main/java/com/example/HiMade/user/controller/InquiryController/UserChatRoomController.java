package com.example.HiMade.user.controller.InquiryController;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.ChatStatusDTO;
import com.example.HiMade.user.dto.UserChatDTO;
import com.example.HiMade.user.service.UserChatRoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class UserChatRoomController {

    private static final Logger logger = LoggerFactory.getLogger(UserChatRoomController.class);

    @Autowired
    private UserChatRoomService userChatRoomService;

    // 메세지 DB에 저장하기
    @PostMapping("/save")
    public ResponseEntity<?> saveMessage(@RequestBody UserChatDTO userChatDTO) {
        logger.info("로그 컨트롤러 Received message data: {}", userChatDTO);

        try {
            logger.info("메시지 저장 시도: {}", userChatDTO);

            // insertChat 내부에서 채팅방 재활성화 처리
            userChatRoomService.insertChat(userChatDTO);
            logger.info("메세지 저장 및 채팅방 상태 처리 완료");

            // 채팅 목록 새로고침을 위한 데이터 반환
            String receiverId = "USER".equals(userChatDTO.getSenderType())
                    ? userChatDTO.getStoreId()
                    : userChatDTO.getUserId();

            List<Map<String, Object>> updatedChatList =
                    userChatRoomService.getChatListForUser(receiverId);

            return ResponseEntity.ok(updatedChatList);
        } catch (Exception e) {
            logger.error("메시지 저장 중 오류 발생", e);
            return ResponseEntity.status(500)
                    .body("메시지 저장 중 오류가 발생했습니다.");
        }
    }

    // 기존 채팅 기록 불러오기
    @GetMapping("/history")
    public List<UserChatDTO> getChatHistory(@RequestParam String userId, @RequestParam Long storeNo) {
        logger.info("로그 Fetching chat history for userId: {} and storeNo: {}", userId, storeNo);
        return userChatRoomService.selectChat(userId, storeNo);
    }

    // 현재 로그인된 사용자 확인
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.ok(Map.of("userId", auth.getName()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 채팅 목록 불러오기
    @GetMapping("/list")
    public ResponseEntity<?> getChatList(@RequestParam String userId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!auth.getName().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("접근 권한이 없습니다.");
            }

            List<Map<String, Object>> chatList = userChatRoomService.getChatListForUser(userId);

            // 전체 데이터 구조 확인
            for (Map<String, Object> chat : chatList) {
                logger.info("채팅방 데이터: {}", chat.toString());
            }

            return ResponseEntity.ok(chatList);
        } catch (Exception e) {
            logger.error("채팅 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("채팅 목록을 불러오는 중 오류가 발생했습니다.");
        }
    }

    @GetMapping("/getStoreInfoByStoreNo/{storeNo}")
    public ResponseEntity<StoreRegistDTO> getStoreInfoByStoreNo(@PathVariable Long storeNo) {
        System.out.println("가게 정보 띄우기" + userChatRoomService.getStoreInfoByStoreNo(storeNo));
        StoreRegistDTO storeInfo = userChatRoomService.getStoreInfoByStoreNo(storeNo);
        if (storeInfo != null) {
            return ResponseEntity.ok(storeInfo);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 마지막 채팅 확인 시간
    @PostMapping("/updateLastCheckedTime")
    public ResponseEntity<Void> updateLastCheckedTime(@RequestParam Long storeNo, @RequestParam String userId) {
        Timestamp lastCheckedTime = Timestamp.valueOf(LocalDateTime.now()); // 현재 시간을 lastCheckedTime으로 설정
        System.out.println("로그 updateLastCheckedTime - storeNo: " + storeNo + ", userId: " + userId + ", lastCheckedTime: " + lastCheckedTime);
        userChatRoomService.updateLastCheckedTime(userId, storeNo, lastCheckedTime);
        return ResponseEntity.ok().build();
    }

    // 새 메세지 확인
    @GetMapping("/hasNewMessage")
    public ResponseEntity<Boolean> hasNewMessage() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            boolean hasNew = userChatRoomService.hasUnreadMessages(auth.getName());
            return ResponseEntity.ok(hasNew);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 채팅 목록에서 감추기
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteChat(@RequestParam String userId, @RequestParam Long storeNo) {
        try {
            logger.info("삭제 요청: userId={}, storeNo={}", userId, storeNo);
            userChatRoomService.deactivateChat(userId, storeNo); // 채팅방 상태 비활성화
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("채팅방 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @PostMapping("/reactivate")
    public ResponseEntity<Void> reactivateChat(@RequestParam String userId, @RequestParam Long storeNo) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            logger.info("로그 Reactivating chat for userId: {}, storeNo: {}", userId, storeNo);
            try {
                userChatRoomService.reactivateChat(userId, storeNo); // 채팅 상태를 Y로 변경
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                logger.error("채팅방 재활성화 중 오류 발생", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } else {
            // 인증되지 않은 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }



}
