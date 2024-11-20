import './UserAccountPage.css';
import ReactDOM from "react-dom/client";
import React, {useState, useEffect} from "react";

function UserAccountPage () {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isKakaoLogin, setIsKakaoLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({
        userImgUrl: '/img/user_basic_profile.jpg',
        userName: '',
    });

// 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/user/profile', {
                    method: 'GET',
                    credentials: 'include' // 세션 쿠키 자동 포함
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched user profile:', data);
                    setUserInfo({
                        userImgUrl: data.userImgUrl || '/img/user_basic_profile.jpg',
                        userName: data.userName,
                    });

                    setIsLoggedIn(true);

                    if (data.loginType === 'KAKAO') {
                        setIsKakaoLogin(true);
                        setIsLoggedIn(true);
                    }

                } else {
                    setIsLoggedIn(false);
                    console.error('정보 가져오기 실패');
                }
            } catch (error) {
                console.error('정보 가져오기 실패:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // 로그아웃
    const handleLogout = () => {
        if (isKakaoLogin) {
            // 카카오 로그아웃 처리
            const REST_API_KEY = process.env.REACT_APP_KAKAO_CLIENT_ID;
            const LOGOUT_REDIRECT_URI = `http://${window.location.hostname}:8585/kakao/logout`;

            // 카카오 로그아웃 URL
            const logoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${REST_API_KEY}&logout_redirect_uri=${encodeURIComponent(LOGOUT_REDIRECT_URI)}`;

            // 로컬 스토리지에서 사용자 정보 제거
            localStorage.removeItem('token');
            localStorage.removeItem('kakaoAccessToken');

            // 카카오 로그아웃 요청
            window.location.href = logoutUrl;
        } else {
            // 일반 회원 로그아웃 처리
            window.location.href = '/logout';
        }
    };





    return (
        <div>

<div className="search-top">
            <div className='left'> 마이페이지 </div>
             
          </div>




            
            <div className="settings-container">


    


                <div className="user-info" onClick={() =>
                    isLoggedIn ? window.location.href = '/UserMyPage.user' : window.location.href = '/UserLoginPage.user'
                }>
                    <img className="profile-img" src={userInfo.userImgUrl} alt="Profile Image" id="profileImage"/>
                    <div className="user-details">
                        <h2>{isLoggedIn ? userInfo.userName : '로그인 하러 가기'}</h2>
                        <p>{isLoggedIn ? '프로필 편집' : ''}</p>
                        <span className="arrow"><i class="bi bi-chevron-right"></i></span>
                    </div>
                </div>




                <div className='setting-box'>

                <div className="settings-menu" onClick={() =>
                    isLoggedIn ? window.location.href = '/UserMyReview.user' : window.location.href = '/UserLoginPage.user'
                }>
                    <ul>
                        <li>
                            <div className="menu-item">
                            <img src="./img/mypage/review.png"/>
                                <span>후기</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="settings-menu" onClick={() =>
                    isLoggedIn ? window.location.href = '/UserLikeList.user' : window.location.href = '/UserLoginPage.user'
                }>
                    <ul>
                        <li>
                            <div className="menu-item">
                            <img src="./img/mypage/heart.png"/>
                                <span>찜</span>
                            </div>
                        </li>
                    </ul>
                </div>


                <div className="settings-menu" onClick={() =>
                    isLoggedIn ? window.location.href = '/UserMyReservationList.user' : window.location.href = '/UserLoginPage.user'
                }>
                    <ul>
                        <li>
                            <div className="menu-item">
                            <img src="./img/mypage/calendar.png"/>
                                <span>주문내역</span>
                            </div>
                        </li>
                    </ul>
                </div>


                </div>


      


                <div className="settings-submenu">
                    <ul>
                        
                        <li><a
                            onClick={() => isLoggedIn ? window.location.href = '/UserAddressPage.user' : window.location.href = '/UserLoginPage.user'}
                        >배송지 관리</a></li>
                        <li><a >자주 묻는 질문</a></li>
                        <li><a
                            >고객센터</a>
                        </li>
                        <li><a >설정</a></li>
                    </ul>
                </div>
                <div className="settings-submenu">
                    <ul>
                        <li><a onClick={handleLogout}>로그아웃</a></li>
                        <li><a
                            onClick={() => isLoggedIn ? window.location.href = '/UserDelete.user' : window.location.href = '/UserLoginPage.user'}>탈퇴하기</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserAccountPage/>
);