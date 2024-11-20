import ReactDOM from "react-dom/client";
import React, {useState, useEffect} from "react";
import './UserSignUp.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { CloudinaryContext, Image, Transformation } from 'cloudinary-react';


function UserSignUp() {
    // 이미지 미리보기
    const [previewImage, setPreviewImage] = useState("/img/user_basic_profile.jpg");
    // 비밀번호 감췄다 드러냈다
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [repasswordVisible, setRepasswordVisible] = useState(false);
    // 이미지 저장
    const [file, setFile] = useState(null);
    // 폼 입력을 위한 상태
    const [formData, setFormData] = useState({
        userId: '',
        userPw: '',
        repassword: '',
        userName: '',
        userBirth: '',
        userGender: 'M',
        userPhonenum: '',
        userImgUrl: ''
    });
    // 중복 확인 여부
    const [idChecked, setIdChecked] = useState(false);

    // 카카오 회원가입 여부 상태
    const [isKakaoSignUp, setIsKakaoSignUp] = useState(false);
    const [isKakaoLogin, setIsKakaoLogin] = useState(false);

    // 카카오 회원가입 폼 태우기
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('kakao') === 'true') {
            setIsKakaoLogin(true);  // 카카오 로그인일 경우 true로 설정
        }
    }, []);


    // 카카오 회원가입 시 동의된 항목 값 미리 채워 넣기
    useEffect(() => {
        if (isKakaoLogin) {
            fetch('/kakao/info')
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch Kakao user info");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("로그 Kakao user info:", data);

                    if (data.userName || data.userImgUrl) {
                        // 카카오 회원가입 시
                        setIsKakaoSignUp(true);  // 카카오 회원가입일 경우 true로 설정

                        // 서버에서 받아온 값을 formData로 업데이트
                        setFormData(prevFormData => ({
                            ...prevFormData,
                            userName: data.userName || '', // 서버에서 받은 userName을 formData에 설정
                            userImgUrl: data.userImgUrl || '' // 서버에서 받은 프로필 이미지 URL을 formData에 설정
                        }));

                        // 프로필 이미지 미리보기 업데이트
                        if (data.userImgUrl) {
                            setPreviewImage(data.userImgUrl);  // 미리보기 이미지 업데이트
                        }
                    }
                })
                .catch(error => console.error('Error fetching Kakao user info:', error));
        }
    }, [isKakaoLogin]);


    // 입력값 변화 시 상태 업데이트
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (name === 'userId') {
            setIdChecked(false); // 이메일이 변경될 때마다 중복 체크 초기화
        }
    };



    // 비밀번호 감춤/보기 토글
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleRepasswordVisibility = () => {
        setRepasswordVisible(!repasswordVisible);
    };

    // 유효성 검사
    const validateForm = () => {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        const namePattern = /^[가-힣a-zA-Z]+$/;
        const phonePattern = /^010(?:-?\d{4})(?:-?\d{4})$/;
        const birthPattern = /^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/;

        if (!isKakaoSignUp && (!formData.userPw || !passwordPattern.test(formData.userPw))) {
            alert("비밀번호는 영문+특수문자+숫자 8자리 이상이어야 합니다.");
            return false;
        }
        if (!isKakaoSignUp && formData.userPw !== formData.repassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return false;
        }
        if (!formData.userName || !namePattern.test(formData.userName)) {
            alert("이름은 한글 또는 영어만 입력 가능합니다.");
            return false;
        }
        if (!formData.userPhonenum || !phonePattern.test(formData.userPhonenum)) {
            alert("연락처는 숫자 또는 숫자와 하이픈(-) 조합으로 입력합니다.");
            return false;
        }
        if (!formData.userBirth || !birthPattern.test(formData.userBirth)) {
            alert("생년월일은 8자리 숫자만 입력 가능합니다.");
            return false;
        }
        return true;
    };


    // 아이디 중복 확인
    const handleCheckId = async () => {

        const emailPattern = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

        if (!isKakaoSignUp && !formData.userId) {
            alert("이메일을 입력해주세요.");
            return;
        }

        if (!isKakaoSignUp && !formData.userId || !emailPattern.test(formData.userId)) {
            alert("아이디는 이메일 형식이어야 합니다.");
            return;
        }

        try {
            const response = await fetch(`/user/checkId?userId=${formData.userId}`);

            const result = await response.json();
            if (result.isDuplicate) {
                alert("이미 사용 중인 이메일입니다.");
                setIdChecked(false);
            } else {
                alert("사용 가능한 이메일입니다.");
                setIdChecked(true);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // 회원 가입 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const formatPhonenum = formData.userPhonenum.replace(/[^0-9]/g, '');

            if (isKakaoSignUp) {
                // 카카오 회원가입
                const kakaoData = {
                    userPhonenum: formatPhonenum,
                    userBirth: formData.userBirth,
                    userGender: formData.userGender
                };

                console.log('카카오 회원가입 전송 데이터:', kakaoData);

                const response = await fetch('/kakao/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 세션 쿠키 포함
                    body: JSON.stringify(kakaoData)
                });

                if (response.ok) {
                    const result = await response.text();
                    alert(result);
                    window.location.href = '/UserSignUpFinish.user';
                } else {
                    const errorText = await response.text();
                    console.error('카카오 회원가입 실패:', response.status, errorText);
                    alert('회원가입 실패: ' + errorText);
                }
            } else {
                // 일반 회원가입
                const imageUrl = file ? await handleUpload() : null;

                const signupData = {
                    userId: formData.userId,
                    userPw: formData.userPw,
                    userName: formData.userName,
                    userPhonenum: formatPhonenum,
                    userBirth: formData.userBirth,
                    userGender: formData.userGender,
                    userImgUrl: imageUrl || ''
                };

                const response = await fetch('/user/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(signupData)
                });

                if (response.ok) {
                    const result = await response.text();
                    alert(result);
                    window.location.href = '/UserSignUpFinish.user';
                } else {
                    const errorText = await response.text();
                    console.error('서버 응답 오류:', response.status, errorText);
                    alert('회원가입 실패: ' + errorText);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
      
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'hye123'); // Cloudinary에서 설정한 Upload Preset
      
        try {
          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dtzx9nu3d/image/upload',
            formData
          );
          console.log('Uploaded Image URL:', response.data.secure_url);
          return response.data.secure_url; // 업로드된 이미지 URL을 반환
        } catch (error) {
          console.error('Error uploading image:', error);
          return null; // 업로드 실패 시 null 반환
        }
      };

    // 프로필 사진 업로드 및 미리보기 처리
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        console.log('선택된 파일:', selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result); // 미리보기 이미지 변경
            };
            reader.readAsDataURL(selectedFile);
            setFile(selectedFile);  // 파일 상태 저장
        }
    };

    // ---------------------------------------------------------------

    return (
        <div>
            <div className="signup-container">
                <div className="profile-img">
                    <img src={previewImage} alt="Profile Picture" id="profileImage"/>
                    {!isKakaoSignUp && (
                        <div className="edit-icon" onClick={() => document.getElementById('fileInput').click()}>
                            <i className="bi bi-pencil-square"></i>
                        </div>
                    )}
                    <input type="file" id="fileInput" accept="image/*" onChange={handleFileChange}
                           style={{display: "none"}}/>
                </div>
                <form className="form-signup" onSubmit={handleSubmit}>
                    {!isKakaoSignUp && (
                        <div className="form-group">
                            <label htmlFor="userId">ID</label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                className="effect-8"
                                placeholder="이메일 입력"
                                value={formData.userId}
                                onChange={handleInputChange}
                            />
                            <div className="focus-border"><i></i></div>
                            <button type="button" className="btn-checkid" onClick={handleCheckId}>중복 확인</button>
                        </div>
                    )}

                    {!isKakaoSignUp && (
                        <>
                            <div className="form-group password-group">
                                <label htmlFor="userPw">PASSWORD</label>
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="userPw"
                                    name="userPw"
                                    className="effect-8"
                                    placeholder="영문+특수문자+숫자 8자리 이상"
                                    value={formData.userPw}
                                    onChange={handleInputChange}
                                />
                                <div className="focus-border"><i></i></div>
                                <div className="invisible-icon1" onClick={togglePasswordVisibility}>
                                    <i className={passwordVisible ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                                </div>
                            </div>

                            <div className="form-group password-group">
                                <label htmlFor="repassword">RE-PASSWORD</label>
                                <input
                                    type={repasswordVisible ? "text" : "password"}
                                    id="repassword"
                                    name="repassword"
                                    className="effect-8"
                                    placeholder="영문+특수문자+숫자 8자리 이상"
                                    value={formData.repassword}
                                    onChange={handleInputChange}
                                />
                                <div className="focus-border"><i></i></div>
                                <div className="invisible-icon2" onClick={toggleRepasswordVisibility}>
                                    <i className={repasswordVisible ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="userName">NAME</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            className="effect-8"
                            placeholder="이름 입력"
                            value={formData.userName}
                            onChange={handleInputChange}
                        />
                        <div className="focus-border"><i></i></div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="userPhonenum">PHONE NUMBER</label>
                        <input
                            type="text"
                            id="userPhonenum"
                            name="userPhonenum"
                            className="effect-8"
                            placeholder="연락처 입력"
                            value={formData.userPhonenum}
                            onChange={handleInputChange}
                        />
                        <div className="focus-border"><i></i></div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="userBirth">BIRTHDATE (YYYYMMDD)</label>
                        <input
                            type="text"
                            id="userBirth"
                            name="userBirth"
                            className="effect-8"
                            placeholder="생년월일 입력 (예: 20000101)"
                            value={formData.userBirth}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userGender">GENDER</label>
                        <select
                            id="userGender"
                            name="userGender"
                            className="effect-8"
                            value={formData.userGender}
                            onChange={handleInputChange}
                        >
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-signup">가입하기</button>
                </form>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserSignUp/>
);