import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminReservation.css';

function AdminReservation() {
const [passengers, setPassengers] = useState([
        {
            id: 1,
            name: "Clara Smith",
            email: "tranthuy.nute@...",
            phone: "(319) 555-0115",
            airline: "ATLANTA JET Airlines",
            flightStatus: "대 기",
            date: "09/18/23",
            time: "08:40",
            seat: "18F",
            destination: "RDU",
        },
        {
            id: 2,
            name: "Floyd Miles",
            email: "vuahiuthoungnt@...",
            phone: "(405) 555-0128",
            airline: "PEGASUS Airlines",
            flightStatus: "완 료",
            date: "09/18/23",
            time: "09:45",
            seat: "1D",
            destination: "RDU",
        },
        {
            id: 3,
            name: "Jerome Bell",
            email: "manhhackit08@...",
            phone: "(252) 555-0126",
            airline: "UIA Airlines",
            flightStatus: "#5028",
            date: "09/18/23",
            time: "12:37",
            seat: "16A",
            destination: "RDU",
        },
        {
            id: 4,
            name: "Ronald Richards",
            email: "binhan628@...",
            phone: "(208) 555-0112",
            airline: "MONTANA Airways",
            flightStatus: "#5028",
            date: "09/18/23",
            time: "16:45",
            seat: "2E",
            destination: "RDU",
        },
    ]);

     const [reservationList, setReservationList] = useState([]);

       useEffect(() => {
            axios.get('/adminReservation/getList')
                .then(response => {
                    console.log(response.data);
                    setReservationList(response.data);
                })
                .catch(error => {
                    console.log('Error Category', error);
                });
        }, [])

  const [category, setCategory] = useState({
    categoryLevel: 0,
    parentCategoryLevel: 0,
    serviceName: '',
    servicePrice: 0,
    serviceContent: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory({
      ...category,
      [name]: value
    });
  };

 const clickBtn = () => {
    axios.post('/adminReservation/setCategory', category)
      .then(response => {
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.log('Error Category:', error);
      });
  };



  return (





    <div>

    <div className="user-main-container">
          {/* 상단 네비게이션 */}
          <div className="user-top-nav">
            <div className="user-top-btns">
              <button type="button">&lt;</button>
              <div className="logo">HandyLink !</div>
              <button type="button">&gt;</button>
            </div>
          </div>

          <div className="user-main-content" >

          {reservationList.map((value, index) => (
            <div className="user-content-container"  key={index}>
              <div className="reservation-header">
                <span className="reservation-status">{value.reservationStatus}</span>
                <div className="reservation-time">2024-10-03 04:06</div>
              </div>
              <div className="store-name">{value.storeName} </div>
              <div className="product-details">미니 팬케이크 {value.reservationPrice}</div>

              <div className="reservation-info">
                <div className="date">
                  <i className="fas fa-calendar"></i>
                  <span>{value.regTime}</span>
                </div>
               <div className="time">
                  <i className="fas fa-clock"></i>
                  <span>{value.reservationNo}</span>
                </div>
                </div>
               </div>
  ))}


        </div>
       </div>

       <div className="management-container">
                   <div className="management-header">
                       <h2>Management</h2>
                       <div className="top-controls">
                           <input type="text" placeholder="Search" />
                           <select>
                               <option value="all">All passengers</option>
                           </select>
                       </div>
                   </div>

                   <table className="management-table">
                       <thead>
                           <tr>
                               <th></th>
                               <th>
                                   <div>Name <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Email <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Phone <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Airline <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Status <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Date <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Time <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Seat <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                               <th>
                                   <div>Destination <span className="material-symbols-outlined">expand_all</span></div>
                               </th>
                           </tr>
                       </thead>
                       <tbody>
                           {passengers.map((passenger) => (
                               <tr key={passenger.id}>
                                   <td><input type="checkbox" /></td>
                                   <td><img src="/img/user_basic_profile.jpg" alt={passenger.name} /> {passenger.name}</td>
                                   <td>{passenger.email}</td>
                                   <td>{passenger.phone}</td>
                                   <td>{passenger.airline}</td>
                                   <td><button className="flight-btn">{passenger.flightStatus}</button></td>
                                   <td>{passenger.date}</td>
                                   <td>{passenger.time}</td>
                                   <td>{passenger.seat}</td>
                                   <td>{passenger.destination}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>

                   {/* Pagination can be added here if needed */}
                   {/* <div className="pagination">
                       <span>Rows per page: 14</span>
                       <span>1-4 of 4</span>
                       <button>&lt;</button>
                       <button>&gt;</button>
                   </div> */}
               </div>

    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AdminReservation />
);