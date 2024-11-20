import React, { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function MwChart() {
    const storeNo = sessionStorage.getItem('storeNo');

    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: '인원 수',
            data: [],
            backgroundColor: ['#1E88E5', '#D81B60'], // Soft Blue, Soft Pink
            borderColor: '#fff',
            borderWidth: 1,
        }],
    });

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await fetch(`/adminStore/getGenderCount?storeNo=${storeNo}`);
                const data = await response.json();

                const { females, males } = data;
                setChartData({
                    labels: ['남자', '여자'],
                    datasets: [{
                        ...chartData.datasets[0],
                        data: [males, females],
                    }],
                });
            } catch (error) {
                console.error("고객성별을 불러오는 중 error: ", error);
            }
        };

        fetchChartData();

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
        maintainAspectRatio: true, // 비율 유지
        aspectRatio: 1, // 정사각형으로 설정
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw || 0;
                        const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${percentage}%`;
                    },
                },
            },
        },
    };

    return (
        <div style={{ width: '100%', height: 'auto' }}>
            <Pie ref={chartRef} data={chartData} options={options} />
        </div>
    );
}

export default MwChart;
