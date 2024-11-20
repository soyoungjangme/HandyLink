package com.example.HiMade.user.service;

import com.example.HiMade.user.dto.UserDTO;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import javax.servlet.http.HttpSession;

public interface UserAccountService {
    void insertUser(UserDTO userDTO);
    boolean checkId(String userId);
    UserDTO getUserById(String userId);
    void updateUser(UserDTO userDTO);
    String getKakaoAccessToken(String code, String redirectUri);
    UserDTO getKakaoUserInfo(String accessToken);
    String findUserId(String userName, String phonenum);
    boolean verifyUserForPasswordReset(String userId, String userName, String phonenum);
    void resetPassword(String userId, String newPassword);
    boolean deleteUser(String userId, String password);
    boolean deleteKakaoUser(String userId, String accessToken, String confirmationText) throws Exception;


}
