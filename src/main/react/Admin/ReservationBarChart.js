import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

function ReservationBarChart({period}) {
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');



    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: '진행된 예약',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
                hoverBorderColor: 'rgba(75, 192, 192, 1)',
                data: []
            }
        ]
    });

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                console.log("period ", period);

                if (period === '이번달'){
                    // 데이터를 가져올 API 엔드포인트를 호출합니다
                    const response = await axios.get(`/adminStore/getDailyReportChart?storeNo=${storeNo}`);
                    const { dates, counts } = response.data; // 날짜와 예약 건수를 포함한 데이터

                    // 차트 데이터 업데이트
                    setChartData({
                        labels: dates.map(date => {
                            const day = date.split('-')[1];
                            return `${parseInt(day)}일`;
                        }), // dates를 차트의 라벨로 설정
                        datasets: [
                            {
                                ...chartData.datasets[0],
                                data: counts
                            }
                        ]
                    });
                } else {

                    const response = await axios.get(`/adminStore/getYearlyReportChart?storeNo=${storeNo}&period=${period}`);
                    const {months, counts} = response.data;

                    // 차트 데이터 업데이트
                    setChartData({
                        labels: months.map(month => {
                            const monthNumber = month.split('-')[1]; // "2024-05"에서 "05" 추출
                            return `${parseInt(monthNumber)}월`; // 숫자로 변환 후 "월" 추가
                        }),
                        datasets: [
                            {
                                ...chartData.datasets[0],
                                data: counts
                            }
                        ]
                    });
                }

            } catch (error) {
                console.error("차트 데이터를 불러오는 중 오류 발생: ", error);
            }
        };

        fetchReportData();
    }, [storeNo,period]);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const options = {
        responsive: true,
        animations: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#333'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
                bodyColor: '#fff',
                titleColor: '#fff'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    //                    text: '날짜',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                title: {
                    display: true,
                    //                    text: '건 수',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.5)'
                },
                ticks: {
                    stepSize: 2
                }
            }
        }
    };

    return <Bar ref={chartRef} data={chartData} options={options} />;
}

export default ReservationBarChart;
