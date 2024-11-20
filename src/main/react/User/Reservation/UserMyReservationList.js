import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaCalendar, FaClock } from 'react-icons/fa';
import './userMyReservationList.css';



function UserMyReservationList() {




  // -------------

  const [reservationList, setReservationList] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [reviewBtn, setReviewBtn] = useState(false);

  useEffect(() => {
    // Fetch user profile and then fetch reservations
    axios.get(`/user/profile`)
      .then(response => {
        console.log(response.data);
        setUserInfo(response.data);
        const extractedUserId = response.data.userId; // Extract userId here

        // Now make the second API call for reservations
        return axios.post('/userMyReservation/getMyReserveList', { userId: extractedUserId });
      })
      .then(response => {
        console.log(response.data);
        setReservationList(response.data);
      })
      .catch(error => {
        console.log("Error occurred:", error);
      });



  }, []);


  const [category, setCategory] = useState({
    categoryLevel: 0,
    parentCategoryLevel: 0,
    serviceName: '',
    servicePrice: 0,
    serviceContent: ''
  });

  const goToUserPage = (id) => {
    window.location.href = `../UserMyReservationDetail.user/${id}`;
  };

  const goToReview = (id) => {
    window.location.href = `../UserReviewRegist.user/${id}`;
  };

  const formatDate = (timeString) => {
    // Create a Date object from the time string
    const date = new Date(`1970-01-01T${timeString}`);
    
    // Format it to HH:mm
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${hours}:${minutes}`;
  };
  

  const formatDate2 = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 초 추가

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`; // 초 포함
};



  return (
    <div>




      
      <div className="user-main-content" >

      <div className="search-top">
            <div className='left'> 예약 내역</div>
            
          </div>






          {reservationList.length > 0 ? (
  reservationList.map((value, index) => (
    <div className="user-content-container11" key={index} onClick={() => { goToUserPage(value.reservationNo) }}>
      <div className="reservation-header">
        <span className={`reservation-status ${
          value.reservationStatus === '입금대기' || value.reservationStatus === '대기' ? 'status-pending' : 
          value.reservationStatus === '확정' ? 'status-confirmed' :
          value.reservationStatus === '완료' ? 'status-completed' :
          value.reservationStatus === '취소(고객)' || value.reservationStatus === '취소(업체)' ? 'status-canceled' :
          ''
        }`}>
          {value.reservationStatus}
        </span>
        <div className="reservation-time">{formatDate2(value.regTime)} </div>
      </div>
      
      <div className="store-name-title">{value.storeName} <i className="bi bi-chevron-right"></i> </div>
      <div className="product-details">{value.serviceName} | {value.reservationPrice} 원</div>

      <div className="reservation-info">
        <div className="reservation-info-box">
          <div className="date">
            <i className="bi bi-calendar-check-fill"></i>
            <span>{value.reservationSlotDate} </span>
          </div>
          <div className="time">
            <i className="bi bi-clock-fill"></i>
            <span>{formatDate(value.reservationTime)}</span>
          </div>
        </div>
      </div>

      {value.reviewCount === 0 && value.reservationStatus === '완료' && (
        <button className="review-write-btn"
          onClick={(event) => {
            event.stopPropagation(); // Prevents event bubbling
            goToReview(value.reservationNo); // Call the function to navigate to the review page
          }}
        >
          리뷰 작성하기
        </button>
      )}
    </div>
  ))
) : (
  <div className="no-reservation-message">
    예약 내역이 없습니다.
  </div>
)}


      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserMyReservationList />
);