import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaCalendar, FaClock } from 'react-icons/fa';
import { format } from 'date-fns'
import './UserMyReservationDetail.css';



function UserMyReservationDetail() {
  const [cateId, setCateId] = useState(0);
  const [reservationList, setReservationList] = useState([]);
  const [reservationList2, setReservationList2] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState([]);
  const [refundInfo, setRefundInfo] = useState([]);
  const [reservationDetail, setReservationDetail] = useState({});
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [showRefund, setShowRefund] = useState(false);


  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);

    axios.get(`/UserStoreDetail/getStoreMainCategory2/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReservationList2(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });


    // 예약 정보 가져오기
    axios.get(`/userMyReservation/getMyReservationDetail/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReservationList(response.data);
      })
      .catch(error => {
        console.log('Error fetching reservation list:', error);
      });

    // 결제 정보 가져오기
    axios.get(`/userPaymentInfo/getPaymentInfo/${categoryId}`)
      .then(response => {
        console.log("결제정보", response.data);
        setPaymentInfo(response.data);

        const paymentId = response.data[0]?.paymentId;
        if (paymentId) {
          // 환불 정보 가져오기
          axios.get(`/userRefund/getRefundInfo/${paymentId}`)
            .then(response => {
              console.log("환불정보", response.data);
              setRefundInfo(response.data);
            })
            .catch(error => {
              console.log('Error fetching refund info:', error);
            });
        }
      })
      .catch(error => {
        console.log('Error fetching payment info:', error);
      });

    // 예약 상세 정보 가져오기
    axios.get(`/userReservation/getReservationDetail/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReservationDetail(response.data);

        // 예약 상세 정보에서 userId 추출
        const userId = response.data.userId;
        setUserId(userId);
        console.log("userId: " + userId);

        // 사용자 정보 가져오기 (userId를 사용하여 요청)
        return axios.get(`/getUser/${userId}`);
      })
      .then(response => {
        console.log("사용자정보", response.data);
        setUserInfo(response.data);
      })
      .catch(error => {
        console.log('Error fetching reservation detail or user profile:', error);
      });
  }, []);

  const [category, setCategory] = useState({
    categoryLevel: 0,
    parentCategoryLevel: 0,
    serviceName: '',
    servicePrice: 0,
    serviceContent: ''
  });

  // 결제 일시 포맷 (년/월/일 시:분:초)
  const formatDate1 = (dateString) => {
    const [date, time] = dateString.split('T');
    const formattedDate = date.replace(/-/g, '.'); // '-'을 '/'로 변경
    return `${formattedDate} ${time.substring(0, 8)}`; // 'YYYY/MM/DD HH:MM:SS' 형식으로 반환
  };

  // 예약 일시 포맷 (년.월.일 시:분:초)
  const formatDate2 = (isoDateString) => {
    const date = new Date(isoDateString);
    return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours() + 9).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
  };

  // 예약 일시 포맷 (년.월.일)
  const formatDate3 = (isoDateString) => {
    const date = new Date(isoDateString);
    return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`;
  };

  const formatDate4 = (isoDateString) => {
    const date = new Date(isoDateString);
    date.setDate(date.getDate() + 2); // 1일 더하기
    date.setHours(23, 59, 59, 999); // 자정 전, 23:59:59.999로 설정
    const koreaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return `${koreaTime.getFullYear()}.${String(koreaTime.getMonth() + 1).padStart(2, '0')}.${String(koreaTime.getDate()).padStart(2, '0')} ${String(koreaTime.getHours()).padStart(2, '0')}:${String(koreaTime.getMinutes()).padStart(2, '0')}:${String(koreaTime.getSeconds()).padStart(2, '0')}`;
  };


  // 예약 취소 버튼 클릭 시 결제 상태 업데이트
  const cancelReservation = async () => {
    const reservationNo = cateId;
    const storeName = reservationList.length > 0 ? reservationList[0].storeName : '정보 없음';

    try {
      const response = await axios.post(`/userPaymentCancel/updatePaymentStatus/${reservationNo}`, {
        paymentStatus: "결제취소",
        storeName,
        reservationStatus: "취소(고객)"
      });
      console.log("예약 취소 성공:", response.data);
      alert("예약이 취소되었습니다.");

      window.location.reload();
    } catch (error) {
      console.error("예약 취소 중 오류 발생:", error);
      alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
    }
  };


  // 계좌번호 복사
  const copyToClipboard = () => {
    if (reservationList.length > 0) {
      navigator.clipboard.writeText(reservationList[0].accountNumber)
        .then(() => {
          alert('계좌번호가 복사되었습니다.');
        })
        .catch(err => {
          alert('계좌번호 복사에 실패했습니다: ' + err);
        });
    }
  };

  const goToStoreDetail = (id) => {
    window.location.href = `/userStoreDetail.user/${id}`;
  }

  // 토글 함수
  const toggleTerms = () => setShowTerms(!showTerms);
  const toggleRefund = () => setShowRefund(!showRefund);

  // ------------

  return (
    <div>

      <div className="user-top-nav">
        <div className="back-btn-container">
          <button className="back-btn" onClick={() => window.history.back()}><i className="bi bi-chevron-left"></i></button>
        </div>

      </div>


      <div className="user-content-container" style={{ paddingTop: "75px" }}>
        <div className='payment-date'>{formatDate2(reservationDetail.regTime)}</div>
        <div className='payment-num'> 주문번호 {(reservationDetail.reservationNo)}</div>
      </div>

      <hr />

      <div className="user-content-container">
        <div className='service-box'>
          {reservationList2 ? (
            <div className="user-reserve-menu">
              <div className="user-reserve-menu-img" onClick={() => goToStoreDetail(reservationList2.storeNo)}>
                <img src={`${reservationList2.imageUrl}`} alt="My Image" />
              </div>
              <div className="user-reserve-menu-content">
                <div className='store-name2' onClick={() => goToStoreDetail(reservationList2.storeNo)}><img src="../img/store/shop1.png" /> {reservationList.length > 0 ? reservationList[0].storeName : '정보 없음'}</div>
                <div className="service-name2">{reservationList2.serviceName}</div>
                <div className="service-content2">{reservationList2.serviceContent}</div>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>

      <hr />

      {/* 입금정보 */}
      {reservationDetail.reservationStatus === "입금대기" && (
        <>
          <div className="user-content-container">
            <div className='payment-info-top'>
              <div className='deposit-date'>{formatDate4(reservationDetail.regTime)} 까지 입금해주세요.</div>
            </div>
            <div className="payment-info-top">
              <div className="account-left">입금 대기금액</div>
              <div className="account-right">
                {paymentInfo.length > 0 ? paymentInfo[0].paymentAmount.toLocaleString() : '정보 없음'} 원
              </div>
            </div>
            <div className="payment-info-top">
              <div className="account-left">입금 계좌</div>
              <div className="account-right">
                {reservationList.length > 0 ? reservationList[0].accountBank : '정보 없음'} {reservationList.length > 0 ? reservationList[0].accountNumber : '정보 없음'}
                <button className='account-number-copy-btn' onClick={copyToClipboard}>
                  <i className="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>
          <hr />
        </>
      )}


      <div className="user-content-container">
        <div className="info-row">
          <div className="left2"><i class="bi bi-calendar-check-fill"></i>{reservationDetail.reservationSlot?.reservationSlotDate} </div>
          <div className="right2"><i class="bi bi-clock-fill"></i>{(reservationDetail.reservationTime || '정보 없음').slice(0, 5)} </div>
        </div>
      </div>

      <hr />

      {/* 예약자정보 */}
      <div className="user-content-container">
        <div className="header">예약자 정보</div>
        <div className="info-row">
          <div className="left">이름</div>
          <div className="right">{userInfo.userName}</div>
        </div>
        <div className="info-row">
          <div className="left">전화번호</div>
          <div className="right">{userInfo.userPhonenum}</div>
        </div>
      </div>

      <hr />
      
    {/* 요청사항 */}
    <div className="user-content-container">
        <div className="info-row">
          <div className="left3">수령방식</div>
          <div className="right"> {reservationDetail.userDeliveryType} </div>
        </div>
      </div>

      <hr />

      {/* 예약 정보 */}
      <div className="user-content-container">
        <div className="header">예약 정보</div>
        <div className="payment-info">
          {/* 대분류와 중분류 출력 */}
          {reservationList.map((item, resIndex) => {
            const isFirstInGroup = resIndex === 0 || reservationList[resIndex - 1].mainCategoryName !== item.mainCategoryName;
            const isMiddleCategoryDifferent = resIndex === 0 || reservationList[resIndex - 1].middleCategoryName !== item.middleCategoryName;

            return (
              <div key={resIndex}>
                {/* 대분류 출력 */}
                {isFirstInGroup && (
                  <div className="info-row">
                    <div className="left"><i className="bi bi-dot"></i> {item.mainCategoryName}</div>
                    <div className="right">(+{item.mainPrice}원)</div>
                  </div>
                )}


                <div className="info-row2">
                  {isMiddleCategoryDifferent && (
                    <div className="left">
                      ⌞ {item.middleCategoryName}
                    </div>
                  )}
                  <div className="right">
                    {item.middleCategoryValue != null
                      ? `${item.middleCategoryValue} (+${item.middlePrice}원)`
                      : `${item.subCategoryName} (+${item.subPrice}원)`}
                  </div>
                </div>


              </div>
            );
          })}
        </div>
      </div>

      <hr />

      {/* 결제금액 또는 환불금액 */}
      <div className="user-content-container">
        <div className='totalPrice'>
          <div className="info-row">
            <div className="left3">{refundInfo.length > 0 ? '환불금액' : '결제금액'}</div>
            <div className="right">
              {refundInfo.length > 0 ? (
                `${refundInfo[0].refundAmount.toLocaleString()} 원` // 환불금액
              ) : (
                `${paymentInfo.length > 0 ? paymentInfo[0].paymentAmount.toLocaleString() : '정보 없음'} 원` // 결제금액
              )}
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* 요청사항 */}
      <div className="user-content-container">
        <div className="info-row">
          <div className="left3">요청사항</div>
          <div className="right"> {reservationDetail.customerRequest} </div>
        </div>
      </div>

      <hr />

   
      {/* 결제 / 환불 정보 */}
      <div className="user-content-container">
        {refundInfo.length > 0 ? (
          // 환불 정보
          <div className="payment-info">
            <div className="payment-info-top">
              <div className="payment-left">환불 정보</div>
            </div>
            {refundInfo.map((refund, index) => (
              <div key={index}>
                <div className="info-row">
                  <div className="left">환불 일시</div>
                  <div className="right">{formatDate1(refund.refundDate)}</div>
                </div>
                <div className="info-row">
                  <div className="left">환불 수단</div>
                  <div className="right">{refund.refundMethod}</div>
                </div>
                <div className="info-row">
                  <div className="left">환불 금액</div>
                  <div className="right">{refund.refundAmount.toLocaleString()} 원</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 결제 정보
          <div className="payment-info">
            <div className="payment-info-top">
              <div className="payment-left">결제 정보</div>
              <div className="payment-right">
                {/* <a href={`/paymentInfo.user/${cateId}`}>결제 상세</a> */}
              </div>
            </div>
            {paymentInfo.length > 0 && paymentInfo.map((payment, index) => (
              <div key={index}>
                <div className="info-row">
                  <div className="left">결제 일시</div>
                  <div className="right">{formatDate1(payment.paymentDate)}</div>
                </div>
                <div className="info-row">
                  <div className="left">결제 수단</div>
                  <div className="right">{payment.paymentMethod}</div>
                </div>
                <div className="info-row">
                  <div className="left">결제 금액</div>
                  <div className="right">{payment.paymentAmount.toLocaleString()} 원</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr />

      {(refundInfo.length === 0 && (reservationDetail.reservationStatus === '대기' || reservationDetail.reservationStatus === '입금대기')) && (
        <>
          <div className="user-content-container">
            <button className="reservation-cancel-btn" onClick={cancelReservation}>예약취소</button>
          </div>
          <hr />
        </>
      )}




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


    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserMyReservationDetail />
);