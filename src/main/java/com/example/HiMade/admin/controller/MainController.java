package com.example.HiMade.admin.controller;

import com.example.HiMade.admin.dto.StoreRegistDTO;
import com.example.HiMade.admin.service.AdminStoreService;
import com.example.HiMade.user.service.UserChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
public class MainController {

  @Autowired
  @Qualifier("adminStoreService")
  private AdminStoreService adminStoreService;

  @Autowired
  private UserChatRoomService userChatRoomService;

  @GetMapping("/{pageName}.user")
  public String page(@PathVariable String pageName, Model model, @RequestParam (required = false) Long storeNo) {
    model.addAttribute("pageName", pageName);

    if ("UserChatRoom".equals(pageName) && storeNo != null) {
      StoreRegistDTO storeInfo = userChatRoomService.getStoreInfoByStoreNo(storeNo);
      model.addAttribute("pageTitle", storeInfo.getStoreName());

    } else {
      switch (pageName) {
        case "UserSignUp":
          model.addAttribute("pageTitle", "회원가입");
          break;
        case "UserMyReview":
          model.addAttribute("pageTitle", "내 후기");
          break;
        case "UserMyPage":
          model.addAttribute("pageTitle", "내 프로필");
          break;
        case "UserLikeList":
          model.addAttribute("pageTitle", "찜 리스트");
          break;
        case "UserAddressPage":
          model.addAttribute("pageTitle", "배송지 관리");
          break;

        default:
          model.addAttribute("pageTitle", "");
          break;
      }
    }

    System.out.println("뷰이름:" + pageName);

    // 하단바 없는 레이아웃 적용할 페이지
    if ("UserChatRoom".equals(pageName) ||
            "UserSignUp".equals(pageName) ||
            "UserLoginPage".equals(pageName) ||
            "UserMyPage".equals(pageName) ||
            "UserDelete".equals(pageName) ||
            "UserAccountFind".equals(pageName) ||
            "UserSignUpFinish".equals(pageName) ||
            "UserMyReview".equals(pageName) ||
            "UserLikeList".equals(pageName) ||
            "UserAddressPage".equals(pageName)) {
      return "userLayoutNoNav";
    }

    return "userLayout"; // 기본 사용자 레이아웃
  }

  @GetMapping("/{pageName}.admin")
  public String pageAdmin(@PathVariable String pageName, Model model) {
    model.addAttribute("pageName", pageName);
    System.out.println("뷰이름:" + pageName);
    return "adminLayout";
  }

  @GetMapping("/{pageName}.admin/{id}")
  public String pageAdmin(@PathVariable String pageName, @PathVariable String id, Model model) {
    model.addAttribute("pageName", pageName);
    model.addAttribute("id", id);
    System.out.println("뷰이름: " + pageName + ", ID: " + id);
    return "adminLayout";
  }


  @GetMapping("/{pageName}.user/{id}")
  public String pageUser(@PathVariable String pageName, @PathVariable String id, Model model) {
    model.addAttribute("pageName", pageName);
    model.addAttribute("id", id); // id를 모델에 추가
    System.out.println("뷰이름: " + pageName + ", ID: " + id);
    System.out.println("id ------------" + id);

    // 하단바 없는 레이아웃 적용할 페이지
    if ("userStoreDetail".equals(pageName)) {
      return "userLayoutNoNav";
    }

    return "userLayout";
  }





  @GetMapping("/{pageName}.master")
  public String pageMaster(@PathVariable String pageName, Model model) {
    model.addAttribute("pageName", pageName);
    System.out.println("뷰이름:" + pageName);
    return "masterLayout";
  }

  //업체가입
  @GetMapping("/{pageName}.signup")
  public String signup(@PathVariable String pageName, Model model){
    model.addAttribute("pageName", pageName);
    System.out.println("뷰이름:" + pageName);
    return "storeRegist";
  }

  //업체로그인
  @GetMapping("/{pageName}.login")
  public String login(@RequestParam(value = "err", required = false) String err,
                      @PathVariable String pageName, Model model, HttpSession session) {
    session.invalidate();
    if(err != null) {
      model.addAttribute("msg", "아이디 비밀번호를 확인하세요");
    }

    model.addAttribute("pageName", pageName);
    System.out.println("로그인뷰이름:" + pageName);
    return "adminLogin";
  }
  

  @PostMapping("/loginForm")
  public ResponseEntity<Map<String, Object>> loginForm(@RequestBody Map<String, String> loginData,
                                                       HttpSession session,
                                                       Model model) {
    String id = loginData.get("id");
    String pw = loginData.get("pw");

    System.out.println("입력" + id + pw);
    StoreRegistDTO store = adminStoreService.loginCheck(id, pw);
    System.out.println("해당업체정보 "+ store);

    String storeId = store.getStoreId();
    Long storeNo = store.getStoreNo();
    String storeStatus = store.getStoreStatus();

    if(storeId != null && !storeId.isEmpty()){
      session.setAttribute("storeId", storeId);
      session.setAttribute("storeNo", storeNo);
      session.setAttribute("storeName", store.getStoreName());
      session.setAttribute("storeStatus", store.getStoreStatus());

      model.addAttribute("storeStatus", storeStatus);

      //두개를 리턴하기 위해 Map사용
      Map<String, Object> response = new HashMap<>();
      response.put("storeId",storeId);
      response.put("storeNo",storeNo);
      response.put("storeStatus",storeStatus);

      return ResponseEntity.ok(response);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);//401반환
    }
  }


}
