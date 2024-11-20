import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import './UserReservationConfirm.css';


function UserReservationConfirm() {

  const [reserveModi, setReserveModi] = useState('');
  const [categories, setCategories] = useState([{
    serviceName: '',
    servicePrice: 0,
    isPaid: false,
    isRequired: false,
    subCategoryType: 'SELECT1',
    subCategories: [{ serviceName: '', servicePrice: '' }]
  }]);

  const [cateId, setCateId] = useState(0);

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);
  }, []);

  useEffect(() => {
    axios
      .get(`/adminReservation/getListDetail/${cateId}`)
      .then(response => {
        console.log(response.data);
        setReserveModi(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

    axios
      .get(`/adminReservation/getMiddleItem/${cateId}`)
      .then(response => {
        console.log("get" + JSON.stringify(response.data));

        const transformedData = response.data.map(item => ({
          categoryId: item.categoryId,
          serviceName: item.serviceName,
          servicePrice: item.servicePrice,
          isPaid: item.isPaid === 'Y',
          isRequired: item.isRequired === 'Y',
          subCategoryType: item.subCategoryType,
          subCategories: item.subCategories.map(sub => ({
            serviceName: sub.serviceName,
            servicePrice: sub.servicePrice,
            categoryId: sub.categoryId
          }))
        }));
        setCategories(transformedData);
      })
      .catch(error => {
        console.log('Error subItemModi', error);
      });
  }, [cateId]);

  const [requestText, setRequestText] = useState(''); // 요청사항 입력값
  const [totalPrice, setTotalPrice] = useState(300000); // 총액 값 (임의로 설정)

  // 요청사항 입력값 관리
  const handleRequestChange = (e) => {
    setRequestText(e.target.value);
  };


  const calculateTotalPrice = () => {
    return combinedInputs.reduce((acc, item) => {
      if (typeof item === 'object' && item !== null) {
        console.log('Processing object:', item);
        // 객체의 각 값이 배열인 경우
        for (const key in item) {
          if (Array.isArray(item[key])) {
            console.log(`Processing array at key ${key}:`, item[key]);
            return acc + item[key].reduce((sum, innerItem) => {
              // innerItem이 객체인지 확인하고 servicePrice 합산
              return sum + (innerItem.servicePrice || 0);
            }, 0);
          } else {
            // 값이 배열이 아닐 경우 servicePrice 합산
            return acc + (item.servicePrice || 0);
          }
        }
      }
    }, 0);
  };
  // 뒤로가기 추가
  const handleGoBack = () => {
    window.history.back();
  };


  //   
  const [formData, setFormData] = useState([]);
  const [combinedInputs, setCombinedInputs] = useState([]); // 배열로 초기화
  console.log(combinedInputs);
  console.log(formData);



  // useEffect를 사용하여 combinedInputs나 reserveModi가 업데이트될 때마다 총 가격을 계산
  useEffect(() => {
    const newTotalPrice = calculateTotalPrice() + (reserveModi.servicePrice || 0);
    setTotalPrice(newTotalPrice); // 총 가격 업데이트
    console.log(`Total Price: ${newTotalPrice}`); // 업데이트된 가격 로그
  }, [combinedInputs, reserveModi]); // reserveModi 추가

  const [pickupStatus, setPickupStatus] = useState();

  // 세션 스토리지에서 데이터를 불러오는 함수
  const loadFromSessionStorage = () => {
    const storedData = sessionStorage.getItem('combinedInputs');
    const pickupStatus = sessionStorage.getItem('pickupStatus');
    setPickupStatus(pickupStatus);
    console.log('배송방법', pickupStatus);
    if (storedData) {
      // JSON 문자열을 다시 객체로 변환
      const parsedData = JSON.parse(storedData);
      console.log(parsedData);
      setCombinedInputs(parsedData);
    }
    const storedformData = sessionStorage.getItem('formData');
    if (storedformData) {
      // JSON 문자열을 다시 객체로 변환
      const parsedFormData = JSON.parse(storedformData);
      console.log(parsedFormData);
      setFormData(parsedFormData);
    }
  };

  useEffect(() => {
    loadFromSessionStorage(); // 저장된 데이터를 불러옴
  }, []);


  //------------------------------------
  const slot = sessionStorage.getItem('selectSlot');
  const date = sessionStorage.getItem('formattedDate');
  const userName = sessionStorage.getItem('userName');
  const userPhonenum = sessionStorage.getItem('userPhonenum');
  const reservationSlotKey = sessionStorage.getItem('reservationSlotKey');
  const sessionSestoreNo = sessionStorage.getItem('storeNo');

  console.log('Slot:', slot);
  console.log('Date:', date);
  console.log('reservationSlotKey:', reservationSlotKey);
  console.log("categoryId:" + cateId);




  // sessionStorage에서 데이터 가져오기
  const storedData = sessionStorage.getItem('storeInfo');
  const userId = sessionStorage.getItem('userId');
  // 가져온 데이터를 변환하여 바로 사용
  const storeInfo = storedData ? JSON.parse(storedData) : null; // 데이터가 있을 경우만 변환
  console.log(storeInfo);
  console.log(reserveModi);
  console.log(categories);





  useEffect(() => {
    if (isLoading) {
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 컴포넌트 언마운트 시 타이머 정리
      return () => clearInterval(timer);
    }
  }, [isLoading]);



  // ----------------------- 주문등록, 결제 부분 -----------------------
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // 결제수단

  const handleReservation = async (paymentMethod) => {
    let reservationNum = 0;

    const reservationStatus = paymentMethod === "bank_transfer" ? "입금대기" : "대기";

    const reservationData = {
      reservationTime: slot,  // 세션 데이터에서 가져옴
      reservationSlotKey: reservationSlotKey,  // 세션 데이터에서 가져옴
      customerRequest: requestText,  // 사용자 입력 요청사항
      reservationPrice: totalPrice,  // 총액 정보
      storeNo: storeInfo.storeNo,
      reservationStatus: reservationStatus,
      userId: userId,
      userDeliveryType : pickupStatus
    };

    try {
      // 1. 예약 정보 저장
      const response = await axios.post(`/userReservation/setReservationForm`, reservationData);
      reservationNum = response.data;

      console.log("예약 번호: ", reservationNum);

      // 2. 세부 예약 정보 업데이트
      const updatedArray = formData.map(item => ({
        ...item,
        reservationNo: reservationNum
      }));

      await axios.post(`/userReservation/setReservationFormDetail`, updatedArray);

      // 3. 슬롯 상태 업데이트
      await axios.post(`/userReservation/updateSlotStatus`, {
        categoryId: cateId,
        reservationDate: date,
        storeNo: sessionSestoreNo
      });

      console.log("예약 완료 및 슬롯 상태 업데이트 성공!");

      return reservationNum;
    } catch (error) {
      console.error("예약 처리 중 오류 발생:", error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (reservationNum, paymentMethod) => {
    try {
      await storePaymentInfo({
        paymentMethod: paymentMethod === "card" ? "간편결제" : paymentMethod === "trans" ? "일반결제" : "계좌이체",
        paymentAmount: totalPrice,
        paymentStatus: paymentMethod === "bank_transfer" ? "입금대기" : "결제완료",
        reservationNo: reservationNum
      });

      sessionStorage.setItem('storeInfo', JSON.stringify(storeInfo));
      sessionStorage.setItem('totalPrice', totalPrice);
      sessionStorage.setItem('reserveModi', JSON.stringify(reserveModi));
      sessionStorage.setItem('categories', JSON.stringify(categories));

      // 로딩 화면 표시
      setIsLoading(true);
      setTimeout(() => {
        // 3초 후에 리다이렉트
        setIsLoading(false);
        window.location.href = `../UserMyReservationList.user`;
      }, 3000); // 3초 대기
    } catch (error) {
      console.error("결제 정보 저장 중 오류 발생:", error);
    }
  };

  const requestPayment = (paymentMethod) => {
    const { IMP } = window;
    if (!IMP) {
      console.error("IMP 객체가 정의되지 않았습니다. 아임포트 스크립트를 확인하세요.");
      return;
    }

    IMP.init("imp14516351"); // 아임포트에서 발급받은 가맹점 식별코드

    const data = {
      pg: "html5_inicis",
      pay_method: paymentMethod,
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: totalPrice, // 결제 금액
      name: "테스트 상품",
      buyer_email: "buyer@example.com",
      buyer_name: "테스트 구매자",
      buyer_tel: "010-1234-5678",
      buyer_addr: "구매자 주소",
      buyer_postcode: "우편번호",
      m_redirect_url: window.location.href
    };

    IMP.request_pay(data, async (response) => {
      if (response.success) {
        console.log("결제 성공:", response);
        alert(`결제 성공! 결제 ID: ${response.imp_uid}`);

        try {
          const reservationNum = await handleReservation(paymentMethod);
          await handlePaymentSuccess(reservationNum, paymentMethod);
        } catch (error) {
          console.error("결제 성공 후 처리 중 오류 발생:", error);
        }

      } else {
        console.error("결제 실패:", response);
        alert(`결제 실패! 에러 코드: ${response.error_code}, 에러 메시지: ${response.error_msg}`);
        resetPaymentState();
      }
    });
  };

  const resetPaymentState = () => {
    setSelectedPaymentMethod("");
    sessionStorage.removeItem('storeInfo');
    sessionStorage.removeItem('totalPrice');
    sessionStorage.removeItem('reserveModi');
    sessionStorage.removeItem('categories');
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

      if (!response.ok) throw new Error('결제 정보 저장 실패');

      const result = await response.json();
      console.log("결제 정보 저장 성공:", result);
    } catch (error) {
      console.error("결제 정보 저장 중 오류 발생:", error);
    }
  };


  // 로딩 화면
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [countdown, setCountdown] = useState(3); // 카운트다운 초기값 3초

  useEffect(() => {
    // 카운트다운 시작
    if (isLoading && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      // 카운트다운이 0에 도달하면 타이머 종료
      if (countdown === 1) {
        clearInterval(timer);
        setIsLoading(false);
      }
      return () => clearInterval(timer);
    }
  }, [isLoading, countdown]);


  const [showTerms, setShowTerms] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  // 토글 함수
  const toggleTerms = () => setShowTerms(!showTerms);
  const toggleRefund = () => setShowRefund(!showRefund);



  return (
    <div>
      <div className="user-main-container">
        <div className="search-top">
          <div className='left'> <i class="bi bi-chevron-left" onClick={handleGoBack}> </i> 주문확인</div>
          <div className='right'></div>
        </div>

        <div className="user-main-content">

          <div className="user-content-container11">
            <div className="user-reserve-menu">
              <div className="user-reserve-menu-img">
                <img src={`${reserveModi.imageUrl}`} alt="My Image" />
              </div>
              <div className="user-reserve-menu-content">
                <div>{reserveModi.serviceName} </div>
                <div>
                  {reserveModi.serviceContent}

                </div>
                <div> {reserveModi.servicePrice} 원 ~</div>

              </div>
            </div>
          </div>
          <hr />
       

          
          <div className="user-content-container2">
            <div className="user-reserve-title">예약자정보</div>
            <div className="user-content-container3">
              <div className="sub-container3">
                <div className="bold-text">성함</div>
                <div>{userName}</div>
              </div>

              <div className="sub-container3">
                <div className="bold-text">전화번호</div>
                <div>{userPhonenum}</div>
              </div>
            </div>
          </div>


          <hr />

          <div className="user-content-container2">
          <div className="user-content-container3">
              <div className="sub-container5">
                <div> 수령방식 </div>
                <div> {pickupStatus} </div>
              </div>
            </div>
            </div>
          <hr />
        


          <div className="user-content-container2">
            <div className="user-reserve-title">예약일자</div>
            <div className="user-reserve-data">
              <div>
                <i className="bi bi-calendar-check-fill"></i> {date}
              </div>
              <div>
                <i className="bi bi-clock-fill"></i> {slot}
              </div>
            </div>
          </div>
          <hr />

          <div className="user-content-container2">
            <div className="user-reserve-title2">예약정보</div>
          </div>
          <div className="user-content-container2">
            <div className="user-content-container3">
              <div>기본 가격 :  {reserveModi.serviceName} (+  {reserveModi.servicePrice} ) </div>
              <div>
                {categories.map((category, index) => (
                  <div key={index}>
                    {/* 서비스 이름이 선택된 경우에만 출력 */}
                    {combinedInputs[index] && combinedInputs[index].inputValue && (
                      <span>

                        {/* servicePrice 추가 출력 */}
                        {/* <span> (+ {combinedInputs[index]?.servicePrice || 0}) </span> */}
                      </span>
                    )}

                    <span>
                      {combinedInputs[index] && (
                        <span>
                          <span>{category.serviceName} :  </span>
                          {Object.entries(combinedInputs[index]).map(([key, value]) => {
                            // 값이 배열인 경우
                            if (Array.isArray(value)) {
                              return value.map((item, itemIndex) => (
                                <span key={itemIndex}>
                                  {item.serviceName}  {item.servicePrice > 0 && (
                                    <span> (+ {item.servicePrice})</span>
                                  )}
                                </span>
                              ));
                            }
                            // 값이 문자열인 경우
                            else if (typeof value === 'string') {
                              return (
                                <span key={key}>

                                  {value}
                                  {/* servicePrice 추가 출력 */}
                                  <span>
                                    {combinedInputs[index]?.servicePrice > 0 && (
                                      <span>(+ {combinedInputs[index]?.servicePrice})</span>
                                    )}
                                  </span>

                                </span>
                              );
                            }
                            // 값이 undefined이거나 다른 경우
                            return null;
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr />

          <div className="user-content-container2">


            <div className="user-content-container3">
              <div className="sub-container5">
                <div> 총액 </div>
                <div> {totalPrice} </div>
              </div>
            </div>
          </div>
          <hr />

          <div className="user-content-container2">


            <div className="user-content-container3">
              <div className="sub-title">
                요청사항
              </div>
              <div className="sub-container3">
                <input
                  className="input-text"
                  type="text"
                  value={requestText}
                  onChange={handleRequestChange}
                />
              </div>
            </div>
          </div>
          <hr />

          <div className="user-content-container">
            <div className="info-row">
              <div className="left">유의사항</div>
              <div className="right" onClick={toggleTerms}>
                <i className={`bi bi-chevron-${showTerms ? 'up' : 'down'}`}></i>
              </div>
            </div>
            {showTerms && (
              <div className="info-content">
                <p> <i className="bi bi-dot"></i> 예약 변경이나 취소는 고객과 업체 간의 협의를 통해 결정됩니다. </p>
                <p> <i className="bi bi-dot"></i> 고객은 예약 전, 서비스 제공 조건 및 변경 가능 여부를 반드시 업체와 상의하여야 하며, 이로 인한 불이익을 방지하기 위해 사전에 충분히 확인해 주시기 바랍니다. </p>
              </div>
            )}
          </div>

          <div className="user-content-container">
            <div className="info-row">
              <div className="left">환불규정</div>
              <div className="right" onClick={toggleRefund}>
                <i className={`bi bi-chevron-${showRefund ? 'up' : 'down'}`}></i>
              </div>
            </div>
            {showRefund && (
              <div className="info-content">
                <p> <i className="bi bi-dot"></i> 예약 취소 및 변경은 고객과 업체 간의 합의에 의해 진행됩니다. </p>
                <p> <i className="bi bi-dot"></i> 고객은 예약 후 변경이나 취소를 원할 경우, 해당 업체와 직접 연락하여 상호 협의 후 처리해야 합니다. </p>
                <p> <i className="bi bi-dot"></i> 각 업체는 개별적인 취소 및 변경 정책을 운영하므로, 예약 전에 반드시 확인하시기 바랍니다. </p>
              </div>
            )}
          </div>
          <hr />


          {/* 결제 부분 */}
          <div className="user-content-container2">
            <div className="user-payment-title">
              <h3>결제수단</h3>
            </div>
            <div className="user-content-payment">
              <div className='user-payment-method'>
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === "card"}
                  onChange={() => setSelectedPaymentMethod("card")}
                />
                <label htmlFor="card">
                  <i className="bi bi-credit-card"></i> 간편결제
                </label>
              </div>
              <div className='user-payment-method'>
                <input
                  type="radio"
                  id="trans"
                  name="paymentMethod"
                  value="trans"
                  checked={selectedPaymentMethod === "trans"}
                  onChange={() => setSelectedPaymentMethod("trans")}
                />
                <label htmlFor="trans">
                  <i class="bi bi-cash-coin"></i> 일반결제
                </label>
              </div>
              <div className='user-payment-method'>
                <input
                  type="radio"
                  id="bank_transfer"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={selectedPaymentMethod === "bank_transfer"}
                  onChange={() => setSelectedPaymentMethod("bank_transfer")}
                />
                <label htmlFor="bank_transfer">
                  <i class="bi bi-credit-card-2-front"></i> 계좌이체
                </label>
              </div>
            </div>
            <button className="payment-button" onClick={async () => {
              if (!selectedPaymentMethod) {
                alert("결제수단을 선택해주세요.");
                return;
              }
              if (selectedPaymentMethod === "bank_transfer") {
                try {
                  const reservationNum = await handleReservation(selectedPaymentMethod);
                  await handlePaymentSuccess(reservationNum, "bank_transfer");
                } catch (error) {
                  console.error("계좌이체 주문 등록 중 오류 발생:", error);
                  alert("주문 등록에 실패했습니다. 다시 시도해주세요.");
                }
              } else {
                requestPayment(selectedPaymentMethod);
              }
            }}>
              {totalPrice}원 결제하기
            </button>
          </div>

          {/* 로딩 화면 */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <img src="../img/loading/loading.png" alt="Loading Spinner" />
              </div>
              <div className="countdown-timer">{countdown}</div>
              <div className="loading-text">예약 완료</div>
              <div className="loading-img-box">
                <div className="loading-text2">[크리스마스홈데코] 지금부터 X-mas 분위기</div>
                <div className="loading-text3">~ 2024.12.24 최대 30% 특가</div>
                <img src="https://image.idus.com/image/files/4a28ea95cd9f4343bdabfb18f2d788c7_1080.jpg" alt="Christmas Home Decor" />
              </div>
            </div>
          )}




        </div>
      </div>


    </div>
  )
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserReservationConfirm />
);



