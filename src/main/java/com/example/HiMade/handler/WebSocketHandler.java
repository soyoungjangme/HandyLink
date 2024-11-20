package com.example.HiMade.handler;

import com.example.HiMade.user.service.UserAccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.CloseStatus;

import javax.servlet.http.HttpSession;
import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

    // 사용자 ID별로 여러 개의 WebSocket 세션을 관리하는 Map
@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final ConcurrentHashMap<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Set<WebSocketSession>> storeSessions = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserAccountService userAccountService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserIdFromSession(session);
        String storeNo = extractStoreNoFromSession(session);

        System.out.println("웹 소켓 연결 시도" + session.getId());
        System.out.println("extractUserIdFromSession 결과 " + userId);
        System.out.println("extractStoreNoFromSession 결과 " + storeNo);

        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            System.out.println("웹소켓 연결된 user ID : " + userId);
        } else if (storeNo != null) {
            storeSessions.computeIfAbsent(storeNo, k -> ConcurrentHashMap.newKeySet()).add(session);
            System.out.println("웹소켓 연결된 store ID: " + storeNo);
        } else {
            session.close();
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String userId = (String) payload.get("userId");
        String storeNo = (String) payload.get("storeNo");
        String senderType = (String) payload.get("senderType");

        if ("USER".equals(senderType)) {
            // 사용자가 보낸 메시지
            Set<WebSocketSession> targetStoreSessions = storeSessions.get(storeNo);  // 변경된 부분
            if (targetStoreSessions != null) {
                sendMessageToSessions(targetStoreSessions, message, "store " + storeNo);
            }

            Set<WebSocketSession> senderSessions = userSessions.get(userId);
            if (senderSessions != null) {
                sendMessageToSessions(senderSessions, message, "user " + userId);
            }
        } else {
            // 스토어가 보낸 메시지
            Set<WebSocketSession> targetUserSessions = userSessions.get(userId);
            if (targetUserSessions != null) {
                sendMessageToSessions(targetUserSessions, message, "user " + userId);
            }

            Set<WebSocketSession> senderStoreSessions = storeSessions.get(storeNo);
            if (senderStoreSessions != null) {
                sendMessageToSessions(senderStoreSessions, message, "store " + storeNo);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 닫힌 세션을 모든 사용자 세션 목록에서 제거
        userSessions.forEach((userId, sessions) -> sessions.remove(session));

        // 빈 세션 목록 제거
        userSessions.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        System.out.println("웹 소켓 연결 종료 : " + session.getId());
    }

    private void sendMessageToSessions(Set<WebSocketSession> sessions, TextMessage message, String recipient) {
        sessions.forEach(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(message);
                    System.out.println("메세지 전송 성공 " + recipient);
                }
            } catch (Exception e) {
                System.err.println("메세지 전송 실패 " + recipient + ": " + e.getMessage());
            }
        });
    }

    private String extractUserIdFromSession(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal != null) {
            return principal.getName();
        }
        return null;
    }

    private String extractStoreNoFromSession(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        System.out.println("세션 속성 확인: " + attributes);

        // 직접 attributes에서 storeNo 가져오기 시도
        Object storeNo = attributes.get("storeNo");
        if (storeNo != null) {
            System.out.println("직접 storeNo 찾음: " + storeNo);
            return storeNo.toString();
        }

        System.out.println("HTTP.SESSION 찾기 시도");

        // 기존 방식 유지
        HttpSession httpSession = (HttpSession) attributes.get("HTTP.SESSION");
        if (httpSession != null) {
            storeNo = httpSession.getAttribute("storeNo");
            System.out.println("HTTP Session에서 storeNo 찾음: " + storeNo);
            return storeNo != null ? storeNo.toString() : null;
        }

        return null;
    }
    }

