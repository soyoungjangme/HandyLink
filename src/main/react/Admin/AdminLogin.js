import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminLogin.css';

function AdminLogin() {
    const [inputLogin, setInputLogin] = useState({
        id: '',
        pw: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputLogin({
            ...inputLogin,
            [name]: value
        });
    };

    useEffect(() => {
        console.log("id & pw : ", inputLogin);
    }, [inputLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/loginForm', {
                id: inputLogin.id,
                pw: inputLogin.pw
            });

            const { storeId, storeNo, storeStatus } = response.data;
            sessionStorage.setItem('storeId', storeId);
            sessionStorage.setItem('storeNo', storeNo);

            if(storeId === 'MASTER'){
                window.location.href = `/MASTER.admin?${storeNo}`;
                return;
            }else{
                if (storeStatus === '정지') {
                    alert('해당 계정은 정지 상태입니다. 관리자에게 문의해주세요.');
                    window.location.href = '/adminlogin.login';
                    return;
                }

                if (storeStatus === '폐업') {
                    alert('해당 계정은 폐업 상태입니다. 관리자에게 문의해주세요.');
                    window.location.href = '/adminlogin.login';
                    return;
                }

                if (response.status === 200 && storeId) {
//                    alert(`로그인 성공 ${storeId} 상태 ${storeStatus}`);

                    if (storeStatus === '대기') {
                        window.location.href = `/adminsignupapproval.admin?${storeNo}`;

                    }else{
                        window.location.href = `/adminmain.admin?${storeNo}`;

                    }
                } else {
                    alert('해당 정보를 찾을 수 없습니다.');
                }
            }
        } catch (error) {
            console.error('로그인 시도 중 오류:', error);
            alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.');
        }
    };



    return (
        <div className="parts">
            <div className="part1">
            <div className="top-text">예약, 이제 더 편리하게 <br />관리도 손쉽게</div>
<div className="bottom-text">NEEZ에서 경험해보세요</div>

            </div>

            <div className="part2">
                <form onSubmit={handleSubmit}>
                    <div className="login-container">
                        <div className="login-title"> NEEZ </div>
                        {/* <img src="../img/logo5.png"></img> */}
                        <div className="login-title2"> 니즈 셀러 분들을 위한 관리자 페이지입니다.  </div>
                        <div className="login-box">
                            <input
                                type="text"
                                name="id" // name 속성 추가
                                placeholder="아이디"
                                value={inputLogin.id}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="pw" // name 속성 추가
                                placeholder="비밀번호"
                                value={inputLogin.pw}
                                onChange={handleChange}
                            />
                            <div className="find-msg">
                                <a href="adminaccountfind.login">
                                    아이디/비밀번호 찾기
                                </a>
                            </div>
                        </div>

                        <button type="submit">로그인</button>

                        <div className="singup-msg">
                            <a href="storesignup.signup">
                                <span>스토어 입점하기</span>
                            </a>
                        </div>
       
                    </div>
                </form>


            </div>


                <div className='footer'> 
                    <div> © 2024 Nezz. All rights reserved. </div>
                    <div>  (주)니즈컴퍼니 | 대표: 장소영 | 사업자등록번호: 123-45-78910 | 06221 서울특별시 강남구 에스코빌딩 6층 | 고객센터: 02-1234-1234  </div>
              

                </div> 
    
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminLogin />
);
