import React, { useState, useRef, useEffect } from 'react';
import './UserAddressPage.css';
import ReactDOM from "react-dom/client";

function UserAddressPage() {
    const [userName, setUserName] = useState('');
    const [addresses, setAddresses] = useState([
        { name: userName, address: '[13455] 경기 성남시 분당구 하오개로349번길 10 파크하임 1004동 701호', phone: '010-7643-3620', isDefault: false },
        { name: userName, address: '[06431] 서울 강남구 테헤란로7길 7 에스코빌딩 1층 CU', phone: '010-7643-3620', isDefault: false },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        address: '',
        zipcode: '',
        addrdetail: '',
        phone: '',
    });

    const detailAddressRef = useRef(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/user/profile', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.userName);
                    console.log(data.userName);
                }
            } catch (error) {
                console.error('프로필 정보 가져오기 실패:', error);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userName) {
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                name: userName
            })));
        }
    }, [userName]);


    const openPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                let addr = '';
                let extraAddr = '';

                if (data.userSelectedType === 'R') {
                    addr = data.roadAddress;
                } else {
                    addr = data.jibunAddress;
                }

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }
                }

                setNewAddress(prev => ({
                    ...prev,
                    address: `[${data.zonecode}] ${addr} ${extraAddr}`,
                    zipcode: data.zonecode
                }));
            }
        }).open();
    };

    const handleAddAddress = () => {
        if (!newAddress.name.trim()) {
            alert("배송지명을 입력해 주세요.");
            return;
        }
        if (!newAddress.address) {
            alert("주소를 입력해 주세요.");
            return;
        }
        if (!newAddress.addrdetail.trim()) {
            alert("상세 주소를 입력해 주세요.");
            return;
        }
        if (!newAddress.phone.trim()) {
            alert("연락처를 입력해 주세요.");
            return;
        }

        setAddresses(prevAddresses => [
            ...prevAddresses,
            {
                name: newAddress.name,
                address: `${newAddress.address} ${newAddress.addrdetail}`,
                phone: newAddress.phone,
                isDefault: false
            }
        ]);

        setNewAddress({ name: '', address: '', zipcode: '', addrdetail: '', phone: '' });
        setShowModal(false);
    };

    const handleSelectAddress = (index) => {
        setAddresses(
            addresses.map((addr, i) => ({
                ...addr,
                isDefault: i === index
            }))
        );
    };

    const handleDeleteAddress = (index) => {
        if (window.confirm("선택한 배송지를 삭제하시겠습니까?")) {
            setAddresses(addresses.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="address-page">
            <button className="add-address-btn" onClick={() => setShowModal(true)}>
                + 신규 배송지 추가
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>신규 배송지 추가</h2>
                        <div className="input-group">
                            <label>받는 사람</label>
                            <input
                                type="text"
                                value={newAddress.name}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="input-group">
                            <label>주소</label>
                            <div className="address-search">
                                <input
                                    type="text"
                                    placeholder="주소 검색"
                                    value={newAddress.address}
                                    readOnly
                                />
                                <button onClick={openPostcode}>주소 검색</button>
                            </div>
                            <input
                                type="text"
                                placeholder="상세주소 입력"
                                value={newAddress.addrdetail}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, addrdetail: e.target.value }))}
                                ref={detailAddressRef}
                            />
                        </div>

                        <div className="input-group">
                            <label>연락처</label>
                            <input
                                type="tel"
                                placeholder="연락처 입력 - 하이픈 포함"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button onClick={handleAddAddress} className="submit-btn">추가</button>
                            <button onClick={() => setShowModal(false)} className="cancel-btn">취소</button>
                        </div>
                    </div>
                </div>
            )}

            <ul className="address-list">
                {addresses.map((address, index) => (
                    <li
                        key={index}
                        className={`address-item ${address.isDefault ? 'default' : ''}`}
                        onClick={() => handleSelectAddress(index)}
                    >
                        <div className="address-info">
                            <span className="address-name">
                                {address.isDefault && <i className="bi bi-check"></i>}
                                {address.name} {address.isDefault && <span className="default-label">기본주소</span>}
                            </span>
                            <p>{address.address}</p>
                            <p>{address.phone}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(index);
                            }}
                            className="delete-btn"
                        >
                            삭제
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserAddressPage />);