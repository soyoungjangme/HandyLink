import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminReserveManageDetail.css';

function AdminReserveManageDetail() {
  const [cateId, setCateId] = useState(0);
  const [reservationList, setReservationList] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState([]);
  const [refundInfo, setRefundInfo] = useState([]);
  const [reservationDetail, setReservationDetail] = useState({});
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [updatingReservationId, setUpdatingReservationId] = useState(null); // 현재 업데이트 중인 예약 ID
  const [newStatus, setNewStatus] = useState(''); // 새로운 예약 상태

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);

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


  // 결제 일시 포맷 (년.월.일 시:분:초)
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


  // 예약 상태 변경
  const [newStatusMap, setNewStatusMap] = useState({});

  const handleStatusChange = (reservationNo, status, storeName) => {
    console.log(reservationNo, status);
    if (window.confirm(`${reservationNo} 예약을 ${status}로 변경하시겠습니까?`)) {
      // 결제 상태 결정
      let paymentStatus = '';
      if (status === '확정' || status === '완료') {
        paymentStatus = '결제완료';  // '확정'일 때 결제완료로 설정
      } else if (status.startsWith('취소')) {
        paymentStatus = '결제취소';  // '취소'일 때 결제취소로 설정
      }


      // 예약 상태 업데이트
      axios.post('/adminReservation/updateStatus', {
        reservationId: reservationNo,
        newStatus: status,
      })
        .then(response => {
          // 결제 상태 업데이트
          return axios.post('/userPaymentStatus/updateStatus', null, {
            params: {
              reservationNo: reservationNo,
              newStatus: paymentStatus,
            },
          });
        })
        .then(response => {
          // 예약 상태 리스트 업데이트
          setReservationList(prevList => prevList.map(item =>
            item.reservationNo === reservationNo ? { ...item, reservationStatus: status } : item
          ));

          // 결제 취소가 필요한 경우 환불 처리
          if (paymentStatus === '결제취소') {
            const customerOrCompanyCancel = (status === '취소(업체)') ? '취소(업체)' : '취소(고객)';
            return axios.post(`/userPaymentCancel/updatePaymentStatus/${reservationNo}`, {
              paymentStatus: paymentStatus,
              storeName: storeName,
              reservationStatus: customerOrCompanyCancel
            });
          }
        })
        .then(response => {
          console.log('환불 처리 완료:', response.data);
          setUpdatingReservationId(null);
          setNewStatusMap(prev => ({ ...prev, [reservationNo]: '' })); // 해당 예약의 상태를 초기화
        })
        .finally(() => {
          window.location.reload();
        })
        .catch(error => {
          console.error('Error updating reservation, payment, or refund status:', error);
        });
    } else {
      setUpdatingReservationId(null);
      setNewStatusMap(prev => ({ ...prev, [reservationNo]: '' })); // 상태 초기화
    }
  };



  return (
    <div>
      <div className="main-contents">

<div className='detail-reserve-box'>
<div className="reserve-status-container">
          <div className="left">승인 상태</div>
          <div className="mid">{reservationDetail.reservationStatus}</div>
          <div className="right">
            <select
              value={newStatus}
              onChange={(e) => {
                const newStatusValue = e.target.value;
                setNewStatus(newStatusValue);
                // 상태 변경 처리 함수 호출
                handleStatusChange(reservationDetail.reservationNo, newStatusValue, reservationDetail.storeName);
              }}
              disabled={
                reservationDetail.reservationStatus === '완료' ||
                reservationDetail.reservationStatus === '취소(업체)' ||
                reservationDetail.reservationStatus === '취소(고객)'
              }
            >
              <option value={reservationDetail.reservationStatus}>{reservationDetail.reservationStatus}</option>

              {reservationDetail.reservationStatus === '대기' || reservationDetail.reservationStatus === '입금대기' ? (
                <>
                  <option value="확정">확정</option>
                  <option value="취소(업체)">취소(업체)</option>
                </>
              ) : (
                <>
                  {reservationDetail.reservationStatus !== '확정' && <option value="확정">확정</option>}
                  {reservationDetail.reservationStatus !== '완료' && <option value="완료">완료</option>}
                  {reservationDetail.reservationStatus !== '취소(업체)' && <option value="취소(업체)">취소(업체)</option>}
                </>
              )}
            </select>
          </div>

        </div>
        <div className="reserve-status-container">
          <div className="left">수령 방식</div>
          <div className="mid">{reservationDetail.userDeliveryType}</div>
          <div className="right">
           
          </div>

        </div>

        <div className="reserve-status-container">
          <div className="left">주문 등록일</div>
          <div className="mid">{formatDate2(reservationDetail.regTime)}</div>
          <div className="right">
           
          </div>

        </div>
</div>
      
        <div className="flex-container">


          {/* 예약자 정보 */}
          <table className="reserve-table">
            <tbody>
              <tr>
                <th colSpan="2">예약자 정보</th>
              </tr>
              <tr>
                <th>이름</th>
                <td>{userInfo.userName}</td>
              </tr>
              <tr>
                <th>전화번호</th>
                <td>{userInfo.userPhonenum}</td>
              </tr>
            </tbody>
          </table>

          {/* 예약 날짜 */}
          <table className="reserve-table">
            <tbody>
              <tr>
                <th colSpan="2">예약 날짜</th>
              </tr>
          
              <tr>
                <th>날짜</th>
                <td>{reservationDetail.reservationSlot?.reservationSlotDate}</td>
              </tr>
              <tr>
                <th>시간</th>
                <td>{(reservationDetail.reservationTime || '정보 없음').slice(0, 5)}</td>
              </tr>
              
            </tbody>
          </table>
        </div>


        {/* 결제 / 환불 정보 */}
        {refundInfo.length > 0 ? (
          //환불 정보
          <table className="reserve-table">
            <tbody>
              <tr>
                <th colSpan="2">환불 정보</th>
              </tr>
              {refundInfo.map((refund) => (
                <React.Fragment key={refund.refundId}>
                  <tr>
                    <th>환불 일시</th>
                    <td>{formatDate1(refund.refundDate)}</td>
                  </tr>
                  <tr>
                    <th>환불 수단</th>
                    <td>{refund.refundMethod}</td>
                  </tr>
                  <tr>
                    <th>환불 금액</th>
                    <td>{refund.refundAmount.toLocaleString()} 원</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          // 결제 정보
          <table className="reserve-table">
            <tbody>
              <tr>
                <th colSpan="2">결제 정보</th>
              </tr>
              {paymentInfo.map((payment, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <th>결제 일시</th>
                    <td>{formatDate1(payment.paymentDate)}</td>
                  </tr>
                  <tr>
                    <th>결제 수단</th>
                    <td>{payment.paymentMethod}</td>
                  </tr>
                  <tr>
                    <th>결제 상태</th>
                    <td>{payment.paymentStatus}</td>
                  </tr>
                  <tr>
                    <th>결제 금액</th>
                    <td>{payment.paymentAmount.toLocaleString()} 원</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}


        {/* 예약 정보 */}
        <table className="reserve-table">
          <tbody>
            <tr>
              <th colSpan="5">예약 정보</th>
              <th colSpan="1"></th>
            </tr>
            {/* 대분류 이름과 가격 출력 */}

            {reservationList.map((item, index) => {
              const isFirstInGroup = index === 0 || reservationList[index - 1].mainCategoryName !== item.mainCategoryName;
              const isMiddleCategoryDifferent = index === 0 || reservationList[index - 1].middleCategoryName !== item.middleCategoryName;

              return (
                <React.Fragment key={index}>
                  {isFirstInGroup && (
                    <tr>
                      <th colSpan="2">{item.mainCategoryName}</th>
                      <td colSpan="3"> </td>
                      <td colSpan="1">{item.mainPrice}원</td>
                    </tr>
                  )}
                  <tr>
                    <th colSpan="2">
                      {isMiddleCategoryDifferent && (
                        <div className="left">
                          <i className="bi bi-check2"></i> {item.middleCategoryName}
                        </div>
                      )}
                    </th>
                    <td colSpan="3">
                      <div className="right">
                        {item.middleCategoryValue != null
                          ? `${item.middleCategoryValue}`
                          : `${item.subCategoryName}`}
                      </div>
                    </td>
                    <td colSpan="1">
                      {item.middleCategoryValue != null ? `${item.middlePrice}원` : `${item.subPrice}원`}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* 요청사항 및 총액 */}

            <tr>
              <th colSpan="5"></th>
              {paymentInfo.length > 0 && paymentInfo.map((payment, index) => (
                <td colSpan="1" key={index}>{payment.paymentAmount.toLocaleString()} 원</td>
              ))}
            </tr>

          </tbody>


        </table>

        <table className="reserve-table">

          <tbody>
            <tr>
              <th >요청사항</th>
              <td >{reservationDetail.customerRequest || '없음'}</td>
            </tr>
          </tbody>
        </table>




      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AdminReserveManageDetail />
);
