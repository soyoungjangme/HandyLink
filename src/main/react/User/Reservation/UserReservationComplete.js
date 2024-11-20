import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import './UserReservationComplete.css';


function UserReservationComplete() {
  


//------------------------------------



 return (
   <div>   
          결제가 완료되었습니다 !


          <a href='/UserMain.user'> 홈으로 가기 </a>
          주문내역으로 가기 이런것도 ㄱㅊ을듯
     </div>
  )
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <UserReservationComplete />
);



