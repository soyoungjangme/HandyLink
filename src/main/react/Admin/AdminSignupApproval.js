import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminSignupApproval.css';

function AdminSignupApproval(){
    // 세션 스토리지에서 storeId 가져오기
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');

    const [approvalStore, setApprovalStore] = useState(null);

    useEffect(() => {
        const fetchApproval = async() => {
            if (storeId) { // storeId가 있는 경우에만 API 호출
                try {
                    const resp = await axios.get(`/adminStore/myStoreInfo?storeNo=${storeNo}`);
                    setApprovalStore(resp.data.storeName);
                } catch (error) {
                    console.error("Error fetching store info:", error);
                }
            } else {
                console.error("storeId가 세션 스토리지에 없습니다.");
            }
        };

        fetchApproval();
    }, [storeId]);

    return(
        <div className="admin-signup-approval-container">
            <div className="text-container">
                <div className="signup-complete-title">
                    <i className="bi bi-check-circle-fill"></i>  {approvalStore ? approvalStore : 'Loading...'}
                </div>

                <div className="signup-complete-content">
                    <div>
                    <i className="bi bi-exclamation-triangle"></i>
                    승인 대기 중
                    </div>

                    <div> * 승인까지 영업일 기준 평균 2~3일 소요 </div>
                </div>

                <button type="button" className="login-go-btn"> 홈으로 가기 </button>
            </div>
        </div>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminSignupApproval />
);