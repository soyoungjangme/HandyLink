import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminStoreNoticeRegist.css';
import { useNavigate } from 'react-router-dom';

function AdminStoreNoticeRegist() {
    const [noticeType, setNoticeType] = useState('공지사항'); // Default type
    const [noticeContent, setNoticeContent] = useState('');


    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    console.log("세션 storeId: ", storeId);
    console.log("세션 storeNo: ", storeNo);

    // 완료 버튼 클릭 핸들러
    const handleCompleteClick = () => {
        const noticeData = {
            noticeType,
            noticeContent,
            storeNo
        };

        axios.post('/adminStore/setNotice', noticeData)
            .then(response => {
                console.log('Notice added successfully', response.data);
                alert('소식 등록이 완료되었습니다.');
                window.location.href = `../AdminStoreNotice.admin`; 
            })
            .catch(error => {
                console.error('Error adding notice', error);
            });
    };

    return (
        <div>
            <div className="main-content-title">
                <div className='header-title'>
                    <i className="bi bi-chevron-left"></i> 가게 소식 등록하기
                </div>
                <button type="button" className="btn-st" onClick={handleCompleteClick}>
                    완료
                </button>
            </div>
            <div className="main-contents">
                <div className="management-container">
                    <table className="management-table">
                        <tr>
                            <th style={{ width: "10%" }}>카테고리</th>
                            <td>
                                <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
                                    <option value="공지사항">공지사항</option>
                                    <option value="소식">소식</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>소식 내용</th>
                            <td>
                                <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)}></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminStoreNoticeRegist />
);
