package com.example.HiMade.user.serviceImpl;

import com.example.HiMade.user.dto.UserDTO;
import com.example.HiMade.user.mapper.UserAccountMapper;
import com.example.HiMade.user.service.UserAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.thymeleaf.ThymeleafProperties;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class UserAccountServiceImpl implements UserAccountService, UserDetailsService {

    private final Dotenv dotenv = Dotenv.load(); // .env 파일 로드
    private final String CLIENT_ID = dotenv.get("REACT_APP_KAKAO_CLIENT_ID");
    private final String REDIRECT_URI = dotenv.get("REACT_APP_KAKAO_REDIRECT_URI");
    private final String KAKAO_TOKEN_URL = dotenv.get("KAKAO_TOKEN_URL");
    private final String KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"; // 사용자 정보 요청 URL

    // 디버그
    private static final Logger logger = LoggerFactory.getLogger(UserAccountServiceImpl.class);

    @Autowired
    private UserAccountMapper userAccountMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // 의존성
    public UserAccountServiceImpl(BCryptPasswordEncoder passwordEncoder, UserAccountMapper userAccountMapper) {
        this.passwordEncoder = passwordEncoder;
        this.userAccountMapper = userAccountMapper;
    }

    // 가입
    @Override
    @Transactional
    public void insertUser(UserDTO userDTO) {
        if ("KAKAO".equals(userDTO.getLoginType())) {
            String randomPassword = UUID.randomUUID().toString(); // 랜덤 값 생성
            String encodedPassword = passwordEncoder.encode(randomPassword); // 암호화 처리
            userDTO.setUserPw(encodedPassword); // 암호화된 비밀번호 설정
        } else if (userDTO.getUserPw() != null && !userDTO.getUserPw().isEmpty()) {
            // 일반 사용자의 경우 비밀번호가 제공되면 암호화
            String encodedPassword = passwordEncoder.encode(userDTO.getUserPw());
            userDTO.setUserPw(encodedPassword);
        } else {
            // 비밀번호가 제공되지 않은 경우 (예외 처리)
            throw new IllegalArgumentException("비밀번호가 제공되지 않았습니다.");
        }

        userAccountMapper.insertUser(userDTO); // 유저 등록
    }

    // 중복 체크
    @Override
    public boolean checkId(String userId) {
        return userAccountMapper.checkId(userId) > 0; // 이메일 중복 시 true 반환
    }

    // 유저 조회
    @Override
    public UserDTO getUserById(String userId) {
        return userAccountMapper.getUserById(userId);
    }

    // 유저 수정
    @Override
    public void updateUser(UserDTO userDTO) {
        // 비밀번호가 있는 경우 암호화
        if (userDTO.getUserPw() != null && !userDTO.getUserPw().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(userDTO.getUserPw());
            userDTO.setUserPw(encodedPassword);
        }

        userAccountMapper.updateUser(userDTO);
    }


    // 시큐리티 통한 사용자 인증 및 권한 부여
    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        UserDTO user = userAccountMapper.getUserById(userId);

        if (user == null) {
            logger.error("유저를 찾을 수 없음: {}", userId);
            throw new UsernameNotFoundException("찾을 수 없는 유저 : " + userId);
        }

//        // 탈퇴 상태 확인: user_id에 "(del)"이 포함된 경우 로그인 불가
//        if (user.getUserId().contains("(del)")) {
//            logger.warn("탈퇴된 계정으로 로그인 시도: {}", userId);
//            throw new BadCredentialsException("탈퇴된 계정입니다.");
//        }

        // 탈퇴 상태 확인
        if ("N".equals(user.getUserStatus())) {
            logger.warn("탈퇴된 계정으로 로그인 시도: {}", userId);
            throw new BadCredentialsException("탈퇴된 계정입니다.");
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        // 비밀번호가 암호화된 상태로 User 객체 생성
        return new User(user.getUserId(), user.getUserPw(), authorities);
    }

    // 카카오 토큰 발행
    @Override
    public String getKakaoAccessToken(String code, String redirectUri) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", CLIENT_ID);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(KAKAO_TOKEN_URL, request, Map.class);

        System.out.println("로그 Kakao token URL: " + KAKAO_TOKEN_URL);
        System.out.println("로그 Request body: " + body);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            logger.info("카카오 토큰 응답: {}", responseBody);

            return (String) responseBody.get("access_token");
        }
        return null;
    }

    // 카카오 유저 조회
    @Override
    public UserDTO getKakaoUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(KAKAO_USERINFO_URL, HttpMethod.GET, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            Map<String, Object> kakaoAccount = (Map<String, Object>) responseBody.get("kakao_account");
            Map<String, Object> properties = (Map<String, Object>) responseBody.get("properties");

            logger.info("카카오 사용자 정보 응답: {}", responseBody);


            // 카카오에서 제공하는 사용자 정보
            String kakaoId = String.valueOf(responseBody.get("id"));
            String nickname = (String) properties.get("nickname");
            String profileImage = (String) properties.get("profile_image");

            // UserDTO로 변환
            return UserDTO.builder()
                    .userId(kakaoId)
                    .userName(nickname)
                    .userImgUrl(profileImage)
                    .build();
        }
        return null;
    }

    // 아이디 찾기
    @Override
    public String findUserId(String userName, String phonenum) {
        return userAccountMapper.findUserIdByNameAndPhone(userName, phonenum);
    }

    // 비밀번호 찾기
    @Override
    public boolean verifyUserForPasswordReset(String userId, String userName, String phonenum) {
        return userAccountMapper.verifyUserForPasswordReset(userId, userName, phonenum) > 0;
    }

    // 비밀번호 찾기를 통한 변경
    @Override
    @Transactional
    public void resetPassword(String userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        userAccountMapper.updatePassword(userId, encodedPassword);
    }

    // 일반 탈퇴
    @Override
    @Transactional
    public boolean deleteUser(String userId, String password) {
        UserDTO user = userAccountMapper.getUserById(userId);
        if (user == null || !passwordEncoder.matches(password, user.getUserPw())) {
            return false;
        }

        try {
            // ID 처리 (예시 - DEL(20241106)_test@naver.com로 업데이트 처리)
            String deletedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String newUserId = String.format("DEL(%s)_%s", deletedAt, userId);

            Map<String, String> params = new HashMap<>();
            params.put("originalUserId", userId);
            params.put("newUserId", newUserId);

            userAccountMapper.deleteUser(params);
            logger.info("회원 탈퇴 처리 완료 - 기존 ID: {}, 변경된 ID: {}", userId, newUserId);
            return true;
        } catch (Exception e) {
            logger.error("회원 탈퇴 처리 중 오류 발생", e);
            throw new RuntimeException("회원 탈퇴 처리 중 오류가 발생했습니다.", e);
        }
    }

    // 카카오 탈퇴
    @Override
    @Transactional
    public boolean deleteKakaoUser(String userId, String accessToken, String confirmationText) throws Exception {
        UserDTO user = userAccountMapper.getUserById(userId);

        if (user == null || !"KAKAO".equals(user.getLoginType())) {
            throw new IllegalArgumentException("카카오 회원이 아니거나 존재하지 않는 회원입니다.");
        }

        // 입력된 텍스트 검증
        if (!"delete".equalsIgnoreCase(confirmationText)) {
            throw new IllegalArgumentException("올바른 텍스트를 입력해 주세요.");
        }

        // 1. 카카오 연결 해제 API 호출
        if (accessToken != null) {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.postForEntity("https://kapi.kakao.com/v1/user/unlink", request, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("카카오 연결 해제에 실패했습니다.");
            }
        }

        String deletedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String newUserId = String.format("DEL(%s)_%s", deletedAt, userId);

        Map<String, String> params = new HashMap<>();
        params.put("originalUserId", userId);
        params.put("newUserId", newUserId);

        userAccountMapper.deleteUser(params);

        logger.info("카카오 회원 탈퇴 처리 완료 - 기존 ID: {}, 변경된 ID: {}", userId, newUserId);
        return true;
    }



}
