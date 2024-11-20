package com.example.HiMade.admin.controller;

import com.example.HiMade.admin.dto.*;
import com.example.HiMade.admin.service.AdminStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/adminStore")
public class AdminStoreController {

    @Autowired
    @Qualifier("adminStoreService")
    private AdminStoreService adminStoreService;

    //업체탈퇴
    @PostMapping("/updateUnSubcribe")
    public ResponseEntity<Integer> updateUnSubcribe(@RequestParam Long storeNo, HttpSession session){
        Integer result = adminStoreService.updateUnSubcribe(storeNo);
        if(result > 0){
            session.invalidate();
            return ResponseEntity.ok(result);
        }else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(0); //삭제 조건에 안맞음
        }
    }

    //아이디중복체크
    @PostMapping("/duplicatedIdCheck")
    public Integer duplicatedId(@RequestBody StoreRegistDTO storeRegistDTO) {
        Integer result = adminStoreService.duplicatedId(storeRegistDTO.getStoreId());
        return result;
    }

    //업체가입
    @PostMapping("/registStore")
    public void registStore(@RequestBody StoreRegistDTO storeRegistDTO){

        adminStoreService.registStore(storeRegistDTO);
    }

    //아이디 찾기
    @GetMapping("/findAdminId")
    public String findAdminId(@RequestParam String managerName, @RequestParam String storeBusinessNo){
        String storeId = adminStoreService.findAdminId(managerName,storeBusinessNo);
        System.out.println("아이디찾기 " + storeId);

        return storeId;
    }

    //비밀번호 찾기
    @GetMapping("/findAdminPw")
    public Integer findAdminPw(@RequestParam String storeId, @RequestParam String storeBusinessNo){
        Integer pwYn = adminStoreService.findAdminPw(storeId, storeBusinessNo);
        System.out.println("비번찾기 " + pwYn);

        return pwYn;
    }

    //비밀번호 찾기 - 새로운 비밀번호 변경
    @PostMapping("/updatePw")
    public void updatePw(@RequestParam String newPw,
                         @RequestParam String storeId,
                         @RequestParam String storeBusinessNo){

        System.out.println("newPw: "+newPw+" storeId: "+storeId+"storeBusinessNo: "+storeBusinessNo);
        adminStoreService.updatePw(newPw, storeId, storeBusinessNo);
    }

    //마이페이지 - update
    @PostMapping("/updateStoreInfo")
    public void updateStoreInfo(@RequestBody StoreRegistDTO storeRegistDTO){
        adminStoreService.updateStoreInfo(storeRegistDTO);
    }

    //가게관리 & 마이페이지 - 정보 가져오기
    @GetMapping("/myStoreInfo")
    public ResponseEntity<StoreRegistDTO> getMyStore(@RequestParam Long storeNo){
        StoreRegistDTO myStore = adminStoreService.getMyStore(storeNo);

        return ResponseEntity.ok(myStore);
    }

    //가게관리-등록
    @PostMapping("/updateStore")
    public void updateStore(@RequestBody StoreRegistDTO storeRegistDTO){
        adminStoreService.updateStore(storeRegistDTO);
    }

    //고정휴무-update
    @PostMapping("/updateDay")
    public void updateDay(@RequestBody StoreRegistDTO storeRegistDTO) {
        adminStoreService.updateDay(storeRegistDTO);
    }

    //고정휴무-select
    @GetMapping("/getOffDay")
    public List<DayOffDay> getOffDay(@RequestParam Long storeNo){
        return adminStoreService.getOffDay(storeNo);
    }

    //지정휴무 - insert
    @PostMapping("/registDayOffSet")
    public void registDayOffSet(@RequestBody StoreRegistDTO storeRegistDTO){
        for(DayOffSet dayOffSet : storeRegistDTO.getDayOffSetList()){
            adminStoreService.registDayOffSet(dayOffSet);
        }
    }

    //지정휴무 - delete
    @DeleteMapping("/deleteOffSet")
    public ResponseEntity<Integer> deleteOffSet(@RequestParam Long storeNo, @RequestParam Long setNo){
        Integer result = adminStoreService.deleteOffSet(storeNo, setNo);
        if(result > 0){
            return ResponseEntity.ok(result);
        }else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(0); //삭제 조건에 안맞음
        }
    }

    //지정휴무-select
    @GetMapping("/getOffSet")
    public List<DayOffSet> getOffSet(@RequestParam Long storeNo){
//        System.out.println();
        return adminStoreService.getOffSet(storeNo);
    }

    @PostMapping("/adminStore/deleteImage")
    public ResponseEntity<String> deleteImage(@RequestBody Map<String, String> payload) {
        String storeImgLocation = (String) payload.get("storeImgLocation");
        int storeNo = Integer.parseInt(payload.get("storeNo"));

        try {
            // 이미지 삭제 서비스 로직 호출
            adminStoreService.deleteImage(storeNo, storeImgLocation);
            return ResponseEntity.ok("이미지 삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 삭제 실패");
        }
    }

    // 파일 업로드 메서드
    @PostMapping("/uploadImageToServer")
    public void uploadImage(@RequestParam("file") String[] file, @RequestParam("id") String id) {
        // 파일 저장 로직 (S3에 저장하거나 로컬 저장)

        int storeId = Integer.parseInt(id);

        for(String f : file){
            System.out.println(f + storeId + "================");
            adminStoreService.uploadImage(f, storeId);
        }

//        System.out.println("이미지 "+imageUrl);
//        return ResponseEntity.ok(imageUrl);
    }

//    // 이미지 삭제 메서드
//    @DeleteMapping("/deleteImage")
//    public ResponseEntity<String> deleteImage(@RequestBody Map<String, String> payload) {
//        System.out.println("Received payload: " + payload);
//        String imageUrl = payload.get("imageUrl");
//
//        if (imageUrl == null) {
//            return ResponseEntity.badRequest().body("imageUrl is missing in the request");
//        }
//
//        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1); // 파일 이름 추출
//        String uploadDir = "C:/Users/admin/Desktop/HandyLink/src/main/resources/static/uploads/storeImg"; // 이미지 저장 경로
//
//        File file = new File(uploadDir + "/" + fileName);
//        if (file.exists()) {
//            if (file.delete()) {
//                return ResponseEntity.ok("이미지 삭제 성공");
//            } else {
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 삭제 실패");
//            }
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("이미지 파일을 찾을 수 없습니다.");
//        }
//    }

    //메인페이지
    @GetMapping("/getMainCount")
    public Map<String, Integer> getMainCount(@RequestParam Long storeNo){
        Map<String, Integer> mainCount = adminStoreService.getMainCount(storeNo);
        return mainCount;
    }

    //메인-캘린더
    @GetMapping("/getReservationCounts")
    public List<Map<String, Object>> getReservationCounts(@RequestParam Long storeNo){
        List<Map<String, Object>> result = adminStoreService.getReservationCounts(storeNo);

        return result;
    }

    //예약번호가져오기
    @GetMapping("/getReservationNo")
    public List<Integer> getReservationNo(@RequestParam Long storeNo, @RequestParam String reservationSlotDate){
        List<Integer> reservationNo = adminStoreService.getReservationNo(storeNo, reservationSlotDate);

        return reservationNo;
    }

    //예약자정보
    @GetMapping("/getTodayCustomer")
    public List<CustomerReservationDTO> getTodayCustomer(@RequestParam("reservationNo") List<Long> reservationNos){
        List<CustomerReservationDTO> result = adminStoreService.getTodayCustomer(reservationNos);

        return result;
    }

    //전달 완료된 예약번호
    @GetMapping("/getReservationStatus")
    public List<Integer> getReservationStatus(@RequestParam Long storeNo){
        List<Integer> completeResNo = adminStoreService.getReservationStatus(storeNo);
        return completeResNo;
    }

    @PostMapping("/completeReservationStatus")
    public ResponseEntity<Integer> completeReservationStatus(@RequestParam Long storeNo, @RequestParam Long reservationNo){
        Integer result = adminStoreService.completeReservationStatus(storeNo, reservationNo);

        if (result > 0){
            return ResponseEntity.ok(result);
        }else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(0); //삭제 조건에 안맞음
        }
    }

    //그래프
    @GetMapping("/getDailyReportChart")
    public Map<String, Object> getDailyReportChart(@RequestParam Long storeNo) {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();

        List<String> dates = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();

        // Call the service method
        List<Map<String, Object>> chartCount = adminStoreService.getDailyReportChart(storeNo, year, month);

        // Process the result to populate `dates` and `counts` as needed
        Map<String, Integer> dateCountMap = new HashMap<>();
        for (Map<String, Object> map : chartCount) {
            String date = map.get("date").toString();
            Integer count = ((Number) map.get("count")).intValue();
            dateCountMap.put(date, count);
        }

        // Fill dates and counts
        YearMonth currentMonth = YearMonth.of(year, month);
        for (int day = 1; day <= currentMonth.lengthOfMonth(); day++) {
            String date = String.format("%02d-%02d", month, day);
            dates.add(date);
            counts.add(dateCountMap.getOrDefault(date, 0));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("dates", dates);
        response.put("counts", counts);

        return response;
    }

    @GetMapping("/getYearlyReportChart")
    public Map<String, Object> getYearlyReportChart(
            @RequestParam Long storeNo,
            @RequestParam String period) {

        LocalDate today = LocalDate.now();
        int year = period.equals("작년") ? today.getYear() - 1 : today.getYear();
        List<String> months = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();

        // 해당 연도의 월별 데이터 가져오기
        List<Map<String, Object>> chartCount = adminStoreService.getMonthlyReportChart(storeNo, year);
        Map<String, Integer> monthCountMap = new HashMap<>();

        for (Map<String, Object> map : chartCount) {
            String month = map.get("month").toString();
            Integer count = ((Number) map.get("count")).intValue();
            monthCountMap.put(month, count);
        }

        // 월별 데이터 생성
        IntStream.rangeClosed(1, 12).forEach(month -> {
            String monthKey = String.format("%04d-%02d", year, month);
            months.add(monthKey);
            counts.add(monthCountMap.getOrDefault(monthKey, 0));
        });

        Map<String, Object> response = new HashMap<>();
        response.put("months", months);
        response.put("counts", counts);

        return response;
    }

    @GetMapping("/getGenderCount")
    public Map<String, Long> getGenderCount(@RequestParam Long storeNo) {
        Map<String, Long> result = adminStoreService.getGenderCount(storeNo);

        Map<String, Long> response = new HashMap<>();
        response.put("males", (result.get("male_count")));
        response.put("females", (result.get("female_count")));

        return response;
    }

    @GetMapping("/getAgeDistribution")
    public Map<String, Object> getAgeDistribution(@RequestParam Long storeNo) {
        Map<String, Map<String, Long>> result = adminStoreService.getAgeDistribution(storeNo);

        // Initialize labels and values lists
        List<String> labels = Arrays.asList("10대", "20대", "30대", "40대 이상");
        List<Long> values = new ArrayList<>(Collections.nCopies(labels.size(), 0L));
        List<String> serviceName = new ArrayList<>(Collections.nCopies(labels.size(), ""));

        // Map the reservation counts from the result to the values list
        for (String label : labels) {
            if (result.containsKey(label)) {
                Map<String, Long> services = result.get(label);

                // Sum up the reservation counts
                long sum = services.values().stream().mapToLong(Long::longValue).sum();
                values.set(labels.indexOf(label), sum);

                // Find the service name with the highest reservation count for this age group
                String topService = services.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("");
                serviceName.set(labels.indexOf(label), topService);
            }
        }

        // Construct the final response
        Map<String, Object> response = new HashMap<>();
        response.put("labels", labels);
        response.put("values", values);
        response.put("serviceName", serviceName);

        return response;
    }




    @GetMapping("getNoticeList/{id}")
    public List<storeNoticeDTO> getNoticeList(@PathVariable int id) {
        return adminStoreService.getNoticeList(id);
    }


    @PostMapping("getNoticeList")
    public List<storeNoticeDTO> getNoticeList(@RequestBody Map<String, Integer> request) {
        int storeNo = request.get("storeNo");
        System.out.println(storeNo);
        return adminStoreService.getNoticeList(storeNo);
    }

    @PostMapping("setNotice")
    public void setNotice(@RequestBody storeNoticeDTO dto){
        System.out.println(dto);
        adminStoreService.setNotice(dto);
    }

    @PostMapping("setNoticeModi/{id}")
    public void setNoticeModi(@RequestBody storeNoticeDTO dto, @PathVariable int id){
        dto.setNoticeNo(id);
        System.out.println(dto);
        adminStoreService.setNoticeModi(dto);
    }

    @PostMapping("setNoticeStatus")
    public void setNoticeStatus(@RequestBody storeNoticeDTO dto){
//        System.out.println(dto + "--------------------");
        adminStoreService.setNoticeStatus(dto);
    }



    @GetMapping("getNoticeDetail/{id}")
    public storeNoticeDTO getNoticeDetail(@PathVariable int id){
       return adminStoreService.getNoticeDetail(id);
    }




}
