import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './UserQnaDetail.css';

function UserQnaDetail() {

  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요", sender: "incoming" },
    { id: 2, text: "뭘 도와드릴까요?", sender: "incoming" },
    { id: 3, text: "안녕하세요.", sender: "outgoing" },
    { id: 4, text: "네", sender: "outgoing" },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1, // 새 메시지 ID 생성
        text: inputValue,
        sender: 'outgoing', // 발신자로 설정
      };

      setMessages([...messages, newMessage]); // 새 메시지를 추가
      setInputValue(''); // 입력 필드 초기화
    }
  };

  return (
    <div>
      <div className="chat-container">
        <div className="user-top-nav">
          <div className="user-top-btns">
            <button type="button"> &lt; </button>
            <div className="logo"> HiMade !</div>
            <button type="button"> &gt; </button>
          </div>
        </div>

        {messages.map((message, index) => {
          const showProfile =
            index === 0 || messages[index - 1].sender !== message.sender;

          return (
            <div className={`message ${message.sender}`} key={message.id}>
              {message.sender === "incoming" && showProfile && (
                <img
                  src=""
                  alt="profile"
                  className="profile-img"
                />
              )}

              <p className={showProfile ? 'first' : ''}>{message.text}</p>

              {message.sender === "outgoing" && showProfile && (
                <img
                  src=""
                  alt="profile"
                  className="profile-img"
                />
              )}
            </div>
          );
        })}


        <div className="footer">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
          />
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<UserQnaDetail />);

