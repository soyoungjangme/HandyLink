package com.example.HiMade.user.controller.UserController;

import com.example.HiMade.user.dto.*;
import com.example.HiMade.user.service.UserReservationService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userMyReservation")
public class UserMyReservationController {

  @Autowired
  UserReservationService userReservationService;

  @PostMapping("/getMyReserveList")
  public List<UserRL> getMyReserveList(@RequestBody UserRL dto) {
    System.out.println(dto );
    System.out.println(userReservationService.getMyReserveList(dto));
    return userReservationService.getMyReserveList(dto);
  }


  @GetMapping("/getMyReservationDetail/{id}")
  public List<UserRD> getMyReservationDetail(@PathVariable int id){
    return userReservationService.getMyReservationDetail(id);
  }
  @GetMapping("/getMyReservationDetail2/{id}")
  public List<UserRD> getMyReservationDetail2(@PathVariable int id){
    return userReservationService.getMyReservationDetail2(id);
  }


  @PostMapping("setReview/{id}")
  public int setReview(@RequestBody UserReviewDTO dto, @PathVariable int id){
    System.out.println("user review dto + "  + dto);
    dto.setReservationNo(id);
    return userReservationService.setReview(dto);
  }

//  @PostMapping("setReviewImg")
//  public void setReviewImg(@RequestParam("file") MultipartFile[] file){
//
//
//      System.out.println(file);
//
////    userReservationService.setReviewImg(file,reviewNo);
//  }
private final String uploadDir = "src/main/resources/static/uploads/";

//  @PostMapping("/setReviewImg")
//  public void setReviewImg(@RequestParam("files") MultipartFile[] files, @RequestParam("reviewNoId") String reviewNoId) {
//    for (MultipartFile file : files) {
//      try {
//        // 파일을 저장하고 URL을 얻는 로직
//        if (file.isEmpty()) {
//
//        }
//        int id = Integer.parseInt(reviewNoId);
//        // 저장할 경로
//        String uploadDir = new File("src/main/resources/static/uploads/").getAbsolutePath() + File.separator;
//        // 파일을 지정한 경로에 저장
//        try {
//          File destinationFile = new File(uploadDir + file.getOriginalFilename());
//          file.transferTo(destinationFile); // 파일 저장
////          return ResponseEntity.ok("파일이 성공적으로 업로드되었습니다: " + destinationFile.getAbsolutePath());
//        } catch (IOException e) {
//          e.printStackTrace();
////          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 업로드 중 오류가 발생했습니다.");
//        }
//        String fileUrl = saveFileAndGetUrl(file); // 파일을 저장하고 URL을 반환하는 메서
//        System.out.println(reviewNoId);
////        int id = (int)reviewNoId;
//        // MyBatis 매퍼에 URL과 리뷰 번호를 전달
//        userReservationService.setReviewImg(fileUrl, id);
////        userReservationService.setReviewImg(files);
//      } catch (IOException e) {
//        // 예외 처리
//        e.printStackTrace();
//      }
//    }
//
//  }

  @PostMapping("/setReviewImg")
  public void setReviewImg(@RequestParam("files") String[] files, @RequestParam("reviewNoId") String reviewNoId) {

    for (String file : files) {
      System.out.println(file);
      int id = Integer.parseInt(reviewNoId);
      userReservationService.setReviewImg(file, id);
    }

  }


  private String saveFileAndGetUrl(MultipartFile file) throws IOException {
    // 파일 저장 경로 지정
//    String filePath = "/path/to/save/" + file.getOriginalFilename();
//    File dest = new File(filePath);

    // 파일 저장
//    file.transferTo(dest);

    // 파일 URL 반환 (이 부분은 실제 구현에 따라 다를 수 있음)
    return "http://localhost:8585/uploads/" + file.getOriginalFilename();
  }



}
