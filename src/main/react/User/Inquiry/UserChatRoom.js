import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './UserChatRoom.css';
import ReactDOM from "react-dom/client";

function UserChatRoom() {

    // useState 관리
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [userId, setUserId] = useState(null);
    const [storeNo, setStoreNo] = useState(null);
    const [isBusinessHours, setIsBusinessHours] = useState(true);
    const [storeInfo, setStoreInfo] = useState({
        storeNo: '',
        storeName: '',
        storeImg: [{ storeImgLocation: '/img/user_basic_profile.jpg' }],
        storeOpenTime: '',
        storeCloseTime: '',
        storeStatus: '',
    });

    // Ref 관리
    const chatBoxRef = useRef(null);
    const websocket = useRef(null);
    const inputRef = useRef(null);

    // storeNo 뽑아오기
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const storeNo = params.get("storeNo");
        setStoreNo(storeNo);
    }, []);

    // 스크롤
    const handleScroll = () => {
        if (!chatBoxRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

        setIsAtBottom(isBottom);
        if (isBottom) {
            setShowToast(false);
            setNewMessageCount(0);
        }
    };


    // 영업 시간 안내
    const checkBusinessHours = (openTime, closeTime) => {
        if (!openTime || !closeTime) {
            setIsBusinessHours(true);
            return;
        }

        const currentTime = new Date();
        const open = new Date();
        const close = new Date();

        // "HH:mm:ss" 형식에서 시간과 분만 추출
        const [openHour, openMinute] = openTime.slice(0, 5).split(':');
        const [closeHour, closeMinute] = closeTime.slice(0, 5).split(':');

        open.setHours(parseInt(openHour, 10), parseInt(openMinute, 10), 0);
        close.setHours(parseInt(closeHour, 10), parseInt(closeMinute, 10), 0);

        setIsBusinessHours(currentTime >= open && currentTime <= close);
    };



    // 시간 포맷팅
    const formatTimeToAMPM = (time) => {
        const [hour, minute] = time.split(':');
        return `${hour.padStart(2, '0')}:${minute}`;
    };

    // 스크롤
    useEffect(() => {
        if (isAtBottom && chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        } else {
            setShowToast(true);
            setNewMessageCount(prev => prev + 1);
        }
    }, [messages]);

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('/chat/current');
                setUserId(response.data.userId);
            } catch (error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
                window.location.href = '/UserLoginPage.user';
            }
        };
        fetchUserInfo();
    }, []);

    // 가게 정보 가져오기
    useEffect(() => {
        const fetchStoreInfo = async () => {
            if (storeNo) {  // storeNo가 정확히 설정되었는지 확인
                try {
                    const response = await axios.get(`/chat/getStoreInfoByStoreNo/${storeNo}`);
                    console.log("가게 정보", response.data);
                    setStoreInfo(response.data);

                    // 가게 이름을 localStorage에 저장
                    if (response.data.storeName) {
                        localStorage.setItem('storeName', response.data.storeName);
                    }

                    checkBusinessHours(response.data.storeOpenTime, response.data.storeCloseTime);
                } catch (error) {
                    console.error('가게 정보를 가져오는데 실패했습니다:', error);
                }
            }
        };
        fetchStoreInfo();
    }, [storeNo]);

    // 기존 채팅 불러오기
    useEffect(() => {
        const loadChatHistory = async () => {
            if (userId && storeNo) {
                try {
                    const response = await axios.get(`/chat/history?userId=${userId}&storeNo=${storeNo}`)
                    setMessages(response.data);
                } catch (error) {
                    console.error('채팅 기록을 불러오는 중 오류가 발생했습니다:', error);
                }
            }
        };
        loadChatHistory();
    }, [userId, storeNo]);

    // 웹소켓 연결
    useEffect(() => {
        if (!userId) return;

        const connectWebSocket = () => {

            // 현재 페이지의 호스트를 기반으로 웹소켓 URL 생성
            const wsUrl = `ws://172.30.1.99:8585/ws/chat`;

            websocket.current = new WebSocket(wsUrl);

            websocket.current.onopen = () => {
                console.log('WebSocket 연결됨 - 상태:', websocket.current.readyState);
            };

            websocket.current.onmessage = async (event) => {
                const received = JSON.parse(event.data);
                console.log("수신된 메시지:", received);

                if (received.userId === userId && received.storeNo === storeNo) {
                    // STORE가 보낸 메시지일 때만 추가 (USER가 보낸 건 이미 local state에 추가됨)
                    if (received.senderType === 'STORE') {
                        setMessages(prevMessages => [...prevMessages, received]);

                        // user_last_checked_time을 업데이트
                        try {
                            await axios.post(`/chat/updateLastCheckedTime?userId=${userId}&storeNo=${storeNo}`);
                        } catch (error) {
                            console.error("마지막 확인 시간 업데이트 실패:", error);
                        }
                    }
                }
            };

            websocket.current.onerror = (error) => {
                console.error('WebSocket 에러:', error);
                console.log('에러 발생 시 WebSocket 상태:', websocket.current.readyState);
            };

            websocket.current.onclose = (event) => {
                console.log('WebSocket 연결 종료. 코드:', event.code, '사유:', event.reason);
                console.log('종료 시점 WebSocket 상태:', websocket.current.readyState);
            };
        };

        connectWebSocket();

        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, [userId, storeNo]);

    // 메세지 전송
    const sendMessage = async () => {
        if (!userId) {
            window.location.href = '/UserLoginPage.user';
            return;
        }

        if (messageInput.trim() && websocket.current) {
            const message = {
                userId,
                storeNo,
                senderType: "USER",
                chatMessage: messageInput.trim(),
                sendTime: new Date().toISOString(),
            };

            try {
                console.log('메시지 전송 전 WebSocket 상태:', websocket.current.readyState);

                if (websocket.current.readyState === WebSocket.OPEN) {
                    websocket.current.send(JSON.stringify(message));
                    console.log('메시지 전송 완료');

                    await axios.post('/chat/save', message);
                    console.log('메시지 저장 후 WebSocket 상태:', websocket.current.readyState);

                    // 메시지 입력창 초기화
                    setMessageInput('');

                    // messages state에 새 메시지 추가 (setMessageInput이 아닌 setMessages 사용)
                    setMessages(prevMessages => [...prevMessages, message]);
                }
            } catch (error) {
                console.error('메시지 전송 중 오류:', error);
            }
        }
    };

    // 엔터
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage(e);
        }
    };

    // 자동 포커스
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // 업체 프로필 클릭 시
    const handleImageClick = () => {
        window.location.href = `/userStoreDetail.user/${storeInfo.storeNo}`;
    };

    // 날짜 구분
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
    };

    const isDifferentDay = (date1, date2) => {
        return formatDate(date1) !== formatDate(date2);
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div>
            <div className="user-chat-room-container">
                {(storeInfo.storeStatus === '비활성화' || storeInfo.storeStatus === '정지' || !isBusinessHours) && (
                    <div className="business-hours-message">
                        <div className="profile-section">
                            <img
                                className="profile-img"
                                src={storeInfo.storeImg[0]?.storeImgLocation}
                                alt={`${storeInfo.storeName} 프로필`}
                            />
                        </div>
                        <div className="message-text">
                            {storeInfo.storeStatus === '비활성화' || storeInfo.storeStatus === '정지' ? (
                                <>
                                    <div>현재 영업이 중지된 상태입니다.</div>
                                    <div>답변 어려운 점 양해 부탁드립니다.</div>
                                </>
                            ) : (
                                <>
                                    <div>지금은 영업 시간이 아닙니다.</div>
                                    <div>답변 가능한
                                        시간은 {storeInfo.storeOpenTime?.slice(0, 5)} - {storeInfo.storeCloseTime?.slice(0, 5)} 입니다.
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="chat-box" ref={chatBoxRef} onScroll={handleScroll}>
                    {messages.map((msg, index) => {

                        const showDate = index === 0 || isDifferentDay(messages[index - 1].sendTime, msg.sendTime);

                        return (
                            <React.Fragment key={index}>
                                {showDate && (
                                    <div className="date-separator">
                                        {formatDate(msg.sendTime)}
                                    </div>
                                )}
                                <div className={`message-wrapper ${msg.senderType === 'USER' ? 'sent' : 'received'}`}>
                                    {msg.senderType !== 'USER' && (
                                        <div className="profile-section" onClick={handleImageClick}>
                                            <img
                                                className="profile-img"
                                                src={storeInfo.storeImg[0]?.storeImgLocation || '/img/user_basic_profile.jpg'}
                                                alt={`${storeInfo.storeName} 프로필`}
                                            />
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {msg.senderType !== 'USER' &&
                                            <div className="sender-name">{storeInfo.storeName}</div>}
                                        <div className="bubble">{msg.chatMessage}</div>
                                        <div className="timestamp">
                                            {new Date(msg.sendTime).toLocaleTimeString('ko-KR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {showToast && (
                    <div
                        className="toast-message"
                        onClick={() => {
                            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                            setShowToast(false);
                            setNewMessageCount(0);
                        }}
                    >
                        새 메시지 {newMessageCount}개
                    </div>
                )}

                <div className="input-box">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        ref={inputRef}
                        placeholder="메시지를 입력하세요..."
                    />
                    <button onClick={sendMessage}>
                        <i className="bi bi-arrow-up-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserChatRoom/>);