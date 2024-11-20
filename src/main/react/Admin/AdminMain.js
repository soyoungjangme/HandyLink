import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import './AdminMain.css';

function AdminMain() {
  const storeId = sessionStorage.getItem('storeId');
  const storeNo = sessionStorage.getItem('storeNo');





  const [events, setEvents] = useState([]); //캘린더 예약 표시
  const [count, setCount] = useState([]); //운영현황
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0]; //날짜형식 포맷
  }); //검색할 날짜
  const [reservationNo, setReservationNo] = useState([]); //해당날짜 예약번호
  const [customerBookInfo, setCustomerBookInfo] = useState([]); //해당 날짜 예약자정보
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState(null); //클릭한 예약자정보


  useEffect(()=>{
    //main-count
    const fetchCount = async() => {
      const resp = await axios.get(`/adminStore/getMainCount?storeNo=${storeNo}`);
      setCount(resp.data);
    };

    //오늘 예약건 조회
    const fetchReservationCounts = async() => {
      try{
        const resp = await axios.get(`/adminStore/getReservationCounts?storeNo=${storeNo}`);
        setEvents(resp.data);

      }catch (error){
        console.error("캘린더 예약 로딩 실패 error ",error);
      }
    }

    const fetchCompletedReservations = async () => {
      try {
        const resp = await axios.get(`/adminStore/getReservationStatus?storeNo=${storeNo}`);
        const completeReservations = resp.data; // 완료된 예약 번호 리스트

        const initialStatus = completeReservations.reduce((acc, reservationNo) => {
          acc[reservationNo] = true;
          return acc;
        }, {});

        setCheckedStatus(initialStatus);
      } catch (error) {
        console.error("완료된 예약건 요청 중 error ", error);
      }
    };

    fetchCount();
    handleClickBook();
    fetchReservationCounts();
    fetchCompletedReservations();
  },[]);

  //날짜 클릭으로 예약 조회하기
  useEffect(() => {
    handleClickBook();
  },[selectedDate]);

  //날짜 받기
  const handleChangeDate = (e) => {
    const {value} = e.target;
    setSelectedDate(value);
  };

  //날짜별 예약정보 보기
  const handleClickBook = async() => {
    setSelectedCustomerInfo(null);

    const reservationSlotDate = selectedDate || new Date().toISOString().split('T')[0];
    try {
      const resp = await axios.get(`/adminStore/getReservationNo?storeNo=${storeNo}&reservationSlotDate=${reservationSlotDate}`);
      const reservationNo = resp.data;
      setReservationNo(reservationNo);

      if (Array.isArray(reservationNo) && reservationNo.length > 0) {
        const response = await axios.get('/adminStore/getTodayCustomer', {
          params: {
            reservationNo: reservationNo.join(',')
          }
        });

        // 시간 형식을 12:00 형태로 변경
        const formattedData = response?.data?.map(customer => ({
          ...customer,
          reservationTime: customer.reservationTime.slice(0, 5) // "HH:MM:SS" -> "HH:MM"
        })) || [];

        setCustomerBookInfo(formattedData);
      }else{
        setCustomerBookInfo([]);
      }
    }catch (error){
      console.error("해당날짜 예약정보 부르는 중 error ", error);
    }
  };

  //개별 예약정보 보기
  const handleChangeRadio = (e) => {

    const selectedReservationNo = e.target.value; // 예약 번호 (문자열일 수 있음)
    console.log("이거 예약번호", selectedReservationNo);

    // 예약 번호를 기준으로 예약자 정보를 찾음
    const selectedCustomer = customerBookInfo.find(customer => {
      return customer.reservationNo.toString() === selectedReservationNo;//문자열 비교
    });

    setSelectedCustomerInfo(selectedCustomer || null);
  };

  console.log("클릭한 예약자 ",selectedCustomerInfo);


  const [checkedStatus, setCheckedStatus] = useState({});

  // 전달완료 체크박스 상태 변경 함수
  const handleCheck = async (reservationNo) => {
    try {
      // 예약 상태 업데이트
      const resp = await axios.post(`/adminStore/completeReservationStatus?storeNo=${storeNo}&reservationNo=${reservationNo}`);
      const complete = resp.data;

      if (complete > 0) {
        // 상태를 업데이트하여 UI에 반영
        setCheckedStatus((prevStatus) => ({
          ...prevStatus,
          [reservationNo]: true, // 완료 상태로 업데이트
        }));
      }
    } catch (error) {
      console.log("전달완료 요청 중 error ", error);
    }
  };

  console.log("count ", count);

  return(
  <div className="admin-store-regist-container">
    <div className="container">

        <div className="main-grid">
          <div className="main-grid-container">

              <div className="status-container main-count">
                <div className="reservation-status">
                  <div className="today-title">Today 현황</div>

                  <div className="today-status">
                    <div className="status-item">
                      <p className="complete" >전달완료</p>
                      <p>{count.todayCompleteCount} 건</p>
                    </div>
                    <div className="status-item">
                      <p className="remain" >남은예약</p>
                      <p>{count.todayRemainCount} 건</p>
                    </div>
                  </div>

                  <div className="status-item">
                    <p className="new" >예약대기</p>
                    <p>{count.waitCount} 건</p>
                  </div>

                  <div className="status-item">
                    <p className="cancle">예약확정</p>
                    <p>{count.doingCount} 건</p>
                  </div>

                  <div className="status-item">
                    <p className="userLikeCount" >찜</p>
                    <p>{count.userLikeCount} 개</p>
                  </div>

                  <div className="status-item">
                    <p className="reviewCount" >리뷰</p>
                    <p>{count.reviewCount} 개</p>
                  </div>
                </div>
              </div>

              <div className="today-booking2">
                <h3><i className="bi bi-shop-window"></i>Today 예약</h3>
                <div className="date-search-box">
                  <input type="date" value={selectedDate} onChange={handleChangeDate}/>
                  <button type="button" className="btn-today" onClick={handleClickBook}>예약보기</button>
                </div>

                <div className="table-wrapper2">
                  <table>
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>예약시간</th>
                        <th>보기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBookInfo.length > 0 ? (
                        customerBookInfo.map((customer, index)=>(
                          <tr key={index}>
                            <td>{customer.userName}</td>
                            <td>{customer.reservationTime}</td>
                            <td><input type="radio" name="reservation" value={customer.reservationNo} checked={selectedCustomerInfo?.reservationNo === customer.reservationNo} onChange={handleChangeRadio}/></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">예약정보가 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>

          <div className="main-grid-container2">

            <div className="calendar" style={{ width: 'auto', margin: 'auto' }}>
              <div className="calendar-header">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale="ko"
                  events={events}
                  dateClick={(info) => setSelectedDate(info.dateStr)}
                  dayCellClassNames={() => 'calendar-day-cell'}
                  dayCellContent={(arg) => (
                    <div style={{ padding: '5px', fontSize: '0.8em' }}>
                      <span>{arg.dayNumberText}</span>
                    </div>
                  )}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth',
                  }}
                  height="auto" // 높이를 자동으로 맞추기

                />
              </div>
            </div>







            <div className="customer-info-container">
              <div className="customer-info-title">
                <h3>예약 정보</h3>
                {selectedCustomerInfo ? (
                  <label className={`custom-checkbox ${checkedStatus[selectedCustomerInfo.reservationNo] ? 'checked' : ''}`}>
                    {checkedStatus[selectedCustomerInfo.reservationNo] ? (
                      // 완료된 경우, "전달완료" 텍스트만 표시
                      <span>전달완료</span>
                      ) : (
                      // 완료되지 않은 경우, 체크박스를 클릭 가능하게 표시
                      <>
                        <input
                          type="checkbox"
                          checked={!!checkedStatus[selectedCustomerInfo.reservationNo]}
                          onChange={() => handleCheck(selectedCustomerInfo.reservationNo)}
                          style={{ display: 'none' }} // 체크박스 숨김
                        />
                        고객님께 전달되었나요?
                      </>
                    )}
                  </label>
                ) : null}
              </div>
              <div className="customer-info">
                <div className="customer-detail">
                  <div className="customer-group">
                    <label>예약자</label>
                    <div>  {selectedCustomerInfo?.userName || ''} </div>
                  </div>
                  <div className="customer-group">
                    <label>연락처</label>
                    <div> {selectedCustomerInfo?.userPhoneNum || ''} </div>
                  </div>
                  <div className="customer-group">
                    <label>방문시간</label>
                    <div> {selectedCustomerInfo?.reservationTime || ''} </div>
                  </div>
                  <div className="customer-group">
                    <label>결제방식</label>
                    <div> {selectedCustomerInfo?.paymentMethod || ''} </div>
                  </div>
                  <div className="customer-group">
                    <label>결제금액</label>
                    <div> {(Number(selectedCustomerInfo?.paymentAmount) || '').toLocaleString()} </div>
                  </div>
                </div>

                <div className="customer-reservation">
                  <div className="reservation-content">
                    <label>상품명</label>
                    <div>
                      {selectedCustomerInfo?.options?.find(option => option.categoryLevel === '1')?.serviceName || ''}
                    </div>
                  </div>

                  <div className="reservation-content">
                    <label>옵션</label>
                    <div className="reservation-option">
                      {/* 레벨 2 옵션과 그 하위 레벨 3 옵션을 묶어서 출력 */}
                      {selectedCustomerInfo?.options
                        ?.filter(option => option.categoryLevel === '2')
                        .map((level2Option) => (
                          <div className="option" key={level2Option.categoryId}>
                            <p>{level2Option.serviceName}</p>
                            {level2Option.middleCategoryValue ? (
                              <div className="option-detail">
                                <p> {level2Option.middleCategoryValue} </p>
                              </div>
                              ) : (
                              /* 레벨 2 하위에 해당하는 레벨 3 옵션 출력 */
                              selectedCustomerInfo?.options
                                ?.filter(option => option.parentCategoryId === level2Option.categoryId && option.categoryLevel === '3')
                                .map((level3Option) => (
                                  <div className="option-detail" key={level3Option.categoryId}>
                                    <p>{level3Option.serviceName}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          ))
                      }
                    </div>
                  </div>

                  <div className="reservation-content">
                    <label>요청사항</label>
                    <div> {selectedCustomerInfo?.customerRequest ?? "없음"} </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    </div>
  </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AdminMain />
);