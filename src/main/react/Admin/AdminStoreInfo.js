import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import './AdminStoreInfo.css';

function AdminStoreInfo() {
    // 세션 스토리지에서 storeId 가져오기
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    console.log("세션에서 가져온 storeId: ", storeId);
    console.log("세션에서 가져온 storeNo: ", storeNo);

    const [storeInfo, setStoreInfo] = useState({
        storeId,
        storeNo,
        storePw:'',
        storeCate:'',
        storeName:'',
        storeMaster:'',
        managerName:'',
        managerPhone:'',
        zipcode: '',
        addr:'',
        addrdetail:'',
        storeBusinessNo:'',
        storeSignup:''
    });

    useEffect(() => {
        const fetchStoreImages = async () => {
            try {


                // sessionId가 null이 아닌 경우에만 API 요청
                if (storeId) {
                    const response = await axios.get(`/adminStore/myStoreInfo?storeNo=${storeNo}`);
                    const data = response.data;

                    // 가입일 (storeSignup) 시간을 제외하고 날짜만 표시
                    const formattedSignupDate = new Date(data.storeSignup).toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환

                    setStoreInfo({
                        ...data,
                        storeSignup: formattedSignupDate // 가입일을 변환된 날짜로 설정
                    });
                } else {
                    console.log("세션 ID가 없습니다.");
                }
            } catch (error) {
                console.log("error: ", error);
            }
        };

        fetchStoreImages();
        console.log("마이페이지 확인 ", storeInfo);

    }, []);

    const currentPwRef = useRef(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isPwDisabled, setIsPwDisabled] = useState(true); // 비밀번호 필드의 활성화/비활성화 상태 관리
    const [show, setShow] = useState(false);

    const [validationMessage, setValidationMessage] = useState(''); // 비밀번호 확인 상태 메시지


    const [isMatch, setIsMatch] = useState(false);
    const [storePwChange, setStorePwChange] = useState({
       storePwCurrent: '', //현재비밀번호
        storePwNew: '', //새로운 비밀번호
        storePwCheck: '' //비밀번호 확인
    });

    const handleChangeStoreInfo = (e) => {
      const {id, value} = e.target;

        setStoreInfo(prev => ({
            ...prev,
            [id]: value
        }));
    };


    // 비밀번호 확인 유효성 검사
    useEffect(() => {
        const { storePwNew, storePwCheck } = storePwChange;

        if (!storePwNew || !storePwCheck) {
            setValidationMessage(''); // 공백이면 메시지 숨김
        } else if (storePwNew === storePwCheck) {
            setValidationMessage(''); // 일치하면 메시지 숨김
        } else {
            setValidationMessage('비밀번호가 일치하지 않습니다.'); // 틀리면 오류 메시지
        }
    }, [storePwChange.storePwNew, storePwChange.storePwCheck]); // 해당 상태가 변경될 때마다 실행

    const handleChangeStorePw = (e) => {
        const { id, value } = e.target;
        setStorePwChange((prev) => ({ ...prev, [id]: value }));
    };


    const handleClickPw = async() => {
        setStorePwChange({
            storePwCurrent: '', //현재비밀번호
            storePwNew: '', //새로운 비밀번호
            storePwCheck: ''
        });
        if (isPwDisabled) {
            setIsPwDisabled(false);
        } else {
            if (!storePwChange.storePwCurrent) {
                alert('현재 비밀번호를 입력해 주십시오.'); // 현재 비밀번호가 비어있을 경우 알림
                currentPwRef.current.focus(); // 현재 비밀번호 입력 필드로 포커스 이동
                return; // 함수 종료
            }

            // 현재 비밀번호 확인
            handleBlur();

            if (show) {
                return; // 현재 비밀번호가 일치하지 않으면 함수 종료
            }

            if (storePwChange.storePwNew === storePwChange.storePwCheck && storePwChange.storePwCheck) {
                const updatedStoreInfo = {
                    ...storeInfo,
                    storePw: storePwChange.storePwNew // storePwChange.storePwNew로 비밀번호 업데이트
                };

                try {
                    const resp = await axios.post('/adminStore/updateStoreInfo', updatedStoreInfo);
                    alert('비밀번호가 정상적으로 변경되었습니다. 재로그인이 필요합니다.');

                    // 비밀번호 수정 모드 종료
                    setIsPwDisabled(true);
                    // 필요에 따라 페이지를 이동
                     window.location.href = '/adminlogin.login';
                } catch (error) {
                    console.error('비밀번호 변경 중 오류 발생:', error);
                    alert('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
                }
            } else {
                setValidationMessage('비밀번호가 일치하지 않습니다.'); // 일치하지 않을 경우 메시지
            }
        }
    };

    const handleBlur = () => {
        // 현재 비밀번호와 비교하여 에러 상태 업데이트
        if (storePwChange.storePwCurrent !== storeInfo.storePw) {
            setShow(true); // 비밀번호가 일치하지 않으면 메시지를 표시
            currentPwRef.current.focus();
        } else {
            setShow(false); // 비밀번호가 일치하면 메시지를 숨김
        }
    };

    console.log("마이페이지 ", storeInfo);

    //주소
    const postcodeRef = useRef(null);
    const addressRef = useRef(null);
    const detailAddressRef = useRef(null);

    // 우편번호 검색 기능
    const openPostcode = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function(data) {
                    let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                    let extraAddr = '';

                    if (data.userSelectedType === 'R') {
                        if (data.bname && /[동|로|가]$/g.test(data.bname)) {
                            extraAddr += data.bname;
                        }
                        if (data.buildingName && data.apartment === 'Y') {
                            extraAddr += (extraAddr ? ', ' : '') + data.buildingName;
                        }
                        extraAddr = extraAddr ? ` (${extraAddr})` : '';
                    }

                    setStoreInfo(prevData => ({
                        ...prevData,
                        zipcode: data.zonecode,
                        addr: addr,
                        addrdetail: ''
                    }));

                    detailAddressRef.current.focus();
                }
            }).open();
        } else {
            console.error("Postcode library is not loaded");
        }
    };

    //수정하기
    const toggleModify = async () => {
        if(!isPwDisabled && (storePwChange.storePwNew !== storePwChange.storePwCheck || !storePwChange.storePwCheck)){
            alert('비밀번호 변경을 완료해주십시오.');
            return;
        }

        if (isDisabled) {
            setIsDisabled(false);
        } else {
            try {
                if(!isDisabled){
                    const checkBlank = Object.values(storeInfo).some(info => info === ''); // 빈칸 있는지 확인
                    if (checkBlank) {
                        alert('정보를 입력해주세요.');
                        return;
                    }

                    if(!isPwDisabled){
                        handleClickPw();
                    }

                    await axios.post('/adminStore/updateStoreInfo', {
                        storeId,
                        storeNo,
                        storePw:storeInfo.storePw,
                        storeCate: storeInfo.storeCate,
                        storeName: storeInfo.storeName,
                        storeMaster: storeInfo.storeMaster,
                        managerName: storeInfo.managerName,
                        managerPhone: storeInfo.managerPhone,
                        zipcode:  storeInfo.zipcode,
                        addr: storeInfo.addr,
                        addrdetail: storeInfo.addrdetail,
                        storeBusinessNo: storeInfo.storeBusinessNo
                    });

                    setIsDisabled(true);
                }

            } catch (error) {
                console.log("Error updating store info: ", error);
            }
        }
    };


    return(
    <div className="admin-store-info-container">
        <h1>My Store</h1>

        <div className="form-cont">
            <div className="form-group">
                <label htmlFor="store-name">상호명</label>
                <div className="input-field">
                    <input type="text" id="storeName" value={storeInfo.storeName} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="username">아이디</label>
                <div className="input-field">
                    <input type="text" id="storeId" value={storeInfo.storeId} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                {isPwDisabled ? (
                    <div className="input-field password">
                        <input type="text" id="storePw" value={storeInfo.storePw} disabled style={{width: '65%'}}/>
                        <button type="button" className="change-pw" onClick={handleClickPw}> 변경하기 </button>
                    </div>
                ) : (
                    <div className="input-field">
                        <input type="text" id="storePwCurrent" value={storePwChange.storePwCurrent} onBlur={handleBlur} onChange={handleChangeStorePw} placeholder="현재 비밀번호" ref={currentPwRef} disabled={isPwDisabled}/>
                        <input type="text" id="storePwNew" value={storePwChange.storePwNew} onChange={handleChangeStorePw} placeholder="새로운 비밀번호" disabled={isPwDisabled}/>
                        <input type="text" id="storePwCheck" value={storePwChange.storePwCheck} onChange={handleChangeStorePw} placeholder="비밀번호 확인" disabled={isPwDisabled}/>
                        <div className="btn-pw">
                            {show ? (
                                <div className="small-text">
                                    현재 비밀번호가 일치하지 않습니다.
                                </div>
                            ) : validationMessage ? (
                                <div className="small-text">{validationMessage}</div>
                            ) : (
                                storePwChange.storePwNew && storePwChange.storePwCheck && (
                                    <div className="small-text">
                                        <i className="bi bi-check-circle" style={{color:'green'}}></i>
                                    </div>
                                )
                            )}
                            <button type="button" className="cancel-pw" onClick={() => setIsPwDisabled(!isPwDisabled)}>취소</button>
{isDisabled ? (
    <button type="button" className="change-pw" onClick={handleClickPw}> 저장하기 </button>
):null}

                        </div>
                    </div>
                )}
            </div>





            <div className="form-group">
                <label htmlFor="storeMaster">대표자</label>
                <div className="input-field">
                    <input type="text" id="storeMaster" value={storeInfo.storeMaster} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="manager">담당자명</label>
                <div className="input-field">
                    <input type="text" id="managerName" value={storeInfo.managerName} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="contact">연락처</label>
                <div className="input-field">
                    <input type="text" id="managerPhone" value={storeInfo.managerPhone} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            {!isDisabled ? (
                <div className="form-group">
                    <label htmlFor="address">사업자 주소</label>
                    <div className="input-field">
                        <div className="btn-group">
                            <input type="text" id="zipcode" value={storeInfo.zipcode} ref={postcodeRef} placeholder="우편번호" style={{ width: '35%' }} placeholder="우편번호" readOnly />
                            <button type="button" className="btn-postcode" onClick={openPostcode} value="주소검색">주소검색</button>
                        </div>
                        <input type="text" id="addr" value={storeInfo.addr} ref={addressRef} placeholder="주소" style={{ marginBottom: '5px' }} readOnly />
                        <input type="text" id="addrdetail" value={storeInfo.addrdetail} ref={detailAddressRef} placeholder="상세주소"
                        onChange={(e) =>
                            setStoreInfo(prevData => ({
                                ...prevData,
                                addrdetail: e.target.value
                            }))
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className="form-group">
                    <label htmlFor="address">가게 주소</label>
                    <div className="input-field">
                        <input type="text" id="addr" value={storeInfo.addr} onChange={handleChangeStoreInfo} style={{marginBottom: '5px'}} disabled />
                        <input type="text" id="addrdetail" value={storeInfo.addrdetail} onChange={handleChangeStoreInfo} disabled />
                    </div>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="storeBusinessNo">사업자등록번호</label>
                <div className="input-field">
                    <input type="text" id="storeBusinessNo" value={storeInfo.storeBusinessNo} onChange={handleChangeStoreInfo} disabled={isDisabled}/>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="storeSignup">가입일</label>
                <div className="input-field">
                    <input type="text" id="storeSignup" value={storeInfo.storeSignup} disabled/>
                </div>
            </div>

        </div>

        <div className="btn-box">
            <button type="button" className="modify-btn" onClick={toggleModify}>
                {isDisabled ? '수정하기' : '수정완료'}
            </button>

            {!isDisabled && (
                <button type="button" className="cancel-btn" onClick={() => window.location.href = '/adminstoreinfo.admin'}>
                    취소
                </button>
            )}
        </div>
    </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminStoreInfo />);
