import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import "./userStoreDetailService.css";


function UserStoreDetailService() {

  const [reservationList, setReservationList] = useState([]);

       useEffect(() => {
            axios.post('/UserStoreDetail/getStoreMainCategory',{StoreId : 'bbb123'})
                .then(response => {
                    console.log(response.data);
                    setReservationList(response.data);
                })
                .catch(error => {
                    console.log('Error Category', error);
                });
        }, []);

        const goToAdminPage = (id) => {
          window.location.href = `/UserReservationDate.user/${id}`;
      };

      
      

 return (
   <div>
     <div className="user-main-container">
     <div className="user-top-nav">
        <div className="user-top-btns">
          <button type="button"> &lt; </button>
          <div className="logo">HandyLink</div>
          <button type="button"> &gt; </button>
        </div>
      </div>

      <div className="user-main-content">
        <div className="user-content-first">
          <div className="user-content-first-img">
            {/* 이미지 부분에 필요한 경우 src 설정 */}
         <img src="/img/store001.jpeg" alt="가게 이미지" width="100%" height="300px" />
          </div>
          <div className="user-content-first-img-num">

          </div>

          <div className="user-content-first-content">
            <div className="store-name">
              <div>팬케이크샵 가로수길점</div>
              <button type="button"><i className="bi bi-star"></i></button>
            </div>
            <div><i className="bi bi-shop"></i> 서울 강남구 강남대로162길 21 1층 </div>
            <hr />
            <div><i className="bi bi-alarm-fill"></i> 09:00 ~ 21:00 </div>
            <div><i className="bi bi-telephone-fill"></i> 070 - 1236 -7897</div>
          </div>
        </div>

        <div className="store-detail-menu">
          <button type="button">홈</button>
          <button type="button">정보</button>
          <button type="button">예약</button>
          <button type="button">리뷰</button>
        </div>
        {reservationList.map((value, index) => (

        <div class="user-content-container" key={index} onClick={() => goToAdminPage(value.categoryId)}>       
                <div class="user-reserve-menu">
                  <div class="user-reserve-menu-img"> 
                  <img src="/img/user_basic_profile.jpg" />
                  </div>
                  <div class="user-reserve-menu-content"> 
                    <div> {value.serviceName} </div>
                    <div>
                      {value.serviceContent}
                    </div>
                    <div> {value.servicePrice} 원 ~ </div>
                  </div>
                </div>    
              </div>
                ))}

    
      </div>


      <div className="user-bottom-nav">
        <a href="#"><span>메인</span></a>
        <a href="#"><span>검색</span></a>
        <a href="#"><span>예약</span></a>
        <a href="#"><span>문의</span></a>
        <a href="#"><span>MY</span></a>
      </div>
     </div>
   </div>
  )
};

//페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <UserStoreDetailService />
);




