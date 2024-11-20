package com.example.HiMade.user.controller.UserController;

import com.example.HiMade.user.service.UserAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.HiMade.user.dto.UserDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.View;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;


@RestController
@RequestMapping("/kakao")
public class UserSocialController {

    private static final Logger logger = LoggerFactory.getLogger(UserAccountController.class);

    @Autowired
    private UserAccountService userAccountService;
    @Autowired
    private View error;

    // 카카오 회원가입 처리
    @PostMapping("/signup")
    public ResponseEntity<String> kakaoSignUp(@RequestBody UserDTO userDTO, HttpSession session) {
        try {
            //logger.info("컨트롤러로 넘어온 userDTO: {}", userDTO);

            // 세션에서 카카오 사용자 정보 가져오기
            UserDTO kakaoUser = (UserDTO) session.getAttribute("kakaoUser");
            //logger.info("세션에서 가져온 카카오 사용자 정보: {}", kakaoUser); // 아이디, 이름, 프로필 넘어옴

            if (kakaoUser == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("카카오 사용자 정보가 없습니다.");
            }

            // 카카오에서 넘겨준 사용자 정보로 UserDTO 일부 세팅
            userDTO.setUserId(kakaoUser.getUserId());
            userDTO.setUserName(kakaoUser.getUserName());
            userDTO.setUserImgUrl(kakaoUser.getUserImgUrl());
            userDTO.setLoginType("KAKAO");  // 카카오 로그인 타입 설정

            // 유저 등록
            logger.info("등록할 사용자 정보: {}", userDTO);
            userAccountService.insertUser(userDTO);

            // 세션에서 카카오 사용자 정보 제거
            session.removeAttribute("kakaoUser");

            return ResponseEntity.ok("카카오 회원가입이 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            logger.error("카카오 회원가입 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("카카오 회원가입 중 오류 발생");
        }
    }

    // 카카오 로그인
    @GetMapping("/login/oauth2")
    public void kakaoLogin(@RequestParam String code, HttpSession session,
                           HttpServletRequest request, HttpServletResponse response) {
        try {
            // 현재 요청의 호스트를 가져와서 동적으로 리다이렉트 URI 생성
            String serverHost = request.getServerName();
            String redirectUri = "http://" + serverHost + ":8585/kakao/login/oauth2";

            // 1. 카카오 인가 코드를 통해 액세스 토큰을 요청 (리다이렉트 URI 전달)
            String accessToken = userAccountService.getKakaoAccessToken(code, redirectUri);
            logger.info("로그 Access Token: {}", accessToken);

            // 나머지 코드는 동일
            // 2. 액세스 토큰으로 카카오 사용자 정보 요청
            UserDTO kakaoUser = userAccountService.getKakaoUserInfo(accessToken);
            logger.info("로그 Kakao User Info: {}", kakaoUser);

            // 3. 사용자 정보가 DB에 있는지 확인
            UserDTO existingUser = userAccountService.getUserById(kakaoUser.getUserId());
            if (existingUser == null) {
                kakaoUser.setLoginType("KAKAO");
                session.setAttribute("kakaoUser", kakaoUser);
                session.setAttribute("kakaoAccessToken", accessToken);
                response.sendRedirect("/UserSignUp.user?kakao=true");
            } else {
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        existingUser.getUserId(), null, AuthorityUtils.createAuthorityList("ROLE_USER"));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
                session.setAttribute("kakaoAccessToken", accessToken);
                response.sendRedirect("/UserMain.user?accessToken=" + accessToken);
            }
        } catch (Exception e) {
            logger.error("카카오 로그인 처리 중 오류 발생: {}", e.getMessage(), e);
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "카카오 로그인 처리 중 오류 발생");
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }

    // 카카오 회원가입 시 정보 조회
    @GetMapping("/info")
    public ResponseEntity<UserDTO> getKakaoUserInfo(HttpSession session) {
        UserDTO kakaoUser = (UserDTO) session.getAttribute("kakaoUser");

        if (kakaoUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        logger.error("카카오 회원 가입 오류", error);
        return ResponseEntity.ok(kakaoUser);
    }

    // 로그아웃
    @GetMapping("/logout")
    public ResponseEntity<?> kakaoLogout(HttpSession session) {
        // Spring Security 세션 및 전체 Http 세션 무효화
        SecurityContextHolder.clearContext();
        session.invalidate();

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "/UserMain.user")
                .build();
    }

    // 토큰 조회
    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getKakaoToken(HttpSession session) {
        String accessToken = (String) session.getAttribute("kakaoAccessToken");
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    // 탈퇴
    @PostMapping("/delete")
    public ResponseEntity<?> deleteKakaoUser(@RequestBody Map<String, String> payload, HttpSession session) {
        String confirmationText = payload.get("confirmationText");

        try {
            if (!"delete".equalsIgnoreCase(confirmationText)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "올바른 텍스트를 입력해 주세요."));
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();

            // DB에서 회원 정보 삭제
            userAccountService.deleteKakaoUser(userId, null, confirmationText);

            // Spring Security 컨텍스트 및 세션 정리
            SecurityContextHolder.clearContext();
            session.invalidate();

            return ResponseEntity.ok(Map.of("message", "탈퇴가 완료되었습니다."));
        } catch (Exception e) {
            logger.error("카카오 회원 탈퇴 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "탈퇴 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }




}
