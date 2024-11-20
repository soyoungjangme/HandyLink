package com.example.HiMade.user.service;

import com.example.HiMade.user.entity.Refund;
import com.example.HiMade.user.repository.RefundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    public List<Refund> getRefundsByPaymentId(Long paymentId) {
        return refundRepository.findByPaymentId(paymentId);
    }

    // RestTemplate을 사용하여 포트원 API 요청을 처리합니다.
    private RestTemplate restTemplate = new RestTemplate();

    // 포트원의 REST API Key와 Secret
    private final String apiKey = "1428878563124318"; // 포트원에서 발급받은 REST API Key
    private final String apiSecret = "nq968pPEVohJXlmiCmM026QqiUvZTBXbOPI2FNNhpInb1e4GhVAx0m2e5jYYggzvP48ij8o6EM4QjgMb"; // 포트원에서 발급받은 REST API Secret

    // Access Token을 발급받는 메서드
    private String getAccessToken() {
        String url = "https://api.iamport.kr/users/getToken";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // REST API Key와 Secret 설정
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("imp_key", apiKey);
        requestBody.put("imp_secret", apiSecret);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && (int) responseBody.get("code") == 0) {
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");
                return (String) responseData.get("access_token");
            } else {
                throw new RuntimeException("토큰 발급 실패: " + responseBody.get("message"));
            }
        } catch (Exception e) {
            throw new RuntimeException("토큰 발급 요청 중 오류 발생: " + e.getMessage());
        }
    }

    // 환불 요청 메서드
    public void createRefund(Long paymentId, String refundMethod, Long refundAmount) {
        // 1. 포트원 환불 API 호출
        boolean isRefundSuccessful = initiatePortoneRefund(paymentId, refundAmount);

        // 2. 포트원 환불 성공 시에만 DB에 환불 정보 저장
        if (isRefundSuccessful) {
            Refund refund = new Refund();
            refund.setPaymentId(paymentId);
            refund.setRefundMethod(refundMethod);
            refund.setRefundAmount(refundAmount);
            refund.setRefundDate(LocalDateTime.now());

            refundRepository.save(refund);
        }
    }

    private boolean initiatePortoneRefund(Long paymentId, Long refundAmount) {
        // 포트원의 환불 API에 필요한 요청 데이터 설정
        String url = "https://api.iamport.kr/payments/cancel";

        // 발급받은 Access Token 가져오기
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);  // Bearer 인증 방식으로 토큰 설정

        // 환불에 필요한 요청 본문 설정
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("imp_uid", paymentId);        // 결제 고유번호 (imp_uid)
        requestBody.put("amount", refundAmount);      // 환불 금액
        requestBody.put("reason", "User requested");  // 환불 사유

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 포트원 환불 API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            // 응답을 바탕으로 환불 성공 여부 판단
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("포트원 환불 성공: " + response.getBody());
                return true;
            } else {
                System.err.println("포트원 환불 실패: " + response.getBody());
                return false;
            }
        } catch (Exception e) {
            System.err.println("포트원 환불 요청 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
}
