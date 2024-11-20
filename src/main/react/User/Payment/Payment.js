import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import BasicMap from "./BasicMap";

function Payment() {
    const [showMap, setShowMap] = useState(false); // 맵 표시 상태
    const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

    const toggleMap = () => {
        setShowMap(!showMap); // 버튼 클릭 시 맵 토글
    };

    const requestPayment = () => {
        const { IMP } = window;
        if (!IMP) {
            console.error("IMP 객체가 정의되지 않았습니다. 아임포트 스크립트를 확인하세요.");
            return;
        }

        IMP.init("imp14516351"); // 아임포트에서 발급받은 가맹점 식별코드

        const data = {
            pg: "html5_inicis",
            pay_method: "card",
            merchant_uid: `mid_${new Date().getTime()}`,
            amount: 500, // 결제 금액 (테스트 금액)
            name: "테스트 상품",
            buyer_email: "buyer@example.com",
            buyer_name: "테스트 구매자",
            buyer_tel: "010-1234-5678",
            buyer_addr: "구매자 주소",
            buyer_postcode: "우편번호",
            m_redirect_url: window.location.href,
        };

        IMP.request_pay(data, async function (response) {
            if (response.success) {
                console.log("결제 성공:", response);
                alert(`결제 성공! 결제 ID: ${response.imp_uid}`);

                // 결제가 성공한 후 결제 정보를 백엔드에 저장
                await storePaymentInfo({
                    paymentMethod: "신용카드",
                    paymentAmount: 500,
                    paymentStatus: "Y",
                    reservationNo: 55, // 필요한 경우 예약 번호 추가
                });
                
                fetchPaymentInfo(); // 결제 성공 후 결제 정보 조회
            } else {
                console.log("결제 실패:", response);
                alert(`결제 실패! 에러 코드: ${response.error_code}, 에러 메시지: ${response.error_msg}`);
            }
        });
    };

    const storePaymentInfo = async (paymentData) => {
        try {
            const response = await fetch('/userPayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("결제 정보 저장 성공:", result);
            } else {
                console.error("결제 정보 저장 실패:", response.statusText);
            }
        } catch (error) {
            console.error("결제 정보 저장 중 오류 발생:", error);
        }
    };

    const storeLocation = {
        lat: 37.5709, // 가게의 위도
        lng: 126.9851, // 가게의 경도
    };

    useEffect(() => {
        if (showMap) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("위치 정보 허용됨:", position);
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("위치 정보 거부됨:", error);
                    alert("위치 정보를 허용해주세요.");
                }
            );
        }
    }, [showMap]);

    return (
        <div>
            <h3>테스트 결제</h3>
            <button onClick={requestPayment}>테스트 결제하기</button>
            <button onClick={toggleMap}>
                {showMap ? "카카오맵 닫기" : "카카오맵 보기"}
            </button>
            {showMap && (
                <div style={{ marginTop: "20px" }}>
                    <BasicMap storeLocation={storeLocation} />
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Payment />);
