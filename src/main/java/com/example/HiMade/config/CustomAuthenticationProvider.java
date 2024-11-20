package com.example.HiMade.config;

import com.example.HiMade.user.dto.UserDTO;
import com.example.HiMade.user.service.UserAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    @Autowired
    private UserAccountService userAccountService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String userId = authentication.getName();
        String password = (String) authentication.getCredentials();

        UserDTO user = userAccountService.getUserById(userId);

        if (user == null) {
            throw new BadCredentialsException("사용자를 찾을 수 없습니다.");
        }

        if ("KAKAO".equals(user.getLoginType())) {
            // 카카오 사용자는 비밀번호 검증 없이 인증
            return new UsernamePasswordAuthenticationToken(user.getUserId(), null, AuthorityUtils.createAuthorityList("ROLE_USER"));
        } else if (passwordEncoder.matches(password, user.getUserPw())) {
            // 일반 사용자의 비밀번호 검증
            return new UsernamePasswordAuthenticationToken(user.getUserId(), password, AuthorityUtils.createAuthorityList("ROLE_USER"));
        } else {
            throw new BadCredentialsException("잘못된 비밀번호입니다.");
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
