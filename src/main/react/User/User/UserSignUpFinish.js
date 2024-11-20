import ReactDOM from "react-dom/client";
import React from "react";
import './UserSignUpFinish.css';


function UserSignUpFinish () {
    return (
        <div>
            <div className="user-main-content">
                <div className="signup-container-finish">
                    <img src="/img/user_signup_finish.png" alt="회원 가입 완료 이미지"/>
                    <h2>회원 가입이 완료되었습니다</h2>
                    <div>지금 바로 서비스를 이용해 보세요.</div>
                    <button type="button" className="btn-gologin" onClick={() => window.location.href = '/UserLoginPage.user'}>
                        로그인 하러 가기
                    </button>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserSignUpFinish />
);