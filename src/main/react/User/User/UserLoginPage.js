import React, { useState, useEffect } from 'react';
import './UserLoginPage.css';
import ReactDOM from "react-dom/client";

function UserLoginPage () {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // 로그인 처리 함수
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId.trim() || !userPw.trim()) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }
        const form = e.target;
        form.submit();
    };

    // 카카오 로그인 처리 함수
    const handleKakaoLogin = () => {

        // .env에서 REST API 키 가져오기
        //const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
        const redirectUri = `http://${window.location.hostname}:8585/kakao/login/oauth2`;
        const REST_API_KEY = process.env.REACT_APP_KAKAO_CLIENT_ID;

        if (!REST_API_KEY || !redirectUri) {
            console.error("Kakao API 키 또는 리다이렉트 URI가 설정되지 않았습니다.");
            return;
        }

        // Kakao 인증 URL 생성
        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

        // 카카오 인증 페이지로 리다이렉트
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <div>
            <div className="user-login-container">
                <form className="login-form" onSubmit={handleSubmit} method="POST" action="/login">
                    <h2>로그인</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            placeholder=" "
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <label htmlFor="userId">이메일</label>
                    </div>

                    <div className="form-group">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="userPw"
                            name="userPw"
                            placeholder=" "
                            value={userPw}
                            onChange={(e) => setUserPw(e.target.value)}
                        />
                        <label htmlFor="userPw">비밀번호</label>
                        <div className="invisible-icon" onClick={togglePasswordVisibility}>
                            <i className={passwordVisible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'}></i>
                        </div>
                    </div>

                    <button type="submit" className="btn-dologin">
                        로그인
                    </button>
                </form>

                <div className="findaccount" onClick={() => window.location.href = '/UserAccountFind.user'}>아이디 찾기 |
                    비밀번호 찾기
                </div>
                <div className="divider">또는</div>

                <div className="social-login">
                    <img src="/img/kakao_login.png" alt="Kakao Login" title="Kakao로 시작하기" onClick={handleKakaoLogin}/>
                </div>

                <div className="footer-text">
                    아직 계정이 없으신가요? <span onClick={() => window.location.href = '/UserSignUp.user'}>회원가입</span>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserLoginPage/>
);