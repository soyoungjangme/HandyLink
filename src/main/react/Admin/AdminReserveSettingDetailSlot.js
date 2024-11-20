import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminReserveSettingDetailSlot.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // 기본 스타일
import 'react-date-range/dist/theme/default.css'; // 기본 테마
// import { LocalizationProvider, DateRangePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from 'date-fns/locale/ko'; // 한국어 로케일
// import {DateRangePicker} from '@adobe/react-spectrum'
// import { Provider } from '@adobe/react-spectrum';
// import { DateRangePicker } from '@adobe/react-spectrum';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import slotShouldForwardProp from '@mui/material/styles/slotShouldForwardProp';
import { tr } from 'date-fns/locale';

function AdminReserveSettingDetailSlot() {

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
    // 이번 달의 마지막 날 설정
    // const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);




    const [startDate, setStartDate] = useState(new Date()); // 시작일
    const [endDate, setEndDate] = useState(new Date()); // 종료일 
    const [date, setDate] = useState(today); // 시작일과 종료일 배열로 관리
    const [slotFlag , setSlotFlag] = useState(false);

    const handleDateChange = (newDate) => {
        setSlotFlag(false);
        setDate(newDate);
        
        // setIsRange(true);
        console.log(newDate);
        // console.log(JOSN.stringify(date));
        handleDateClick(null);
        // const formattedDate = newDate.toISOString().split('T')[0];

        //   console.log(result);
        // setSlotCounts(result);
      
    };

    const [slotCounts, setSlotCounts] = useState(0);
    const [slotStatusCount, setSlotStatusCount] = useState(0);
    const [limitTimes, setLimitTimes] = useState(0);

        
    // 수정 완료 핸들러
    const handleSaveChanges = () => {
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // KST로 변환
        const kstDateString = kstDate.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식


        const kstDate2 = new Date(endDate.getTime() + (9 * 60 * 60 * 1000)); // KST로 변환
        const kstDateString2 = kstDate2.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식

        if (slotFlag === true){ //두개 

            const reservationSlotDates = [startDate, kstDateString2];

           axios.post(`/userReservation/updateSlotCount1/${cateId}`, {reservationSlotDates : reservationSlotDates, slotCount : slotCounts}
            )
            .then(response => {
                console.log("성공");
                alert('변경이 완료되었습니다.');
                axios.get(`/userReservation/getAllDateTime/${cateId}`)
                .then(response => {
                    setReservationList(response.data);
                })
               
            })
            .catch(error => {
                console.log('Error fetching reservation list', error);
            });


        }else if (slotFlag === false){ // 한개 
            axios.post(`/userReservation/updateSlotCount1/${cateId}`, {reservationSlotDate : kstDateString, slotCount : slotCounts}
            )
            .then(response => {
                console.log("성공");
                alert('변경이 완료되었습니다.');
                axios.get(`/userReservation/getAllDateTime/${cateId}`)
                .then(response => {
                    setReservationList(response.data);
                
                })
               
            })
            .catch(error => {
                console.log('Error fetching reservation list', error);
            });
        }else {
            console.log("오류");
        }
        
  
    };


    
    const handleSaveChanges2 = () => {
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // KST로 변환
        const kstDateString = kstDate.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식


        const kstDate2 = new Date(endDate.getTime() + (9 * 60 * 60 * 1000)); // KST로 변환
        const kstDateString2 = kstDate2.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식

        if (slotFlag === true){ //두개 

            const reservationSlotDates = [startDate, kstDateString2];

           axios.post(`/userReservation/updateSlotCount1/${cateId}`, {reservationSlotDates : reservationSlotDates, slotCount : slotStatusCount}
            )
            .then(response => {
                console.log("성공");
                alert('변경이 완료되었습니다.');
                axios.get(`/userReservation/getAllDateTime/${cateId}`)
                .then(response => {
                    setReservationList(response.data);
                })
               
            })
            .catch(error => {
                console.log('Error fetching reservation list', error);
            });


        }else if (slotFlag === false){ // 한개 
            axios.post(`/userReservation/updateSlotCount1/${cateId}`, {reservationSlotDate : kstDateString, slotCount : slotStatusCount}
            )
            .then(response => {
                console.log("성공");
                alert('변경이 완료되었습니다.');
                axios.get(`/userReservation/getAllDateTime/${cateId}`)
                .then(response => {
                    setReservationList(response.data);
                
                })
               
            })
            .catch(error => {
                console.log('Error fetching reservation list', error);
            });
        }else {
            console.log("오류");
        }
        
  
    };


    // -----------------------------------------------------

    const [viewMode, setViewMode] = useState('calendar');
    const [reservationList, setReservationList] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [startMonth] = useState(new Date());

    const [serviceDate, setServiceDate] = useState(''); // 날짜 상태
    const [serviceHour, setServiceHour] = useState(''); // 시간 상태


    const disablePastDates = ({ date, view }) => {
        // view가 "month"일 때만 비활성화 조건 적용
        return view === "month" && date <= startDate;
      };

    const [cateId, setCateId] = useState(0);
    useEffect(() => {
      const path = window.location.pathname;
      const pathSegments = path.split('/');
      const categoryId = pathSegments[pathSegments.length - 1];
      setCateId(categoryId);
      axios.get(`/userReservation/getAllDateTime/${categoryId}`)
      .then(response => {
          console.log(response.data);
          let startDate = '';
          if (response.data.length > 0) {
            const firstServiceStart = response.data[0].serviceStart; // 첫 번째 객체의 serviceStart
            startDate = firstServiceStart; // 상태 업데이트
         
        
        }


          const serviceStart = new Date(startDate);
          const formattedDate = `${serviceStart.getFullYear()}-${String(serviceStart.getMonth() + 1).padStart(2, '0')}-${String(serviceStart.getDate()).padStart(2, '0')}`; // YYYY-MM-DD 형식
          const formattedHour = `${String(serviceStart.getHours()).padStart(2, '0')}`; // HH 형식만 설정
            console.log(formattedDate, formattedHour);
          setServiceDate(formattedDate); // 날짜 상태 설정
          setServiceHour(formattedHour); // 시간 상태 설정
          setReservationList(response.data);
      })
      .catch(error => {
          console.log('Error fetching reservation list', error);
      });
      axios
      .get(`/adminReservation/getListDetail/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReserveModi(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

    }, []);

    useEffect(() => {
        
    }, []);

    // 예약을 날짜에 맞춰 반환하는 함수
    const getReservationsForDate = (date) => {
          // 날짜를 하루 전으로 조정
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() + 1); //

        const dateString = adjustedDate.toISOString().split('T')[0]; // 조정된 날짜를 ISO 형식으로 변환
        return reservationList
            .filter(reservation =>
                reservation.reservationSlotDate === dateString
            )
            .sort((a, b) => new Date(a.reservationSlotDate) - new Date(b.reservationSlotDate));
    };




        const handleDateClick = (date, slotCount, slotStatusCount) => {
            console.log('Clicked Date:', date);
            console.log('Slot Count:', slotCount); // slotCount가 제대로 전달되고 있는지 확인
            console.log(slotStatusCount);
            
            if (slotCount !== undefined && slotCount !== null) {
                setSlotCounts(slotCount);
                setSlotStatusCount(slotStatusCount)
            } else {
                console.error('Invalid slotCount:', slotCount);
            }

            setShowStartDate(false); // 날짜 변경 시, 선택된 날짜 보여주기

            if (date !== null) {
                const dateString = date.toLocaleDateString();
                setSelectedDates([dateString]);
            }
        };


    const btnUpdateStart = () => {
        const localDateTimeString = `${serviceDate}T${serviceHour}:00:00`; // YYYY-MM-DDTHH:MM:SS 형식

        console.log(localDateTimeString);
        axios.post('/userReservation/setUpdateStart', { serviceStart :  localDateTimeString , categoryId : cateId} )
        .then(response => {
        
            console.log(response.data);
            
        }).catch(error => {
            console.log('Error fetching reservation list', error);
        });
        axios.get(`/userReservation/getAllDateTime/${cateId}`)
        .then(response => {
            console.log(response.data);
            let startDate = '';
            if (response.data.length > 0) {
              const firstServiceStart = response.data[0].serviceStart; // 첫 번째 객체의 serviceStart
              startDate = firstServiceStart; // 상태 업데이트
          }
          
            const serviceStart = new Date(startDate);
            const formattedDate = `${serviceStart.getFullYear()}-${String(serviceStart.getMonth() + 1).padStart(2, '0')}-${String(serviceStart.getDate()).padStart(2, '0')}`; // YYYY-MM-DD 형식
            const formattedHour = `${String(serviceStart.getHours()).padStart(2, '0')}`; // HH 형식만 설정
              console.log(formattedDate, formattedHour);
            setServiceDate(formattedDate); // 날짜 상태 설정
            setServiceHour(formattedHour); // 시간 상태 설정
            setReservationList(response.data);
            alert('변경이 완료되었습니다.');
            location.reload();

        })
        .catch(error => {
            console.log('Error fetching reservation list', error);
        });
        
    }

    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentSecond = today.getSeconds();
 // 날짜와 시간을 비교하여 비활성화 조건 확인
 const isDatePastOrToday =  serviceDate <= formattedToday; // Adjusted to include today
//  const isTimePast = serviceDate === formattedToday && serviceHour !== "" && 
//                      (parseInt(serviceHour) < currentHour || 
//                      (parseInt(serviceHour) === currentHour && 
//                          (parseInt(serviceMinute) < currentMinute || 
//                          (parseInt(serviceMinute) === currentMinute && 
//                          parseInt(serviceSecond) <= currentSecond))));
 
 // Combine both conditions to determine if the button should be disabled
 const isDisabled = isDatePastOrToday ;
//  || isTimePast; // Disable if date is today or past
 

const handleDateChange2 = (e) => {
    const selectedDate = e.target.value;

    // Check if the selected date is before today
    if (selectedDate < formattedToday) {
      alert('오늘 이전의 날짜는 선택할 수 없습니다.');
    //   setServiceDate(''); // Reset the date if the selected date is invalid
    //   return;
    } else {
      setServiceDate(selectedDate); // Set the selected date if valid
    }

  };



    useEffect(() => {
        console.log("플래그 상태" , slotFlag);
        console.log("true면 date , false 면 ")

    },[slotFlag])
    


    
  const setName = (value) => {
    setReserveAdd((prevState) => ({
      ...prevState,
      serviceName: value
    }));
  };

  const setPrice = (value) => {
    setReserveAdd((prevState) => ({
      ...prevState,
      servicePrice: value
    }));
  };

  const setDescription = (value) => {
    setReserveAdd((prevState) => ({
      ...prevState,
      serviceContent: value
    }));
  };
  const [reserveModi, setReserveModi] = useState('');
  

 // 날짜를 'YYYY/MM/DD' 형식으로 변환하는 함수
 const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줌
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const [showStartDate, setShowStartDate] = useState(true); // 시작일 표시 여부
  const [showDates, setShowDates] = useState(false); // 날짜 표시 여부

  const handleStartDateChange = (date) => {

    setSlotCounts(0);
    setSlotFlag(true);
    // setFilteredReservations([]);
    // 시작일이 변경될 때
    if (date) {
      // 새로운 slotCounts 및 limitTimes 생성
        setStartDate(date);
        
        // 종료일이 시작일보다 이전이라면 종료일을 null로 설정
        if (endDate && date > endDate) {
            setEndDate(null);
        }

        // 시작일을 선택할 때 기존 선택된 날짜 초기화
        setSelectedDates([date.toLocaleDateString()]); // 기존 날짜를 초기화하고 새로운 시작일 추가
        setShowStartDate(true); // 시작 날짜가 변경되면 시작 날짜 보이기
        setShowDates(false); // 종료 날짜가 선택되면 종료 날짜 숨기기
    } else {
        // 시작일이 null이면 초기화
        setSelectedDates([]);
        setStartDate(null);
        setEndDate(null);
        setShowStartDate(false);
        setShowDates(false);
    }
    // console.log(startDate);
};

const handleEndDateChange = (date) => {
    setSlotCounts(0);
    setSlotFlag(true);
    // setFilteredReservations([]);

    // 종료일이 변경될 때
    if (date) {
        

        setEndDate(date);

        // 종료일을 선택할 때 기존 선택된 날짜 초기화
        setSelectedDates((prev) => {
            const startDateString = startDate ? startDate.toLocaleDateString() : null;
            return [startDateString, date.toLocaleDateString()].filter(Boolean); // null 값을 제거
        });

        setShowStartDate(false); // 종료 날짜가 선택되면 시작 날짜 숨기기
        setShowDates(true); // 종료 날짜가 선택되면 선택된 날짜 보이기
    }
    // console.log(endDate);
};


  const filteredReservations = reservationList.filter((reservation) => {
    // date를 KST로 변환하여 문자열로 비교
    const selectedDate = new Date(date);
    const reservationDate = new Date(reservation.reservationSlotDate);

    // KST로 변환하기 위해 9시간 더하기
    selectedDate.setHours(selectedDate.getHours() + 9);
    reservationDate.setHours(reservationDate.getHours() + 9);

    return selectedDate.toISOString().split('T')[0] === reservationDate.toISOString().split('T')[0];
});



  const displayContent = startDate || endDate ? (
        <div>
            {showStartDate ? (
                <>
                    <div>{formattedStartDate}</div> 
                    <div>{formattedEndDate}</div>
                </>
            ) : (
                selectedDates.map((dateString, index) => (
                    <div key={index}>{dateString}</div>
                ))
            )}
        </div>
    ) : null;


const formattedStartDate = startDate ? startDate.toLocaleDateString() : '시작 날짜 없음';
const formattedEndDate = endDate ? endDate.toLocaleDateString() : '종료 날짜 없음';


    useEffect(()=>{
        console.log(slotCounts);
    },[slotCounts])




    return (
        <div>
            <div className="main-content-title">
                <h1> 상품 예약 건수 관리 </h1>
              
            </div>
            <div className="reserve-container">
        <div className="reserve-img">
            <img src={reserveModi.imageUrl} alt="My Image" />
          </div>
          <div className="reserve-content">
            <div className="reserve-content-title">
              <div className="reserve-content-title-name">
                <input
                  type="text"
                  value={reserveModi.serviceName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='서비스 명'
                  disabled
                />
              </div>
              <div className="reserve-content-title-price">
                <input
                  type="number"
                  value={reserveModi.servicePrice}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder='서비스 가격'
                  disabled
                />
              </div>
            </div>
            <div className="reserve-content-text">
              <textarea
                value={reserveModi.serviceContent}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='서비스 설명'
                disabled
              />
            </div>
          </div>
        </div>

{/* 서비스 변경 */}
            <div className='main-slot-box'>
                {/*  서비스 변경  */}
            <div className="main-slot2">

                <div className='main-slot-title'>
                <div> 예약 시작일 </div>
                </div>
                <div  className='main-slot-input'>
                        <input 
                        type="date" 
                        value={serviceDate} 
                        // onChange={(e) => setServiceDate(e.target.value)} 
                        onChange={handleDateChange2}
                        disabled={isDisabled} // 이미 지난 날짜라면 비활성화
                        
                    />

                    {/* 시간 입력을 위한 드롭다운 */}
                    <select 
                    id="time-select" value={serviceHour} 
                    onChange={(e) => setServiceHour(e.target.value)} 
                    disabled={isDisabled}>
                        <option value="">시간 선택</option> {/* 기본 옵션 */}
                        {[...Array(24)].map((_, index) => (
                            <option key={index} value={String(index).padStart(2, '0')}>
                                {String(index).padStart(2, '0')}:00 {/* 두 자리로 표현 */}
                            </option>
                        ))}
                    </select>
                    {!isDisabled && (
                                <button onClick={btnUpdateStart}>수정 완료</button>
                            )}
                </div>

           

          

            </div>
            <hr/>
            </div>

            <div className="main-contents">
                <div className="calendar-and-reservation-info">

                    {/* 빅 캘린더 */}
                    <div className="custom-calendar">
                        <h3>{startMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>

                    
                        <Calendar
                        // minDate={startOfMonth}
                        // maxDate={endOfMonth}
                           showMonthDropdown={false}
                        //    showYearDropdown={false}
                            value={date}
                            locale="en-US"
                            // minDate={today} // 오늘 이후만 선택 가능
                            // maxDate={maxDate} // 이번 달까지만 선택 가능
                            tileDisabled={({ date }) => {
                                // serviceDate가 설정되어 있을 때, serviceDate 이전의 날짜를 비활성화하고 serviceDate는 활성화합니다.
                                return serviceDate && date < new Date(serviceDate).setHours(0, 0, 0, 0); // serviceDate 이전의 날짜만 비활성화
                            }}
                            tileClassName={({ date, view }) => {
                                if (view === 'month') {
                                    const dateString = date.toISOString().split('T')[0];
                                    if (selectedDates.includes(dateString)) {
                                        return 'selected-date';
                                    }
                                }
                                return null;
                            }}
                            tileContent={({ date, view }) => {
                            
                                if (view === 'month') {
                                    const reservations = getReservationsForDate(date);
                                    if (reservations.length > 0) {
                                        return (
                                        
                                            <ul className="reservation-list">
                                                    <button className='slotbtn2' type="button" onDoubleClick={handleSaveChanges2} >
                                            예약 막기
                                           </button>
                                                {reservations.map((reservation) => (
                                                    <li key={reservation.reservationSlotKey} className={reservation.slotCount === reservation.slotStatusCount ? 'equal-slot-count' : ''}>
                                                        {/* {reservation.reservationSlotDate} <br />
                                                        {reservation.storeId} <br /> */}
                                                        ( {reservation.slotStatusCount} / {reservation.slotCount} )
                                                        {/* <p> <i className="bi bi-stopwatch"></i> {reservation.limitTime} </p> */}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                }
                                return null;
                            }}
                            onClickDay={(date) => {
                                // 선택한 날짜에 해당하는 예약 데이터를 찾음
                                const reservationsForDate = getReservationsForDate(date);
                                const slotCount = reservationsForDate.length > 0 ? reservationsForDate[0].slotCount : null;
                                const slotStatusCount = reservationsForDate.length > 0 ? reservationsForDate[0].slotStatusCount : null;
                                // handleDateClick 호출, slotCount 전달
                                handleDateClick(date, slotCount,slotStatusCount);
                              }}
                            // selectRange={isRange}
                            // selectRange={true} // 범위 선택을 허용
                            onChange={handleDateChange}
                        />
                    </div>

                    <div className="reservation-info-container">
                        <h3>기간 지정</h3>   <hr/>
                        <div className='date-range'>

                        <div className='start-box'>
                            <div> 시작일 </div>
                        <DatePicker
                            className='date-picker'
                            selected={startDate}
                            onChange={handleStartDateChange }
                            dateFormat="yyyy/MM/dd"
                            placeholderText="시작 날짜를 선택하세요"
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                        />  
                        </div>

                        <div className='end-box'>
                            
                        <div> 종료일 </div>
                        <DatePicker
                            className='date-picker'
                            selected={endDate}
                            onChange={handleEndDateChange }
                            dateFormat="yyyy/MM/dd"
                            placeholderText="종료 날짜를 선택하세요"
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate} // 시작일 이후로만 선택 가능
                        />
                        </div>
                    
                      </div>

                        <div className='date-box'> {displayContent}  </div>
                              
                        <div>
 
        <div>
        <h3>  예약 건수 수정</h3>  <hr/>
            <div className='slot-num-status'>
          
            <div className='box2'>
            <input
                        type='number'
                        value={slotCounts}
                        onChange={(e) => setSlotCounts(e.target.value)}
                    />
                       <div className='limit-time-status'>
                    {/* <strong>시간별 예약 제한</strong>
                    <input
                        type='number'
                        value={limitTimes}
                        // onChange={}
                    /> */}
                </div>
                
     
            </div>
                  
                <button className='slotbtn' type="button" onClick={handleSaveChanges}>
                    수정 완료
                </button>
            </div>
           

        </div>
{/* 
        <h3>예약 막기</h3>
                        <hr/> */}
 
</div>
                    </div>

                </div>
            </div>

        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminReserveSettingDetailSlot />
);
