package com.example.HiMade.user.controller.StoreController;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.user.dto.UserDTO;
import com.example.HiMade.user.dto.UserLikesDTO;
import com.example.HiMade.user.service.UserStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userStoreList")
public class UserStoreListController {

    @Autowired
    @Qualifier("UserStoreService")
    private UserStoreService userStoreService;

    //가게 찜하기
    @PostMapping("/storeLike")
    public ResponseEntity<Void> clickLike(@RequestBody UserLikesDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String userId = auth.getName();
            dto.setUserId(userId);
            userStoreService.clickLike(dto);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }


    //찜 데이터 가져오기
    @GetMapping("/getLike")
    public ResponseEntity<List<UserLikesDTO>> getLike() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String userId = auth.getName(); // 로그인한 사용자 ID
            List<UserLikesDTO> likes = userStoreService.getLike(userId);

            // likes가 null이면 빈 리스트로 처리
            if (likes == null) {
                likes = new ArrayList<>();
            }

            return ResponseEntity.ok(likes); // 항상 200 상태로 응답
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // 인증되지 않은 사용자
        }
    }

    //찜리스트 가게정보 가져오기
    @GetMapping("/getLikeInfo")
    public ResponseEntity<List<Map<String ,Object>>> getLikeInfo(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String userId = auth.getName(); // 로그인한 사용자 ID
            List<Map<String ,Object>> listInfo = userStoreService.getLikeInfo(userId);

            if(listInfo == null){
                listInfo = new ArrayList<>();
            }

            return ResponseEntity.ok(listInfo);

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

}
