import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminStoreNoticeModi.css';
import { useNavigate } from 'react-router-dom';

function AdminStoreNoticeModi() {
    const [noticeType, setNoticeType] = useState(''); // Default type
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeRegdate, setNoticeRegdate] = useState('');
    const [cateId, setCateId] = useState();


    useEffect(() => {
        const path = window.location.pathname;
        const pathSegments = path.split('/');
        const categoryId = pathSegments[pathSegments.length - 1];
        setCateId(categoryId);

        axios.get(`/adminStore/getNoticeDetail/${categoryId}`)
            .then(response => {
                const { noticeType, noticeContent,noticeRegdate } = response.data; // 서버 응답에서 필요한 데이터 추출
                setNoticeType(noticeType); // 추출한 noticeType을 상태에 저장
                setNoticeContent(noticeContent); // 추출한 noticeContent를 상태에 저장
                setNoticeRegdate(noticeRegdate);
            })
            .catch(error => {
                console.log('Error Category', error);
            });
    }, [])



    // 완료 버튼 클릭 핸들러
    const handleCompleteClick = () => {
        const noticeData = {
            noticeType,
            noticeContent,
        };

        axios.post(`/adminStore/setNoticeModi/${cateId}`, noticeData)
            .then(response => {
                console.log('Notice added successfully', response.data);
                alert('소식 등록이 수정되었습니다.');
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
                    <i className="bi bi-chevron-left"></i> 가게 소식 수정하기
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
    <AdminStoreNoticeModi />
);
