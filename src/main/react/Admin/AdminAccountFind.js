import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminAccountFind.css';

function AdminAccountFind(){

    const [findIdPw, setFindIdPw] = useState({ //아이디/비번찾기
        managerName:'',
        storeBusinessNo:'',
        storeId:''
    });
    const [findResult, setFindResult] = useState({ //찾기 결과
        storeId:'',
        pwFindYn:''
    });
    const [newPassword, setNewPassword] = useState({ //새로운 비밀번호
        newPw:'',
        checkPw:''
    });

    const [notFoundMessage, setNotFoundMessage] = useState('');
    const [view, setView] = useState('id');
    const [viewNewPw, setViewNewPw] = useState(false);

    const handleClickId = () => {
        setView('id');
        //기존데이터 초기화
        setFindResult({storeId:'', pwFindYn:''});
        setFindIdPw({managerName:'',
                    storeBusinessNo:'',
                    storeId:'',
                    storeBusinessNo: ''});
        setNotFoundMessage('');
        setViewNewPw(false);
    };

    const handleClickPw = () => {
        setView('pw');
        setFindResult({storeId:'', pwFindYn:''});
        setFindIdPw({managerName:'',
            storeBusinessNo:'',
            storeId:'',
            storeBusinessNo: ''});
        setNotFoundMessage('');
        setViewNewPw(false);
    };

    const handleChangeInput = (e) => {
        const {id, value} = e.target;
        setFindIdPw(prev => ({
            ...prev,
            [id]:value
        }));
    };

    const handleChangePw = (e) => {
        const {id, value} = e.target;
        setNewPassword( prev => ({
            ...prev,
            [id]: value
        }));
    };

    //아이디찾기
    const handleFindId = async() => {
        try {
            const resp = await axios.get('/adminStore/findAdminId',{
                params: {
                    managerName: findIdPw.managerName,
                    storeBusinessNo: findIdPw.storeBusinessNo
                }
            });
            if(resp.data){
                console.log("아이디찾음",resp.data);
                setFindResult(prev => ({
                    ...prev,
                    storeId: resp.data
                }));
                setNotFoundMessage('');
            } else {
                console.log("아이디 없음");
                setFindResult(prev => ({ ...prev, storeId: '' }));
                setNotFoundMessage('아이디를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.log("아이디 찾기 중 error ", error);
        }
    };


    //비번있으면 새로운 비밀번호 등록
    const handleFindPw = async() => {
        try {
            const resp = await axios.get('/adminStore/findAdminPw',{
                params: {
                    storeId: findIdPw.storeId,
                    storeBusinessNo: findIdPw.storeBusinessNo
                }
            });

            if(resp.data > 0){
                console.log("해당 계정 존재함", resp.data);
                setFindResult(prev => ({
                    ...prev,
                    pwFindYn: 'Y'
                }));
                setNotFoundMessage('');
                setViewNewPw(true);
            }else{
                setNotFoundMessage('정확한 정보를 입력해주세요.');
            }
        }catch (error){
            console.log("비밀번호 찾기 중 error ", error);
        }

    };


    //새로운 비밀번호 변경
    const handleNewPw = async() => {

        const {newPw, checkPw} = newPassword;
        console.log("newPw ", newPw);

        if(newPw !== checkPw){
            setNotFoundMessage('비밀번호를 확인해주세요.');
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('newPw', newPw);
            params.append('storeId', findIdPw.storeId);
            params.append('storeBusinessNo', findIdPw.storeBusinessNo);

            const resp = await axios.post('/adminStore/updatePw', params);

            alert('비밀번호가 성공적으로 변경되었습니다.');
            window.location.href="/adminlogin.login";

        }catch (error){
            console.log("새로운 비밀번호 등록 중 error ", error);
            setNotFoundMessage('비밀번호 변경에 실패하였습니다. 다시 시도해주세요.')
        }
    };


    return(
    <div className="parts">
        <div className="login-find-container">
            <logo className="logo">NEEZ</logo>

            <div className="account-find-box">
                <button type="button" onClick={handleClickId} className={view === 'id' ? 'active' : ''} > 아이디 찾기 </button>
                <button type="button" onClick={handleClickPw} className={view === 'pw' ? 'active' : ''}> 비밀번호 찾기 </button>
            </div>

            {view === 'id' ? (
                <div className="login-box">
                    {findResult.storeId ? (
                            <div className="find-id">
                                {findResult.storeId}
                            </div>
                    ) : (
                        <>
                            <div>
                                <div>담당자명</div>
                                <input type="text" id="managerName" value={findIdPw.managerName} onChange={handleChangeInput} placeholder="담당자명" />
                            </div>
                            <div>
                                <div>사업자번호</div>
                                <input type="text" id="storeBusinessNo" value={findIdPw.storeBusinessNo} onChange={handleChangeInput} placeholder="사업자번호" />
                            </div>
                            {notFoundMessage && (
                                <div className="not-found-id">
                                    {notFoundMessage}
                                </div>
                            )}
                            <button type="button" onClick={handleFindId}> 아이디 찾기 </button>
                        </>
                    )}
                </div>
                ) : (
                    <div className="login-box">
                        {viewNewPw ? (
                            <div className="set-new-pw">
                                <input type="text" id="newPw" value={newPassword.newPw} onChange={handleChangePw} placeholder="새로운 비밀번호"/>
                                <input type="text" id="checkPw" value={newPassword.checkPw} onChange={handleChangePw} placeholder="비밀번호 확인"/>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div>아이디</div>
                                    <input type="text" id="storeId" value={findIdPw.storeId} onChange={handleChangeInput} placeholder="아이디 입력" />
                                </div>
                                <div>
                                    <div>사업자번호</div>
                                    <input type="text" id="storeBusinessNo" value={findIdPw.storeBusinessNo} onChange={handleChangeInput} placeholder="사업자번호" />
                                </div>
                                {notFoundMessage && (
                                    <div className="not-found-id">
                                        {notFoundMessage}
                                    </div>
                                )}
                            </>
                        )}
                        {viewNewPw ? (
                            <>
                                {notFoundMessage && (
                                    <div className="not-found-id">
                                        {notFoundMessage}
                                    </div>
                                )}
                                <button type="button" onClick={handleNewPw}> 변경하기 </button>
                            </>
                        ) : (
                            <button type="button" onClick={handleFindPw}> 비밀번호 찾기 </button>
                        )}
                    </div>
                )
            }
            <div className="go-login">
                <a href="adminlogin.login">
                    로그인하기
                </a>
            </div>
        </div>
    </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminAccountFind />
);