import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './AdminChat.css';
import ProfileCard from './ProfileCard.js';
import ReactDOM from "react-dom/client";

function AdminChat() {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [storeNo, setStoreNo] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserInfo, setSelectedUserInfo] = useState(null);
    const chatBoxRef = useRef(null);
    const websocket = useRef(null);
    const [isProfileCardVisible, setIsProfileCardVisible] = useState(false);
    const [profileCardUserInfo, setProfileCardUserInfo] = useState(null);

    // 세션 스토리지에서 스토어 정보 가져오기
    useEffect(() => {
        const storedStoreNo = sessionStorage.getItem('storeNo');
        if (storedStoreNo) {
            setStoreNo(storedStoreNo);
        }
    }, []);

    // 사용자 프로필 정보 가져오기
    const fetchUserDetail = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            console.log('User profile:', response.data);
            return response.data;
        } catch (error) {
            console.error("사용자 정보를 불러오는데 실패했습니다:", error);
        }
    };

    // 채팅 목록 가져오기
    useEffect(() => {
        const fetchChatList = async () => {
            if (!storeNo) return;
            try {
                const response = await axios.get(`/adminChat/list?storeNo=${storeNo}`);
                console.log('채팅 목록:', response.data);
                setChatList(response.data);
            } catch (error) {
                console.error('채팅 목록을 불러오는데 실패했습니다:', error);
            }
        };
        fetchChatList();
    }, [storeNo]);


    // 채팅방 선택 시 메시지 불러오기
    const handleChatSelect = async (userId) => {
        try {
            setSelectedUserId(userId);

            // 사용자의 전체 프로필 정보 가져오기
            const userInfoResponse = await axios.get(`/user/profile/${userId}`);
            const userInfo = userInfoResponse.data;
            setSelectedUserInfo(userInfo);  // 선택한 사용자 정보 전체를 설정

            // 읽음 상태 업데이트
            await axios.post(`/adminChat/updateLastCheckedTime?userId=${userId}&storeNo=${storeNo}`);

            setChatList(prevList =>
                prevList.map(chat =>
                    chat.userId === userId ? { ...chat, isNewMessage: false } : chat
                )
            );

            // 채팅 내역 가져오기
            const response = await axios.get(`/adminChat/history?userId=${userId}&storeNo=${storeNo}&limit=50`);
            const sortedMessages = response.data.sort((a, b) =>
                new Date(a.sendTime) - new Date(b.sendTime)
            );
            setMessages(sortedMessages);

        } catch (error) {
            console.error("채팅 내역을 불러오는데 실패했습니다:", error);
        }
    };

    // 스크롤 바
    useEffect(() => {
        if (selectedUserId && chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [selectedUserId, messages]);

    // WebSocket 연결
    useEffect(() => {
        if (!storeNo) return;

        const connectWebSocket = () => {

            // 현재 페이지의 호스트를 기반으로 웹소켓 URL 생성
            const wsUrl = `ws://172.30.1.99:8585/ws/chat`;

            websocket.current = new WebSocket(wsUrl);

            websocket.current.onopen = () => {
                console.log('WebSocket 연결됨');
            };

            websocket.current.onmessage = async (event) => {
                const received = JSON.parse(event.data);
                console.log("수신된 메시지:", received);

                if (received.storeNo === storeNo) {
                    // 현재 선택된 채팅방의 메시지인 경우
                    if (received.userId === selectedUserId) {
                        console.log("현재 선택된 채팅방에서 메시지가 도착했습니다.");

                        if (received.senderType === 'USER') {
                            setMessages(prevMessages => [...prevMessages, received]);

                            // 실시간으로 메시지를 확인한 것으로 처리하여 DB에 업데이트
                            try {
                                await axios.post(`/adminChat/updateLastCheckedTime?userId=${selectedUserId}&storeNo=${storeNo}`);
                            } catch (error) {
                                console.error("마지막 확인 시간 업데이트 실패:", error);
                            }
                        }
                    } else {
                        // 다른 채팅방에서 온 메시지 처리 (빨간 점 표시)
                        setChatList(prevList => {
                            const newList = prevList.map(chat => {
                                if (chat.userId === received.userId) {
                                    return {
                                        ...chat,
                                        lastMessage: received.chatMessage,
                                        lastMessageTime: received.sendTime,
                                        isNewMessage: true
                                    };
                                }
                                return chat;
                            });
                            return newList.sort((a, b) =>
                                new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
                            );
                        });
                    }
                }
            };

            websocket.current.onerror = (error) => {
                console.error('WebSocket 에러:', error);
            };

            websocket.current.onclose = () => {
                console.log('WebSocket 연결 종료');
            };
        };

        connectWebSocket();

        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, [selectedUserId, storeNo]);

    // 메시지 전송
    const handleSend = async () => {
        if (!messageInput.trim() || !selectedUserId) return;

        const message = {
            senderType: 'STORE',
            storeNo,
            userId: selectedUserId,
            chatMessage: messageInput.trim(),
            sendTime: new Date().toISOString()
        };

        try {
            // 먼저 DB에 저장
            await axios.post('/adminChat/save', message);
            // DB 저장 성공하면 UI 업데이트
            setMessages(prevMessages => [...prevMessages, message]);
            setMessageInput("");

            // WebSocket 연결되어 있으면 전송 시도
            if (websocket.current?.readyState === WebSocket.OPEN) {
                websocket.current.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error("메시지 전송 실패:", error);
            alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 날짜 구분을 추가하는 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // 두 날짜가 다른 날인지 확인하는 함수
    const isDifferentDay = (date1, date2) => {
        return formatDate(date1) !== formatDate(date2);
    };

    // 시간 포맷팅
    const formatTime = (timestamp) => {

        const messageDate = new Date(timestamp);
        const today = new Date();
        const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.floor((todayDay - messageDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return messageDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else {
            return messageDate.toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit'
            }).replace('. ', '-').replace('.', '');
        }
    };

    // 검색 기능
    const filteredChatList = chatList.filter(chat =>
        chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 프로필 카드 열기 핸들러
    const handleProfileClick = async (e) => {
        e.stopPropagation();
        if (selectedUserInfo && selectedUserInfo.userId) {
            try {
                const userInfo = await fetchUserDetail(selectedUserInfo.userId);
                console.log("로그 Selected User Info:", selectedUserInfo);
                setProfileCardUserInfo(userInfo); // 프로필 카드에 표시할 정보 업데이트
                setIsProfileCardVisible(true); // 프로필 카드 표시
            } catch (error) {
                console.error("프로필 정보를 불러올 수 없습니다:", error);
            }
        }
    };

    // 프로필 카드 닫기 핸들러
    const closeProfileCard = () => {
        setIsProfileCardVisible(false);
    };

    return (
        <div className="chat-container">
            {/* 채팅 목록 */}
            <div className="chat-list">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="고객 프로필명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {filteredChatList.map((chat) => (
                    <div
                        key={chat.userId}
                        className={`chat-item ${selectedUserId === chat.userId ? 'active' : ''}`}
                        onClick={() => handleChatSelect(chat.userId)}
                    >
                        <img
                            src={chat.userImgUrl || '/img/user_basic_profile.jpg'}
                            alt="profile"
                            className="chat-profile-img"
                        />
                        <div className="chat-info">
                            <span className="chat-name">{chat.userName}
                                {chat.isNewMessage && <span className="new-message-dot">●</span>}</span>
                            <span className="chat-date">{formatTime(chat.lastMessageTime)}</span>
                            <p className="chat-preview">{chat.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 채팅창 */}
            <div className="chat-content">
                {!selectedUserId ? (
                    <div className="no-chat-selected">
                        채팅방을 선택해주세요
                    </div>
                ) : (
                    <>
                        <div className="messages" ref={chatBoxRef}>
                            {messages.map((message, index) => {
                                const showDate = index === 0 || isDifferentDay(messages[index - 1].sendTime, message.sendTime);

                                return (
                                    <React.Fragment key={index}>
                                        {/* 날짜 구분 */}
                                        {showDate && (
                                            <div className="date-separator">
                                                {formatDate(message.sendTime)}
                                            </div>
                                        )}
                                        <div className={`message ${message.senderType === 'STORE' ? 'sent' : 'received'}`}>
                                            {message.senderType !== 'STORE' && (
                                                <div className="message-profile" onClick={handleProfileClick}>
                                                    <img
                                                        src={selectedUserInfo?.userImgUrl || '/img/user_basic_profile.jpg'}
                                                        alt="profile"
                                                        className="user-img"
                                                    />
                                                    <span className="sender-name">{selectedUserInfo?.userName}</span>
                                                </div>
                                            )}
                                            <div className="bubble">
                                                {message.chatMessage}
                                            </div>
                                            <div className="message-time">
                                                {new Date(message.sendTime).toLocaleTimeString('ko-KR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                })}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="message-input">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="메시지를 입력하세요..."
                            />
                            <button onClick={handleSend}>전송</button>
                        </div>
                    </>
                )}
            </div>

            {/* 프로필 카드 팝업 */}
            {isProfileCardVisible && selectedUserInfo && (
                <ProfileCard user={selectedUserInfo} onClose={closeProfileCard}/>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminChat/>);