import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './UserChatList.css';
import ReactDOM from "react-dom/client";

function UserChatList() {
    const [userId, setUserId] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStoreNo, setSelectedStoreNo] = useState(null);

    const [dragOffset, setDragOffset] = useState({});
    const touchStartX = useRef(0);
    const currentTranslateX = useRef({});

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('/chat/current');
                setUserId(response.data.userId);
            } catch (error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        };
        fetchUserInfo();
    }, []);

    const updateChatList = async (userId) => {
        try {
            const response = await axios.get(`/chat/list?userId=${userId}`);
            const activeChats = response.data.filter(chat => chat.actived === 'Y');
            const sortedChats = activeChats.sort(
                (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
            );
            setChatList(sortedChats);
        } catch (error) {
            console.error("채팅 목록을 가져오는 중 오류가 발생했습니다:", error);
        }
    };

    useEffect(() => {
        if (!userId) return;
        updateChatList(userId);

        const wsUrl = `ws://172.30.1.99:8585/ws/chat`;
        const websocket = new WebSocket(wsUrl);

        websocket.onmessage = (event) => {
            const received = JSON.parse(event.data);
            if (received.userId === userId || received.receiverId === userId) {
                setChatList(prevList => {
                    const updatedList = prevList.map(chat => {
                        if (chat.storeNo === received.storeNo) {
                            return {
                                ...chat,
                                lastMessage: received.chatMessage,
                                lastMessageTime: received.sendTime,
                                isNewMessage: true
                            };
                        }
                        return chat;
                    });
                    return updatedList.sort((a, b) =>
                        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
                    );
                });
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket 에러:", error);
        };

        websocket.onclose = () => {
            console.log("WebSocket 연결 종료");
        };

        return () => {
            websocket.close();
        };
    }, [userId]);

    const filteredChatList = chatList.filter(chat =>
        (chat.storeName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleTouchStart = (e, storeNo) => {
        touchStartX.current = e.touches[0].clientX;
        currentTranslateX.current[storeNo] = dragOffset[storeNo] || 0;
    };

    const handleTouchMove = (e, storeNo) => {
        if (!touchStartX.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchStartX.current;
        const newTranslate = Math.min(0, Math.max(-100, currentTranslateX.current[storeNo] + diff));
        setDragOffset(prev => ({
            ...prev,
            [storeNo]: newTranslate
        }));
    };

    const handleTouchEnd = async (e, storeNo) => {
        const offset = dragOffset[storeNo] || 0;
        if (offset < -50) {
            if (window.confirm('목록에서 삭제하시겠습니까?')) {
                try {
                    await axios.post(`/chat/delete?userId=${userId}&storeNo=${storeNo}`);
                    const listResponse = await axios.get(`/chat/list?userId=${userId}`);
                    const activeChats = listResponse.data.filter(chat => chat.actived === 'Y');
                    setChatList(activeChats);
                } catch (error) {
                    console.error("채팅 삭제 중 오류 발생:", error);
                }
            }
        }
        setDragOffset(prev => ({
            ...prev,
            [storeNo]: 0
        }));
        touchStartX.current = 0;
        currentTranslateX.current[storeNo] = 0;
    };

    return (
        <div>
            <div className="user-main-header-fix">
                <div className="search-top">
                    <div className='left'>
                        채팅 목록
                    </div>
                </div>

                <div className="search-bar">
                    <button className="search-btn" onClick={() => {}}>
                        <i className="bi bi-search"></i>
                    </button>
                    <input
                        type="text"
                        placeholder="업체명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                // 검색 기능
                            }
                        }}
                    />
                </div>
            </div>

            <div className="user-chat-container">
                {(!userId || filteredChatList.length === 0) ? (
                    <div className="no-results">
                        <p>{userId ? (searchTerm ? "검색 결과가 없습니다" : "채팅 내역이 없습니다") : "채팅 내역이 없습니다."}</p>
                        {!userId && (
                            <button
                                className="login-button"
                                onClick={() => window.location.href = '/UserLoginPage.user'}
                            >
                                로그인 하기
                            </button>
                        )}
                    </div>
                ) : (
                    <ul className="inquiry-list">
                        {filteredChatList.map((chat, index) => (
                            <li
                                key={`${chat.storeNo}-${index}`}
                                className="inquiry-item"
                                style={{
                                    transform: `translateX(${dragOffset[chat.storeNo] || 0}px)`,
                                    transition: touchStartX.current ? 'none' : 'transform 0.3s ease'
                                }}
                                onTouchStart={(e) => handleTouchStart(e, chat.storeNo)}
                                onTouchMove={(e) => handleTouchMove(e, chat.storeNo)}
                                onTouchEnd={(e) => handleTouchEnd(e, chat.storeNo)}
                                onClick={async () => {
                                    if (dragOffset[chat.storeNo]) return;
                                    try {
                                        await axios.post(`/chat/updateLastCheckedTime?userId=${userId}&storeNo=${chat.storeNo}`);
                                        await axios.post(`/chat/resetNewMessage?userId=${userId}`);
                                        setChatList(prevList =>
                                            prevList.map(item =>
                                                item.storeNo === chat.storeNo ? {...item, isNewMessage: false} : item
                                            )
                                        );
                                        setSelectedStoreNo(chat.storeNo);
                                        window.location.href = `/UserChatRoom.user?storeNo=${chat.storeNo}`;
                                    } catch (error) {
                                        console.error("마지막 확인 시간 업데이트 실패:", error);
                                        window.location.href = `/UserChatRoom.user?storeNo=${chat.storeNo}`;
                                    }
                                }}
                            >
                                <img
                                    src={chat.storeImgUrl || '/img/user_basic_profile.jpg'}
                                    alt={chat.storeName}
                                    className="store-image"
                                />
                                <div className="inquiry-content">
                                    <p className="inquiry-title">{chat.storeName}
                                        {chat.isNewMessage && <span className="new-message-dot">●</span>}</p>
                                    <p className="chat-preview">
                                        {chat.lastMessage.length > 20 ? `${chat.lastMessage.substring(0, 20)}...` : chat.lastMessage}
                                    </p>
                                </div>
                                <span className="inquiry-time">{formatTime(chat.lastMessageTime)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserChatList />);
