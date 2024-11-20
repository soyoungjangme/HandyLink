import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminDelivery.css';
import { useRef } from 'react';
import { isNull } from 'util';
import PrintReservationInfo from './PrintReservationInfo';


function AdminDelivery() {
  
    const today = new Date().toISOString().split('T')[0];
    const [viewMode, setViewMode] = useState('list');
    const [filterServiceName, setFilterServiceName] = useState([]);
    const [manageCalender, setManageCalender] = useState([]);
    const [selectedDates, setSelectedDates] = useState([today]);
    const [displayedDates, setDisplayedDates] = useState([]); // 선택된 날짜를 표시할 상태 추가
    const [startMonth] = useState(new Date());
    const [updatingReservationId, setUpdatingReservationId] = useState(null); // 현재 업데이트 중인 예약 ID
    const [newStatus, setNewStatus] = useState(''); // 새로운 예약 상태


    const [reservationList, setReservationList] = useState([]);
    const [paginatedData, setPaginatedData] = useState(reservationList);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedDays, setSelectedDays] = useState(365);
    const [selectedServiceName, setSelectedServiceName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        const storeId = sessionStorage.getItem('storeId');
        const storeNo = sessionStorage.getItem('storeNo');
        console.log("세션 storeId: ", storeId);
        console.log("세션 storeNo: ", storeNo);


        axios.post('/adminReservation/getManageList', { storeNo: storeNo })

            .then(response => {
                console.log(response.data);
                setReservationList(response.data);
                // setPaginatedData(response.data);
            })
            .catch(error => {
                console.log('Error Category', error);
            });


        axios.post('/adminReservation/getManageFilterList', { storeNo: storeNo })
            .then(response => {
                console.log(response.data);
                setFilterServiceName(response.data);
            })
            .catch(error => {
                console.log('Error Category', error);
            });


        axios.post('/adminReservation/getManageCalender', { storeNo: storeNo })
            .then(response => {
                console.log(response.data);
                setManageCalender(response.data);
            })
            .catch(error => {
                console.log('Error Category', error);
            });

    }, []);

    // 모든 예약 상세 정보를 가져오는 useEffect
    useEffect(() => {
        if (reservationList.length > 0) {
            // 모든 예약 번호에 대해 상세 정보를 가져옴
            const reservationPromises = reservationList.map(reservation => {
                const reservationNo = reservation.reservationNo;
                return axios.get(`/userMyReservation/getMyReservationDetail/${reservationNo}`)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        console.log(`Error fetching reservation detail for reservationNo ${reservationNo}:`, error);
                        return null;
                    });
            });
            // 모든 예약 상세 정보를 가져온 후 상태 업데이트
            Promise.all(reservationPromises)
                .then(reservationDetails => {
                    // null 값 제외하고 유효한 예약 상세 정보만 업데이트
                    setReservationDetail(reservationDetails.filter(detail => detail !== null));
                })
                .catch(error => {
                    console.log('Error fetching reservation details:', error);
                });
        }
    }, [reservationList]); // reservationList가 변경될 때마다 실행



    // 캘린더에 예약건 반환
    const getReservationsForDate = (date) => {
        return manageCalender
            // reservationList에서 각 예약(reservation)의 등록 시간(regTime)을 Date 객체로 변환합니다.
            .filter(reservation =>
                // toLocaleDateString() 메서드를 사용하여 해당 날짜를 문자열로 변환합니다.
                // 주어진 date와 같은 날짜인 예약만 필터링합니다.
                new Date(reservation.reservationSlotDate).toLocaleDateString() === date.toLocaleDateString()
            )
            // 필터링된 예약 목록을 등록 시간에 따라 정렬합니다
            .sort((a, b) => new Date(a.reservationSlotDate) - new Date(b.reservationSlotDate));
    };


    const handleDateClick = (date) => {
        const dateString = date.toLocaleDateString(); // 날짜를 문자열로 변환

        setSelectedDates([dateString]); // 선택한 날짜만 배열에 저장 (하나씩만 보이도록)
    };



    // 예약 상태 변경
    const [newStatusMap, setNewStatusMap] = useState({});

    const handleStatusChange = (reservationNo, status, storeName) => {
        console.log(reservationNo, status);
        if (window.confirm(`${reservationNo} 주문건을 ${status}로 변경하시겠습니까?`)) {
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

    console.log(reservationList);

    const goToDetail = (no) => {
        window.location.href = `/AdminReserveManageDetail.admin/${no}`;
    };const [filteredReservationList, setFilteredReservationList] = useState(reservationList || []);




    // 필터링 처리
    const handleSearch = () => {
        const filteredList = reservationList.filter(reservation => {
            const regDate = new Date(`${reservation.reservationSlotDate} ${reservation.reservationTime}`);
            regDate.setHours(0, 0, 0, 0); // Set to start of the day for comparison
    
            // Search condition, checks if search term matches reservation number or customer name
            const searchCondition =
                !searchTerm ||
                (reservation.reservationNo && reservation.reservationNo.toString().includes(searchTerm.toLowerCase())) || // Ensure reservationNo is a string
                (reservation.userName && reservation.userName.toLowerCase().includes(searchTerm.toLowerCase())); // Case-insensitive search
    
            return searchCondition;
        });
    
        // Update the displayed results based on the filtered list
        setPaginatedData(filteredList);
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
    };

    // 날짜 범위 변경 시 필터링
    const handleDateRangeChange = () => {
        const filteredList = reservationList.filter(reservation => {
            const regDate = new Date(`${reservation.reservationSlotDate} ${reservation.reservationTime}`);
            regDate.setHours(0, 0, 0, 0); // 자정 기준으로 시간 초기화

            // 날짜 범위 필터링
            const startCondition = startDate ? regDate >= new Date(startDate) : true;
            const endCondition = endDate ? regDate <= new Date(endDate) : true;

            // 상태 필터링
            const statusCondition = !filterStatus || reservation.reservationStatus === filterStatus;

            // 서비스 이름 필터링
            const serviceCondition = !selectedServiceName || reservation.serviceName === selectedServiceName;

            return startCondition && endCondition && statusCondition && serviceCondition; // 모든 조건 만족
        });
        setPaginatedData(filteredList); // 필터링된 데이터 상태 업데이트
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
    };

// 필터 처리 함수들
const handleFilter = (status) => {
    setFilterStatus(status); // 상태 변경
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
};

const handleServiceChange = (e) => {
    setSelectedServiceName(e.target.value); // 선택된 서비스 이름 업데이트
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
};

// 날짜 필터 처리
const handleDateFilter = (days) => {
    setSelectedDays(days);
    const filteredList = reservationList.filter(reservation => {
        const regDate = new Date(`${reservation.reservationSlotDate} ${reservation.reservationTime}`);
        const today = new Date();
        const diffDays = Math.floor((today - regDate) / (1000 * 3600 * 24));
        return diffDays <= days; // 선택한 날짜 범위 내의 예약만
    });
    setPaginatedData(filteredList);
};

// 페이지네이션 처리
const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
};

useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜에서 시간은 00:00:00으로 설정

    // 예약 데이터 필터링
    const filteredList = reservationList.filter(reservation => {
        // reservationSlotDate와 reservationTime을 합쳐서 Date 객체로 변환
        const regDate = new Date(`${reservation.reservationSlotDate}T${reservation.reservationTime}`);
        regDate.setHours(0, 0, 0, 0); // 예약 날짜의 시간을 00:00:00으로 설정

        // 날짜 범위 필터링
        const diffDays = Math.floor((today - regDate) / (1000 * 3600 * 24)); // 오늘과 예약 날짜의 차이를 일 단위로 계산

        // 날짜 범위 필터링 조건
        let dateFilterCondition = true;
        if (selectedDays === 0) {
            dateFilterCondition = diffDays === 0; // 오늘만 필터링
        } else if (selectedDays > 0) {
            dateFilterCondition = diffDays <= selectedDays; // selectedDays 이내의 예약만 필터링
        }

        // 날짜 범위 필터링 외에 다른 조건 추가
        const startCondition = startDate ? regDate >= new Date(startDate) : true;
        const endCondition = endDate ? regDate <= new Date(endDate) : true;
        const statusCondition = !filterStatus || reservation.reservationStatus === filterStatus;
        const serviceCondition = !selectedServiceName || reservation.serviceName === selectedServiceName;
        const searchCondition =
            !searchTerm ||
            (reservation.reservationNo && reservation.reservationNo.toString().includes(searchTerm.toLowerCase())) ||
            (reservation.userName && reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()));

        return dateFilterCondition && startCondition && endCondition && statusCondition && serviceCondition && searchCondition;
    });

    // 페이지네이션 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(filteredList.slice(startIndex, endIndex));

}, [currentPage, itemsPerPage, reservationList, startDate, endDate, filterStatus, selectedServiceName, searchTerm, selectedDays]);




// 페이지 수 계산
const totalPages = Math.ceil(reservationList.filter(reservation => {
    const regDate = new Date(`${reservation.reservationSlotDate} ${reservation.reservationTime}`);
    regDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교

    // 날짜 범위 필터링
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시간을 00:00:00으로 설정

    const diffDays = Math.floor((today - regDate) / (1000 * 3600 * 24)); // 예약 날짜와 오늘 날짜의 차이 계산

    let dateFilterCondition = true;
    if (selectedDays === 0) {
        dateFilterCondition = diffDays === 0; // 오늘만 필터링
    } else if (selectedDays > 0) {
        dateFilterCondition = diffDays <= selectedDays; // selectedDays 이내의 예약만 필터링
    }

    // 날짜 범위 필터링 외의 다른 조건
    const startCondition = startDate ? regDate >= new Date(startDate) : true;
    const endCondition = endDate ? regDate <= new Date(endDate) : true;
    const statusCondition = !filterStatus || reservation.reservationStatus === filterStatus;
    const serviceCondition = !selectedServiceName || reservation.serviceName === selectedServiceName;
    const searchCondition =
        !searchTerm ||
        (reservation.reservationNo && reservation.reservationNo.toString().includes(searchTerm.toLowerCase())) ||
        (reservation.userName && reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    // 모든 필터 조건이 만족되는지 체크
    return dateFilterCondition && startCondition && endCondition && statusCondition && serviceCondition && searchCondition;
}).length / itemsPerPage);


// 페이지 수 계산을 위한 `Math.ceil`이 필터링된 데이터에 적용되도록 수정했습니다.



    
    // ------------------ 정렬 ------------------
    const handleSort = (field, type) => {
        const order = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(order);

        const sortedList = [...paginatedData].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            if (field === 'regTime') {
                const dateA = new Date(`${a.reservationSlotDate} ${a.reservationTime}`);
                const dateB = new Date(`${b.reservationSlotDate} ${b.reservationTime}`);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            }

            if (type === 'number') {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }

            if (type === 'date') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }

            if (type === 'string') {
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }

            return 0;
        });

        setPaginatedData(sortedList);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // 필터 초기화
const resetFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilterStatus('');
    setSelectedServiceName('');
    setSearchTerm('');
    setSelectedDays(365); // 전체 기간으로 초기화
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
};
  
const statusColors = {
    '대기': '#b0b0b0',         // 그레이
    '입금대기': '#b0b0b0',     // 그레이
    '확정': '#4CAF50',         // 그린
    '완료': '#fd8517',         // 오렌지
    '취소(업체)': '#F44336',   // 레드
    '취소(고객)': '#F44336'    // 레드
  };

  const getStatusDot = (status) => (
    <span 
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: statusColors[status],
        marginRight: '5px'
      }}
    ></span>
  );

    return (
        <div>


            <div>
                {/* <div ref={componentRef}>
        <h1>프린트할 내용</h1>
        <p>이 영역의 내용을 프린트할 수 있습니다.</p>
      </div> */}

            </div>

            <div className="main-content-title">
                <div className='header-title'> 배송 관리 </div>
                <hr />
                <div className="icon-buttons">
                    <button className="icon-button calendar-button" onClick={() => setViewMode('calendar')}>
                        <span className="material-symbols-outlined">calendar_today</span>
                    </button>
                    <button className="icon-button list-button" onClick={() => setViewMode('list')}>
                        <span className="material-symbols-outlined">view_list</span>
                    </button>
                </div>
            </div>



            <div className="main-contents">

                {viewMode === 'list' ? (
                    <div className="management-container">

                        <div className="reservation-interface">
                            {/* Date Selection Buttons */}

                            <div className='filter-top2'>



                            <div className="dropdown-menu">
                <select onChange={handleServiceChange} value={selectedServiceName}>
                    <option value="">전체 상품</option> {/* 기본값 추가 */}
                    {filterServiceName.map((value, index) => (
                        <option key={index} value={value.serviceName}>
                            {value.serviceName}
                        </option>
                    ))}
                </select>
            </div>


                                <div className="search-bar-box">
                                    <input type='text' placeholder='예약번호 or 고객명' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} />
                                    <button onClick={handleSearch}> <i className="bi bi-search"></i> </button>
                                </div>
                            </div>


                            <div className='filter-top'>
                                <div className="date-selection">
                                    <button
                                        className={selectedDays === 365 ? 'active' : ''}
                                        onClick={() => handleDateFilter(365)}
                                    >
                                        전체
                                    </button>
                                    <button
                                        className={selectedDays === 0 ? 'active' : ''}
                                        onClick={() => handleDateFilter(0)}
                                    >
                                        오늘
                                    </button>
                                    <button
                                        className={selectedDays === 3 ? 'active' : ''}
                                        onClick={() => handleDateFilter(3)}
                                    >
                                        3일
                                    </button>
                                    <button
                                        className={selectedDays === 7 ? 'active' : ''}
                                        onClick={() => handleDateFilter(7)}
                                    >
                                        1주일
                                    </button>
                                    <button
                                        className={selectedDays === 30 ? 'active' : ''}
                                        onClick={() => handleDateFilter(30)}
                                    >
                                        1개월
                                    </button>
                                    <button
                                        className={selectedDays === 90 ? 'active' : ''}
                                        onClick={() => handleDateFilter(90)}
                                    >
                                        3개월
                                    </button>

                                </div>

                                {/* Date Range Picker */}
                                <div className="date-range">
                                    <div className="date-range">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span> - </span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onBlur={handleDateRangeChange} // 날짜가 변경되면 필터링
                                        />
                                        <button onClick={resetFilter}><i class="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                </div>
                            </div>

                            <div className="reserve-manage-top">
                                <div className="filter-btn-box">
                                    <button onClick={resetFilter}><i class="bi bi-arrow-clockwise"></i></button>
                                    <button className={filterStatus === '대기' ? 'active' : ''} onClick={() => handleFilter('대기')}>대기</button>
                                    <button className={filterStatus === '입금대기' ? 'active' : ''} onClick={() => handleFilter('입금대기')}>입금대기</button>
                                    <button className={filterStatus === '확정' ? 'active' : ''} onClick={() => handleFilter('확정')}>확정</button>
                                    <button className={filterStatus === '완료' ? 'active' : ''} onClick={() => handleFilter('완료')}>완료</button>
                                    <button className={filterStatus === '취소' ? 'active' : ''} onClick={() => handleFilter('취소')}>취소</button>
                                </div>

                            </div>

                        </div>

                        <div className="dropdown-menu">
                            <div className="store-notice-top">
                                <div className='totalpage'> {paginatedData.length} 건 ( 총 {reservationList.length} 건)</div>
                                <select onChange={(e) => setItemsPerPage(e.target.value)} value={itemsPerPage}>
                                    <option value="20" >20개씩 보기</option>
                                    <option value="50">50개씩 보기</option>
                                    <option value="100">100개씩 보기</option>
                                </select>
                            </div>
                        </div>


                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>예약번호<span onClick={() => handleSort('reservationNo', 'number')}><i className="bi bi-chevron-expand"></i></span></th>
                                    <th> 수령방법 </th>
                                    <th> 상품명 </th>
                                    <th>고객 명</th>
                                    {/* <th>예약일<span onClick={() => handleSort('regTime', 'date')}><i className="bi bi-chevron-expand"></i></span></th> */}
                                    <th>총액<span onClick={() => handleSort('reservationPrice', 'number')}><i className="bi bi-chevron-expand"></i></span></th>
                                    <th>예약 등록일  <span onClick={() => handleSort('regTime', 'date')}><i className="bi bi-chevron-expand"></i></span> </th>
                                    <th> 결제 상태 </th>
                                    <th>상태 변경</th>
                                    <th>송장번호 </th>
                                    {/* <th> <i className="bi bi-printer"></i></th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((value, index) => (
                                    <tr key={index} onDoubleClick={() => { goToDetail(value.reservationNo) }}>
                                        <td><input type="checkbox" /></td>
                                        <td>{value.reservationNo}</td>
                                        <td> {value.userDeliveryType} </td>
                                        <td>{value.serviceName}</td>
                                        <td>{value.userName}({value.userId})</td>
                                        {/* <td>{value.reservationSlotDate} {value.reservationTime}</td> */}
                                        <td>{value.reservationPrice.toLocaleString()}</td>
                                                                            <td>
                                    {new Date(value.regTime).toISOString().slice(0, 19).replace('T', ' ')}
                                    </td>

                                        <td>{value.paymentStatus}</td>
                                        <td>
                                       
                                            <div>
                                                <div className="status-select-wrapper">
      {/* <div className="status-indicator">
        {getStatusDot(newStatusMap[value.reservationNo] || value.reservationStatus)}
        {newStatusMap[value.reservationNo] || value.reservationStatus}
      </div> */}
        {getStatusDot(newStatusMap[value.reservationNo] || value.reservationStatus)}
      <select
        className="status-select"
        value={newStatusMap[value.reservationNo] || value.reservationStatus}
        onChange={(e) => {
          const selectedStatus = e.target.value;
          setNewStatusMap(prev => ({ ...prev, [value.reservationNo]: selectedStatus }));
          handleStatusChange(value.reservationNo, selectedStatus, value.storeName);
        }}
        disabled={
          value.reservationStatus === '완료' ||
          value.reservationStatus === '취소(업체)' ||
          value.reservationStatus === '취소(고객)'
        }
      >
        <option value={value.reservationStatus}>{value.reservationStatus}</option>
        {(value.reservationStatus === '대기' || value.reservationStatus === '입금대기') ? (
          <>
            <option value="확정">확정</option>
            <option value="취소(업체)">취소(업체)</option>
          </>
        ) : (
          <>
            {value.reservationStatus !== '확정' && <option value="확정">확정</option>}
            {value.reservationStatus !== '완료' && <option value="완료">완료</option>}
            {value.reservationStatus !== '취소(업체)' && <option value="취소(업체)">취소(업체)</option>}
          </>
        )}
      </select>
    </div>
                                            </div>
                                        </td>
                                        <td><input type="text" /></td>
                                        {/* <td><button className='print-btn' onClick={() => handlePrint(value)}><i className="bi bi-printer"></i></button></td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button
                                className="page-nav"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                className="page-nav"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>

                    </div>
                ) : (
                    <div className="calendar-and-reservation-info">
                        <div className="custom-calendar">
                            <h3>{startMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>

                            <Calendar
                                onChange={() => { }}
                                value={startMonth}
                                locale="en-US"
                                tileClassName={({ date, view }) => {
                                    if (view === 'month') {
                                        const dateString = date.toLocaleDateString();
                                        if (selectedDates.includes(dateString)) {
                                            return 'selected-date';
                                        }
                                    }
                                    return null;
                                }}
                                // tileContent: 각 날짜에 예약 정보를 표시하는 로직입니다. getReservationsForDate(date) 함수를 호출하여 현재 날짜의 예약 목록을 가져와서, 예약이 있을 경우 이를 <ul> 리스트로 렌더링합니다.
                                tileContent={({ date, view }) => {
                                    // 월 뷰(view === 'month')일 때만 예약 상태 표시
                                    if (view === 'month') {
                                        const reservations = getReservationsForDate(date); // 해당 날짜의 예약 정보 가져오기

                                        if (reservations.length > 0) {
                                            // 상태 집계를 위한 객체
                                            // 상태 집계를 위한 객체 초기화
                                            const statusCounts = {
                                                '입금대기': 0,
                                                '대기': 0,
                                                '확정': 0,
                                                '완료': 0,
                                                '취소': 0,
                                            };

                                            // 예약 상태 집계
                                            reservations.forEach(reservation => {
                                                const { reservationStatus } = reservation;

                                                // 취소 상태 통합: '취소(업체)'와 '취소(고객)'를 '취소'로 집계
                                                if (reservationStatus === '취소(업체)' || reservationStatus === '취소(고객)') {
                                                    statusCounts['취소'] += 1; // 예약 존재 시 +1
                                                } else if (statusCounts.hasOwnProperty(reservationStatus)) {
                                                    statusCounts[reservationStatus] += 1; // 예약 존재 시 +1
                                                } else {
                                                    console.warn(`알 수 없는 예약 상태: ${reservationStatus}`); // 예외 상태 처리
                                                }
                                            });

                                            // 예약 상태를 포함한 JSX 반환
                                            return (
                                                <div className='reservation-list'>
                                                    <div>입금대기: {statusCounts['입금대기']}</div>
                                                    <div>대기: {statusCounts['대기']}</div>
                                                    <div>확정: {statusCounts['확정']}</div>
                                                    <div>완료: {statusCounts['완료']}</div>
                                                    <div>취소: {statusCounts['취소']}</div> {/* 통합된 취소 상태 표시 */}
                                                </div>
                                            );
                                        } else {
                                            return isNull; // 예약 정보가 없을 때 처리
                                        }
                                    }


                                    // 예약이 없거나 월 뷰가 아닐 경우 null 반환
                                    return null;
                                }}

                                onClickDay={handleDateClick}
                            />
                        </div>

                        {/* 선택된 날짜가 있을 때만 예약 정보 리스트 표시 */}
                        {selectedDates.length > 0 && (
                            <div className="reservation-info-container">
                                <h3>예약 정보</h3>
                                {selectedDates.map((dateString, index) => (
                                    <div key={index}>
                                        <h4>{dateString}</h4>
                                        <ul >
                                            {getReservationsForDate(new Date(dateString)).map(reservation => (
                                                <li className='container-cal-detail' key={reservation.reservationNo} onClick={() => { goToDetail(reservation.reservationNo) }}>
                                                    {reservation.userId} 님 예약 [ {reservation.reservationStatus} ] <br />

                                                    {reservation.serviceName} <br />
                                                    {reservation.reservationSlotDate}   {reservation.reservationTime} <br />


                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminDelivery />
);
