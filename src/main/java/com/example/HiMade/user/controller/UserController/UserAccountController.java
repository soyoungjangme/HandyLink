package com.example.HiMade.user.controller.UserController;

import com.example.HiMade.user.dto.UserDTO;
import com.example.HiMade.user.service.UserAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserAccountController {

    private static final Logger logger = LoggerFactory.getLogger(UserAccountController.class);

    @Autowired
    private UserAccountService userAccountService;

    // 이메일 중복 확인
    @GetMapping("/checkId")
    public ResponseEntity<?> checkId(@RequestParam("userId") String userId) {
        boolean isDuplicate = userAccountService.checkId(userId);
        if (isDuplicate) {
            return ResponseEntity.ok().body("{\"isDuplicate\": true}");
        } else {
            return ResponseEntity.ok().body("{\"isDuplicate\": false}");
        }
    }

    // 회원 가입 및 이미지 파일 저장
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody UserDTO userDTO) {
        try {
            userDTO.setLoginType("GENERAL");
            logger.info("회원가입 요청 - 사용자 정보: {}", userDTO);

            // 유저 등록
            userAccountService.insertUser(userDTO);
            return ResponseEntity.ok("회원 가입이 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 오류 발생: " + e.getMessage());
        }
    }

    // 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String userId = auth.getName(); // 로그인한 사용자 ID
            UserDTO user = userAccountService.getUserById(userId);

            if (user != null) {
                // 프로필 이미지 URL 처리
                if ("KAKAO".equals(user.getLoginType())) {
                    // 카카오 가입자는 카카오에서 제공한 URL 그대로 사용할듯?
                }
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDTO> getUserProfileById(@PathVariable String userId) {
        UserDTO user = userAccountService.getUserById(userId);
        if (user != null) {

            // 프로필 이미지 URL 처리
            if ("KAKAO".equals(user.getLoginType())) {
                // 카카오 가입자는 카카오에서 제공한 URL 그대로 사용
            }

            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }


    // 사용자 정보 수정 (비밀번호 포함)
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserDTO userDTO) {
        System.out.println("업데이트할 사용자 정보: " + userDTO.toString());
        try {
            // 비밀번호 및 사용자 정보 업데이트
            userAccountService.updateUser(userDTO);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 정보 수정 중 오류 발생");
        }
    }

    // 아이디 찾기 인증
    @GetMapping("/find-id")
    public ResponseEntity<String> findUserId(@RequestParam String userName, @RequestParam String phonenum) {
        String userId = userAccountService.findUserId(userName, phonenum);

        if (userId != null) {
            String maskedUserId = maskUserId(userId);
            return ResponseEntity.ok(maskedUserId);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 정보로 가입된 사용자가 없습니다.");
        }
    }

    // 아이디 찾기 결과에 * 마스킹 처리
    private String maskUserId(String userId) {
        int atIndex = userId.indexOf('@');
        if (atIndex > 2) { // 아이디가 3자리 이상인 경우
            int maskLength = 2; // 마스킹할 길이 (예: 2자리)
            String visiblePart = userId.substring(0, atIndex - maskLength);
            String maskedPart = "*".repeat(maskLength);
            return visiblePart + maskedPart + userId.substring(atIndex);
        } else if (atIndex > 0) { // 아이디가 1~2자리인 경우 끝자리 마스킹
            return userId.substring(0, atIndex - 1) + "*" + userId.substring(atIndex);
        }
        return userId;
    }

    // 비밀번호 찾기 인증
    @PostMapping("/verify-reset-password")
    public ResponseEntity<?> verifyUserForPasswordReset(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String userName = payload.get("userName");
        String phonenum = payload.get("phonenum");

        boolean isVerified = userAccountService.verifyUserForPasswordReset(userId, userName, phonenum);

        if (isVerified) {
            return ResponseEntity.ok().body("{\"verified\": true}");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"verified\": false, \"message\": \"사용자 정보를 찾을 수 없습니다.\"}");
        }
    }

    // 비밀번호 찾기를 통한 수정
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String newPassword = payload.get("newPassword");

        try {
            userAccountService.resetPassword(userId, newPassword);
            return ResponseEntity.ok().body("{\"success\": true, \"message\": \"비밀번호가 성공적으로 재설정되었습니다.\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"success\": false, \"message\": \"비밀번호 재설정 중 오류가 발생했습니다.\"}");
        }
    }

    // 탈퇴
    @PostMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String, String> payload, HttpSession session) {
        String password = payload.get("password");

        // 현재 로그인한 사용자 ID를 SecurityContext에서 가져오기
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName(); // 인증된 사용자 ID 가져오기

        System.out.println("Controller - deleteUser 호출, userId: " + userId + ", password: " + password);

        boolean isDeleted = userAccountService.deleteUser(userId, password);
        if (isDeleted) {
            SecurityContextHolder.clearContext();
            session.invalidate();
            System.out.println("Controller - deleteUser 성공");
            return ResponseEntity.ok("{\"message\": \"탈퇴가 성공적으로 완료되었습니다.\"}");
        } else {
            System.out.println("Controller - deleteUser 실패");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"비밀번호가 일치하지 않습니다.\"}");
        }
    }
}