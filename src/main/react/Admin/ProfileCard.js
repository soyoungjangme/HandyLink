import React, { useState } from 'react';
import './ProfileCard.css';

function ProfileCard({ user, onClose }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div
            className="profile-card-overlay"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={onClose}
        >
            <div
                className="profile-card"
                style={{ left: `${position.x}px`, top: `${position.y}px`, position: 'absolute' }}
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>×</button>
                <div className="profile-image">
                    <img src={user.userImgUrl || '/img/user_basic_profile.jpg'} alt={user.userName} />
                </div>
                <div className="profile-info">
                    <h2 className="name">{user.userName}</h2>
                    <p className="title">아이디: {user.userId}</p>
                    <p className="title">성별: {user.userGender === 'F' ? '여성' : '남성'}</p>
                    <p className="title">생일: {user.userBirth}</p>
                    <p className="title">연락처: {user.userPhonenum}</p>
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;
