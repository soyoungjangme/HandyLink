import React, { useState, useEffect } from 'react';
import './UserDelete.css';
import ReactDOM from "react-dom/client";

function UserDelete() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isKakaoLogin, setIsKakaoLogin] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [kakaoAccessToken, setKakaoAccessToken] = useState(null);

    // 사용자 로그인 방식 확인
    useEffect(() => {
        // 서버에서 로그인 정보를 확인해 isKakaoLogin을 설정
        fetch('/user/profile', { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => setIsKakaoLogin(data.loginType === 'KAKAO'))
            .catch((error) => console.error('Error:', error));
    }, []);

    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
    const handleConfirmationTextChange = (e) => setConfirmationText(e.target.value);

/*
    // 비밀번호 표시 토글 함수
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };
*/

    useEffect(() => {
        // 사용자 정보와 카카오 액세스 토큰 조회
        fetch('/user/profile', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                setIsKakaoLogin(data.loginType === 'KAKAO');
                // 세션에서 카카오 액세스 토큰 가져오기
                if (data.loginType === 'KAKAO') {
                    fetch('/kakao/token', { credentials: 'include' })
                        .then(response => response.json())
                        .then(tokenData => {
                            setKakaoAccessToken(tokenData.accessToken);
                        });
                }
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const handleDeleteAccount = async () => {
        try {
            if (isKakaoLogin) {
                if (confirmationText.toLowerCase() !== 'delete') {
                    alert('올바른 텍스트를 입력해 주세요.');
                    return;
                }

                // 1. 카카오 연동 해제
                const unlinkResponse = await fetch('https://kapi.kakao.com/v1/user/unlink', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${kakaoAccessToken}`
                    }
                });

                console.log('카카오 연동 해제 응답:', unlinkResponse.status);

                // 2. 서버에 탈퇴 요청
                const deleteResponse = await fetch('/kakao/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ confirmationText })
                });

                if (deleteResponse.ok) {
                    const data = await deleteResponse.json();
                    alert(data.message || '탈퇴가 완료되었습니다.');
                    window.location.href = '/UserMain.user';
                } else {
                    const errorData = await deleteResponse.json();
                    alert(errorData.error || '탈퇴 처리 중 오류가 발생했습니다.');
                }
            } else {
                // 일반 회원 탈퇴 로직
                if (password !== confirmPassword) {
                    alert("비밀번호가 일치하지 않습니다.");
                    return;
                }

                const response = await fetch('/user/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message || '탈퇴가 완료되었습니다.');
                    window.location.href = '/UserMain.user';
                } else {
                    const errorData = await response.json();
                    alert(errorData.error || '입력 정보가 올바르지 않습니다.');
                }
            }
        } catch (error) {
            console.error('탈퇴 처리 중 오류 발생:', error);
            alert('탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <div className="delete-account-container">
                <div className="icon-circle">
                    <i className="bi bi-trash3"></i>
                </div>
                <h2>정말 탈퇴하시겠습니까?</h2>
                <p className="description">탈퇴 시 개인 정보 및 HandyLink에서 만들어진 모든 데이터가 삭제됩니다.</p>

                <div className="input-group">
                    {isKakaoLogin ? (
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="'delete'를 입력해 주세요."
                                value={confirmationText}
                                onChange={handleConfirmationTextChange}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group password-group">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="비밀번호를 입력해 주세요."
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="form-group password-group">
                                <input
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    placeholder="비밀번호를 한 번 더 입력해 주세요."
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="button-group">
                    <button className="go-back-btn"
                            onClick={() => window.location.href = '/UserAccountPage.user'}>돌아가기
                    </button>
                    <button className="delete-btn" onClick={handleDeleteAccount}>탈퇴하기</button>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserDelete/>
);