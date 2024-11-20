import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { format, addHours } from 'date-fns';
import "./UserReservationDate.css";
// import Calendar from 'react-calendar';
import moment from 'moment';
// import 'react-calendar/dist/Calendar.css';
import 'moment/locale/ko'; // 한국어 로케일 추가

function UserReservationDate() {
  const [cateId, setCateId] = useState(0);

moment.locale('ko'); // moment의 로케일을 한국어로 설정
  const [storeOpenTime, setStoreOpenTime] = useState('');
  const [storeCloseTime, setStoreCloseTime] = useState('');

  const loadFromSessionStorage = () => {
    const storedCloseTime = sessionStorage.getItem('storeCloseTime');
    const storedOpenTime = sessionStorage.getItem('storeOpenTime');

    // null 체크 후 기본값 설정
    setStoreCloseTime(storedCloseTime || '00:00'); // 기본값 설정
    setStoreOpenTime(storedOpenTime || '00:00'); // 기본값 설정

    // 로드한 값 확인
    console.log(`Loaded Open Time: ${storedOpenTime}, Loaded Close Time: ${storedCloseTime}`);
  };

  useEffect(() => {
    loadFromSessionStorage(); // 저장된 데이터를 불러옴
  }, []);

  const [offDay, setOffDay] = useState([]); //고정휴무 불러오기
  const [setDay, setSetDay] = useState([]); //고정휴무 불러오기

  const storeNo = sessionStorage.getItem('storeNo');
  const storedData = sessionStorage.getItem('storeInfo');
  // 가져온 데이터를 변환하여 바로 사용
  const storeInfo = storedData ? JSON.parse(storedData) : null;
  console.log(storeInfo);


  const [disabledDates, setDisabledDates] = useState([]);
  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);


    axios
      .get(`/adminReservation/getListDetail/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReserveModi(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

    axios
      .get(`/userReservation/getNoSlot/${categoryId}`)
      .then(response => {

        // 상태 업데이트
        setDisabledDates(response.data);
        console.log('비활성화할 날짜ssssssss:', response.data); // 비활성화할 날짜 확인
      })


      axios
      .get(`/userReservation/getDateTime2/${categoryId}`)
      .then(response => {
        console.log('첫 번째 API 응답 데이터:', response.data); // 응답 데이터 전체를 출력
        setDateTime2(response.data);
      }
      )
       
      axios
      .get(`/adminStore/getOffDay?storeNo=${storeNo}`)
      .then(response => {
        console.log('고정', response.data); // 응답 데이터 전체를 출력
        setOffDay(response.data);
      }
      )
       
      axios
      .get(`/adminStore/getOffSet?storeNo=${storeNo}`)
      .then(response => {
        console.log('지정', response.data); // 응답 데이터 전체를 출력
        setSetDay(response.data);
      }
      )
       


  }, []);


  // 날짜 비활성화 
  const tileDisabled = ({ date }) => {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

          //     const formattedDate = date.toISOString().split('T')[0];
      //     return disabledDates.includes(formattedDate);

    // 오늘과 3개월 후의 날짜 사이의 날짜는 비활성화 하지 않음
    return date < today || date > threeMonthsLater;
  };



  const [date, setDate] = useState(new Date());
  const [dateTime, setDateTime] = useState([]);
  const [dateTime2, setDateTime2] = useState([]);

  const handleDateChange = (newDate) => { 
    console.log("실행됨 ----------");

    setSelectSlot2('00:00');
    setSelectedSlot(null);   // 선택된 슬롯 초기화
    setDate(newDate);
    const adjustedDate = addHours(newDate, 9);
    const formattedDate = format(adjustedDate, 'yyyy-MM-dd');
    console.log(formattedDate);

    

    const cateId2 = cateId
    const intCateId = parseInt(cateId, 10);

    axios.post(`/userReservation/getDateTime/${cateId}`, { reservationSlotDate: formattedDate  })
      .then(response => {
        console.log('첫 번째 API 응답 데이터:', response.data); // 응답 데이터 전체를 출력
        const firstItem = response.data[0];
        const { reservationSlotKey } = firstItem;

        setRSloyKey(reservationSlotKey);
        setDateTime(response.data);

        console.log('reservationSlotKey:', reservationSlotKey); // reservationSlotKey 값을 확인

        // reservationSlotKey를 받아온 후에 두 번째 API 호출
        // return axios.post('/userReservation/getSlotTime', { reservationSlotKey: reservationSlotKey });
      })

      // .then(response => {
      //   const reservedTimes = response.data.map(slot => slot.reservationTime);
      //   // 모든 시간 변환

      //   const formattedReservedTimes = reservedTimes.map(convertTo12HourFormat);

      //   console.log('변환된 예약 시간:', formattedReservedTimes);

      //   setDisabledTimes(formattedReservedTimes); // 상태로 저장
      //   console.log('예약된 시간:', reservedTimes);

      //   // console.log('Slot Time API 호출 성공:', response.data);
      // })
      // .catch(error => {
      //   console.error('API 호출 실패:', error);
      // });

  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // 12시 처리
    return `${period} ${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };


  const [disabledTimes, setDisabledTimes] = useState([]); // disabled 시킬 시간을 관리하는 상태

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);



    while (start <= end) {
      const timeString = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 예약된 시간과 비교해서 일치하면 해당 시간을 disabled 시킴
      // console.log(timeString);
      const isDisabled = disabledTimes.includes(timeString);

      slots.push({
        time: timeString,
        disabled: isDisabled, // 이 값에 따라 disabled 처리
      });

      start.setMinutes(start.getMinutes() + 30); // 30분 추가
    }

    return slots;
  };

  // 시간 문자열에서 HH:MM 형식으로 잘라내기


  const storeOpenTime2 = storeOpenTime.slice(0, 5); // '17:00'
  const storeCloseTime2 = storeCloseTime.slice(0, 5); // '20:00'

  // 시간 슬롯을 렌더링하는 부분
  const timeSlots = generateTimeSlots(storeOpenTime2, storeCloseTime2); // 시작 및 종료 시간 설정


  // 선택된 슬롯의 인덱스를 저장
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectSlot2, setSelectSlot2] = useState('00:00');
  const [rSloyKey, setRSloyKey] = useState(0);

  const handleSlotClick = (index) => {
    setSelectedSlot(index === selectedSlot ? null : index);  // 슬롯 선택/해제
  };

  const handleSlotClick2 = (slot) => {
    // console.log(`Selected time slot: ${slot}`);
    setSelectSlot2(slot);
  };

  const handleSlotClick3 = (reservationSlotKey) => {
    // console.log(`Selected time slot: ${reservationSlotKey}`);
  };

  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  console.log("날짜:" + formattedDate);
  



  
  
  const [selectSlot3, setSelectSlot3] = useState('00:00');
  
  useEffect(() => {
    const formattedSlot = selectSlot2.replace(/오전\s+|오후\s+/g, '').trim();
    
    // "오후 03:00" 또는 "오전 03:00"에서 "15:00" 또는 "03:00"으로 변환
    const timeParts = formattedSlot.split(':');
    let hours = parseInt(timeParts[0]);
    const isAfternoon = selectSlot2.includes('오후');
    
    if (isAfternoon && hours < 12) {
      hours += 12; // 12시간 형식에서 24시간 형식으로 변환
    } else if (!isAfternoon && hours === 12) {
      hours = 0; // 12AM을 00으로 변환
    }
    
    const resultSlot = `${String(hours).padStart(2, '0')}:${timeParts[1]}`;
    
    console.log(`Selected time slot: ${resultSlot}`);
    setSelectSlot3(resultSlot);
    sessionStorage.setItem('resultSlot', resultSlot);
  }, [selectSlot2]);
  
  
  const [reserveModi, setReserveModi] = useState('');
  
  useEffect(() => {
    
    
  }, [cateId]);

  
  const goToAdminPage = (id) => {
    if(selectSlot3 === '00:00' ){
      alert('시간을 선택해주세요');
      return;
    }
    sessionStorage.setItem('reservationSlotKey', rSloyKey);
    sessionStorage.setItem('selectSlot', selectSlot3);
    sessionStorage.setItem('formattedDate', formattedDate);
    sessionStorage.setItem('storeNo', storeNo);
    sessionStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    window.location.href = `../UserReservationOption.user/${id}`;
  };

  
  //   const tileContent = ({ date }) => {
    //      // 타일 내용이 필요 없으므로 빈 div를 반환
    // const tileContent = () => {
      //   return <div style={{ visibility: 'hidden' }}></div>; // 보이지 않도록 설정
      // };
      //   };
      
      
      // 비활성화할 날짜 리스트 예시 (YYYY-MM-DD 형식)
      // const disabledDates = ['2024-10-23', '2024-10-24'];
      
      
      
      
     
        
        // const isDateDisabled = (date) => {
          //   // 선택한 날짜의 슬롯을 확인하여 disabled 여부를 반환
          //   const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
          //   const slot = dateTime.find(slot => slot.date === formattedDate); // 해당 날짜의 슬롯 찾기
  //   return slot && slot.slotStatusCount === slot.slotCount; // 슬롯이 모두 채워졌다면 true 반환
  // };



  
  const getTileClass = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-CA'); // 'yyyy-mm-dd' 형식으로 변환 (로컬 시간 기준)
    
    // 고정휴무일 확인
    const isOffDay = offDay.includes(formattedDate) || setDay.some((day) => {
      const dayOffStart = new Date(day.dayOffStart).toLocaleDateString('en-CA');
      const dayOffEnd = new Date(day.dayOffEnd).toLocaleDateString('en-CA');
      return formattedDate >= dayOffStart && formattedDate <= dayOffEnd; // 해당 날짜가 고정휴무 기간에 포함되는지 체크
    });
    // const formattedDate = date.toLocaleDateString('en-CA'); // 'yyyy-mm-dd' 형식으로 변환 (로컬 시간 기준)
  
    // 날짜의 요일을 한글로 가져오기 (ex: '월요일', '화요일' 등)
    const dayOfWeek = date.toLocaleString('ko-KR', { weekday: 'long' });
  
    // 고정휴무일 확인 (요일 기준)
    const isOffDay2 = offDay.includes(dayOfWeek);
  
    if (isOffDay2) {
      return 'reserved'; // 고정휴무일인 경우 'off-day' 클래스 반환
    }
  
    if (isOffDay) {
      return 'reserved'; // 고정휴무일인 경우 'off-day' 클래스 반환
    }
  
    // 예약 정보 확인
    const slot = dateTime2.find((slot) => slot.reservationSlotDate === formattedDate); // 해당 날짜의 예약 정보 찾기
    if (slot) {
      // console.log(`Checking slot for date ${formattedDate}:`, slot);
      if (slot.slotStatusCount === slot.slotCount) {
        return 'reserved'; // 예약이 모두 찼다면 'reserved' 클래스 반환
      }
    }
  
    return ''; // 예약이 찼지 않거나 slot이 없으면 빈 문자열 반환
  };
  
  
    // 뒤로가기 추가
    const handleGoBack = () => {
      window.history.back();
    };


    // const [date, setDate] = useState(new Date());
    const [noSlotsMessage, setNoSlotsMessage] = useState(false);
  

    const handleDateClick = (selectedDate) => {
      setDate(selectedDate);
    
      // 선택한 날짜가 'reserved' 클래스인지 확인
      const isReserved = getTileClass({ date: selectedDate }) === 'reserved';
      setNoSlotsMessage(isReserved); // 'reserved' 날짜를 클릭하면 예약 불가 메시지 표시
      if (isReserved) {
        console.log('예약불가');
      }
    };
    

  return (
    <div className="user-main-container">
      <div className="search-top"> 
        <div className='left'> <i class="bi bi-chevron-left"  onClick={handleGoBack}> </i> 예약일 선택</div>
        <div className='right'></div>
      </div>

      <div className="user-main-content">
      <div className="user-content-first-content">
              <div className="store-name-box">
                <div style={{ display: 'flex' }}>
                  {/*<button type="button">
                    <i className="bi bi-star"></i>
                  </button>*/}

                  {/* <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(storeInfo); }}>
                    <i className={`bi bi-heart-fill ${isBookmarked.includes(storeInfo.storeNo) ? 'like' : ''}`}></i>
                  </button> */}

                  <div className="store-name">{storeInfo.storeName}</div>
                </div>
                {/* <button type="button" onClick={handleInquiryClick}><i className="bi bi-chat-dots"></i></button>문의하기 버튼 */}
              </div>
              <div className="store-basic-info">
                <div className="store-addr"> <img src="../img/store/shop2.png"/> {storeInfo.addr}   {storeInfo.addrdetail}</div>
              </div>
              {/* <hr /> */}
              <div className="store-basic-info"><img src="../img/store/clock.png"/> {storeInfo.formattedOpenTime} ~ {storeInfo.formattedCloseTime}</div>
              <div className="store-basic-info"><img src="../img/store/telephone.png" /> {storeInfo.managerPhone}</div>
            </div>

            <div className="user-content-container10">
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

        <div className="user-content-container3">
          <div className="user-reserve-date-title">예약일 선택</div>
          <hr />

          <div className="user-reserve-date-calender">
        
          <div>


      <Calendar
        onChange={handleDateChange}
        value={date}
        onClickDay={handleDateClick} // 날짜 클릭 시 이벤트
        locale="en-US" // 미국 로케일 설정 (일요일부터 시작)
        next2Label={null}
        prev2Label={null}
        tileDisabled={tileDisabled}
        tileClassName={getTileClass} // 날짜 스타일링
        formatDay={(locale, date) => moment(date).format('D')} // 날짜 표시 형식 (예: 1, 2, 3 등)
        formatDay={(locale, date) => moment(date).format('D')} // 날짜 표시 형식 (예: 1, 2, 3 등)
              formatShortWeekday={(locale, date) =>
                ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
              } // 요일을 한국어로 표시
         formatMonthYear={(locale, date) =>
                 `${moment(date).format('YYYY년 MMM')}`
               } // 월을 한국어로 표시
      />
    </div>
          </div>



          {dateTime.map((slot) => (
  !noSlotsMessage ? (
    <div key={slot.reservationSlotKey}>
      <div className="user-reserve-date-time">
        {timeSlots.map((timeSlot, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              handleSlotClick(index); // 슬롯 선택 관리
              handleSlotClick2(timeSlot.time); // 슬롯 시간 출력
              handleSlotClick3(slot.reservationSlotKey);
            }}
            disabled={disabledTimes.includes(timeSlot.time)} // 비활성화 조건 추가
            style={{
              backgroundColor: selectedSlot === index ? '#fd8517' : 'transparent',
              color: selectedSlot === index ? 'white' : 'black',
              opacity: disabledTimes.includes(timeSlot.time) ? 0.5 : 1, // 비활성화된 슬롯의 투명도 조절
            }}
          >
            {timeSlot.time} {/* 슬롯 시간 표시 */}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className='msg1'>
      예약 가능한 시간이 없습니다. <br /> 다른 날짜를 선택해주세요.
    </div>
  )
))}

        </div>
        <div className="user-content-container3">
          <div className="user-reserve-data">
            <div><i className="bi bi-calendar-check-fill"></i>{date.toLocaleDateString()}</div>
            <div><i className="bi bi-clock-fill"></i>{selectSlot2}</div>
          </div>
        </div>


        <div className="user-content-last">
          <button type="button" onClick={() => goToAdminPage(cateId)}>다음 <i className="bi bi-chevron-right"></i></button>
        </div>
      </div>

    
    </div>
  );
};

// 페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserReservationDate />
);
