import React, { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function AgeChart() {
    const storeNo = sessionStorage.getItem('storeNo');

    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: '연령대 비율',
                data: [],
                backgroundColor: [
                    '#81C784', // Light Green
                    '#64B5F6', // Light Blue
                    '#FFB74D', // Light Orange
                    '#9575CD', // Light Purple
                    '#E57373', // Light Red
                    '#4DB6AC'  // Light Cyan
                ],
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        const fetchAgeDistribution = async () => {
            try {
                const response = await fetch(`/adminStore/getAgeDistribution?storeNo=${storeNo}`);
                const data = await response.json();

                setChartData({
                    labels: data.labels,
                    datasets: [{
                        ...chartData.datasets[0],
                        data: data.values,
                    }],
                });
            } catch (error) {
                console.error("연령대 비율을 불러오는 중 오류 발생:", error);
            }
        };

        fetchAgeDistribution();

        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [storeNo]);

    const options = {
        responsive: true,
        maintainAspectRatio: true, // 비율 유지
        aspectRatio: 1, // 정사각형으로 설정
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
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

    return(
    <div style={{ width: '100%', height: 'auto' }}>
    <Pie ref={chartRef} data={chartData} options={options} />
    </div>
    );
}

export default AgeChart;
