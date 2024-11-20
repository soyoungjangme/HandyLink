import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import MwChart from './MwChart.js';
import AgeChart from './AgeChart.js';
import ReservationBarChart from './ReservationBarChart.js';
import MonthlySalesBarChart from './MonthlySalesBarChart.js';
import './AdminStoreReport.css';

function AdminStoreReport() {
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [genderCount, setGenderCount] = useState([]);
    const [ageDistribution, setAgeDistribution] = useState({
        labels: [],
        values: [],
        serviceName: []
    });

    const [selectedYear, setSelectedYear] = useState(currentYear.toString()); // 매출 - 연도
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString()); // 매출 - 월

    useEffect(() => {

        //고객통계 - 성별
        const fetchGender = async () => {
            try {
                const response = await fetch(`/adminStore/getGenderCount?storeNo=${storeNo}`);
                const data = await response.json(); // JSON으로 변환
                setGenderCount(data); // genderCount 상태 업데이트

            } catch (error) {
                console.error("고객 성별 수를 불러오는 중 error:", error);
            }
        };

        //나이대 별 인기상품
        const fetchAge = async () => {
            try {
                const response = await axios.get(`/adminStore/getAgeDistribution?storeNo=${storeNo}`);
                setAgeDistribution(response.data);
            } catch (error) {
                console.error("나이 별 top1 불러오는 중 error: ", error);
            }
        };

        fetchGender();
        fetchAge();
    }, [storeNo]);

    // viewMode가 변경될 때만 초기화를 수행
    useEffect(() => {
        console.log('viewMode changed:', viewMode);

        if (viewMode === 'monthly') {
            fetchMonthlySales(selectedYear);  // 월별 데이터 조회
        } else if (viewMode === 'daily') {
            fetchMonthlySales2(selectedYear, selectedMonth);  // 일별 데이터 조회
        }
    }, [viewMode]); // viewMode 변경될 때만 초기화

    // 월별 - 매출조회
    const fetchMonthlySales = async (year) => {
        try {
            if (/^\d{4}$/.test(year)) {
                const response = await axios.get(`/adminReservation/priceMonth/${storeNo}/${year}`);
                const formattedData = response.data.map(item => ({
                    year: parseInt(item.year, 10),
                    month: parseInt(item.month, 10),
                    totalSales: parseFloat(item.totalSales)
                }));
                setSalesData(formattedData);
            } else {
                alert("올바른 년도를 입력해주세요.");
            }
        } catch (error) {
            console.log("월별 년도 조회 중 error ", error);
        }
    };


    // 월별 조회 버튼 클릭 시
    const handleMonthlyClick = () => {
        fetchMonthlySales(selectedYear);  // 선택된 년도의 데이터를 조회
    };

    // 년도 입력 변경 시
    const handleYearChange = (e) => {
        const value = e.target.value;
        setSelectedYear(value);
    };

    //일별 - 매출조회
    const fetchMonthlySales2 = async (year, month) => {
        try {
            const response = await axios.get(`/adminReservation/priceDay/${storeNo}/${year}/${month}`);
            const formattedData = response.data.map(item => ({
                year: parseInt(item.year, 10),
                month: parseInt(item.month, 10),
                day: parseInt(item.day, 10),
                totalSales: parseFloat(item.totalSales)
            }));
            setSalesData2(formattedData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    const handleDailyClick = () => {
        fetchMonthlySales2(selectedYear,selectedMonth);
    };

    const handleMonthChange = (e) => {
      const  value = e.target.value;
        setSelectedMonth(value);
    };




    const [selectedPeriod, setSelectedPeriod] = useState("이번달");
    const [selectedPricePeriod, setSelectedPricePeriod] = useState("이번달");

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
    };

    const handlePricePeriodChange = (newPeriod) => {
        setSelectedPricePeriod(newPeriod);
    };

    const [salesData, setSalesData] = useState([]);
    const [salesData2, setSalesData2] = useState([]);

   // 상태 변수를 사용하여 현재 선택된 테이블을 관리
   const [viewMode, setViewMode] = useState('daily');

   // 월별 매출 테이블을 보여주는 버튼 클릭 시
   const showMonthlySales = () => {
       setViewMode('monthly');
       fetchMonthlySales(selectedYear);
   };

   // 일별 매출 테이블을 보여주는 버튼 클릭 시
   const showDailySales = () => {
       setViewMode('daily');
       fetchMonthlySales2(selectedYear, selectedMonth);
   };

    console.log("월별 매출 정보 ", salesData);
    console.log("일별 매출 정보 ", salesData2);

    return (
        <div className="admin-store-report-container">
            <div className="store-report">
                <div className="flex-left">

                    <div className="report-section">
                        <h2>매출 통계</h2>
                        <div className="reservation-graph">
                            <div className="graph-filter price">
                                <div className="filter" style={{width: '23%'}}>
                                    <span className={selectedPricePeriod === "이번달" ? 'active' : ''}
                                        onClick={() => handlePricePeriodChange("이번달")}>이번 달</span>
                                    <span className={selectedPricePeriod === "올해" ? 'active' : ''}
                                        onClick={() => handlePricePeriodChange("올해")}>올 해</span>
                                </div>
                                <div className="small-text" >
                                    * 결제일 기준 (결제완료에 한함)
                                </div>
                            </div>
                            <div className="graph">
                                <MonthlySalesBarChart period={selectedPricePeriod}/>
                            </div>
                        </div>
                    </div>

                    <div className="report-section">
                        <h2>고객 비율</h2>
                        <div className="customer-section-box">
                            <div className="graph-section">
                                <div className="customer mw">
                                    <h3>성비</h3>
                                    <div className="only-graph">
                                        <MwChart />
                                    </div>
                                </div>

                                <div className="mw detail">
                                    <table className="mwtable">
                                        <thead>
                                            <tr>
                                                <th>남자</th>
                                                <th>여자</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{genderCount.males}명</td>
                                                <td>{genderCount.females}명</td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="table-section">
                                <div className="customer age">
                                    <h3>나이</h3>
                                    <div className="only-graph">
                                        <AgeChart data={ageDistribution} />
                                    </div>
                                    </div>

                                    <div className="age detail">
                                    <table className="agetable">
                                        <thead>
                                        <tr>
                                            <th style={{width: '30%'}}>나이</th>
                                            <th>주로 찾는 서비스</th>
                                        </tr>
                                        </thead>
                                            <tbody>
                                            {ageDistribution.labels.map((label, index) => (
                                                <tr key={index}>
                                                    <td>{label}</td>
                                                    <td>{ageDistribution.serviceName[index] || '정보 없음'}</td> {/* Fallback if no service name */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="flex-right">
                    <div className="report-section">
                        <h2>예약 통계</h2>
                        <div className="reservation-graph">
                            <div className="graph-filter">
                                <div className="filter">
                                    <span className={selectedPeriod === "이번달" ? 'active' : ''}
                                        onClick={() => handlePeriodChange("이번달")}>이번 달</span>
                                    <span className={selectedPeriod === "올해" ? 'active' : ''}
                                        onClick={() => handlePeriodChange("올해")}>올 해</span>
                                    <span className={selectedPeriod === "작년" ? 'active' : ''}
                                        onClick={() => handlePeriodChange("작년")}>작 년</span>
                                </div>
                                <div className="small-text">
                                    * 예약일 기준
                                </div>
                            </div>
                            <div className="graph">
                                <ReservationBarChart period={selectedPeriod} />
                            </div>
                        </div>
                    </div>

                    <div className='report-section'>
                            <div className='month-day'>
                                <h2>매출 조회</h2>
                                <div className="monthly-year">

                                    {viewMode === 'monthly' && (
                                        <div className="monthly-search">
                                            <input
                                                type="text"
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                placeholder="연도 입력 (예: 2024)"
                                                maxLength="4"
                                            />
                                            <span>년</span>
                                            <button type="button" className="btn-year" onClick={handleMonthlyClick}>조회</button>
                                        </div>
                                    )}

                                    {viewMode === 'daily' && (
                                    <div className="monthly-search">
                                        <input
                                            type="text"
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                            placeholder="연도 입력 (예: 2024)"
                                            maxLength="4"
                                            style={{width: '12%'}}
                                        />
                                        <span>년</span>
                                        <input
                                            type="text"
                                            value={selectedMonth}
                                            onChange={handleMonthChange}
                                            placeholder="월 입력 (예: 3)"
                                            maxLength="2"
                                            style={{width: '12%'}}
                                        />
                                        <span>월</span>
                                        <button type="button" className="btn-year" onClick={handleDailyClick}>조회</button>
                                    </div>
                                    )}

                                    <div className="toggle-buttons">
                                        <button onClick={showMonthlySales} className={viewMode === 'monthly' ? 'active' : ''}>
                                            월별
                                        </button>
                                        <button onClick={showDailySales} className={viewMode === 'daily' ? 'active' : ''}>
                                            일별
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 월별 매출 테이블 */}
                            {viewMode === 'monthly' && (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>연도</th>
                                                <th>월</th>
                                                <th>매출액(원)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="no-data">데이터없음</td>
                                                </tr>
                                            ) : (
                                                salesData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.year}년</td>
                                                        <td>{item.month}월</td>
                                                        <td>{item.totalSales.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* 일별 매출 테이블 */}
                            {viewMode === 'daily' && (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>연도</th>
                                                <th>월</th>
                                                <th>일</th>
                                                <th>매출액(원)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesData2.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="no-data">데이터없음</td>
                                                </tr>
                                            ) : (
                                                salesData2.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.year}년</td>
                                                        <td>{item.month}월</td>
                                                        <td>{item.day}일</td>
                                                        <td>{item.totalSales.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminStoreReport />
);
