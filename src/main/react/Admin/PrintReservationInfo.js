
import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';

const PrintReservationInfo = ({ reservation, reservationList }) => {
    const containerStyle = {
        width: '210mm',
        height: '297mm',
        padding: '20mm',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', sans-serif",
    };

    const h1Style = {
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: '40px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        color: '#333',
    };

    const reservationNoStyle = {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#333',
    };

    const headerInfoStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontSize: '16px',
    };

    const infoContainerStyle = {
        marginTop: '30px',
    };

    const infoItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '16px',
    };

    const labelStyle = {
        color: '#777',
    };

    const valueStyle = {
        color: '#000',
        textAlign: 'right',
        fontSize: '20px',
    };

    const footerStyle = {
        marginTop: '30px',
        textAlign: 'left',
        fontSize: '12px',
        color: '#777',
    };

    const hrStyle = {
        border: 'none',
        borderTop: '2px dashed #ccc',
        margin: '30px 0',
    };

    const hrStyle2 = {
        border: 'none',
        height: '2px',
        background: 'linear-gradient(to right, #000 0%, #333 50%, #000 100%)',
        marginTop: '50px',
        marginBottom: '10px',
    };

    const [userInfo, setUserInfo] = useState(null);

    // 사용자 정보 가져오기
    useEffect(() => {
        if (reservation.userId) {
            axios.get(`/getUser/${reservation.userId}`)
                .then(response => {
                    console.log("사용자정보:", response.data);
                    setUserInfo(response.data);  // 사용자 정보 상태 업데이트
                })
                .catch(error => {
                    console.log('Error fetching user info:', error);
                });
        }
    }, [reservation.userId]);  // userId가 바뀔 때마다 호출되도록 설정

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours() + 9).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
    };

    // reservationList를 평탄화한 후 필터링
    const flattenedReservationList = reservationList.flat();
    const filteredReservationItems = flattenedReservationList.filter(item => item.reservationNo === reservation.reservationNo);

    console.log("예약 상세 정보: ", filteredReservationItems);

    return (
        <div style={containerStyle}>

            <h1 style={h1Style}>{filteredReservationItems[0]?.storeName}</h1>

            <div style={headerStyle}>
                <div style={reservationNoStyle}>{reservation.reservationNo}</div>
                <div style={headerInfoStyle}>
                    <div><span style={labelStyle}>예약일시: </span><span style={valueStyle}>{formatDate(reservation.regTime)}</span></div>
                    <div><span style={labelStyle}>예약상태: </span><span style={valueStyle}>({reservation.reservationStatus})</span></div>
                </div>
            </div>

            <hr style={hrStyle} />

            <div style={infoContainerStyle}>


                {userInfo && (
                    <div style={infoContainerStyle}>
                        <div style={infoItemStyle}>
                            <span style={labelStyle}>고객명</span>
                            <span style={valueStyle}>{userInfo.userName}</span>
                        </div>
                        <div style={infoItemStyle}>
                            <span style={labelStyle}>고객전화번호</span>
                            <span style={valueStyle}>{userInfo.userPhonenum}</span>
                        </div>
                        <div style={infoItemStyle}>
                            <span style={labelStyle}>고객계좌번호</span>
                            <span style={valueStyle}>{userInfo.refundAccountNumber}</span>
                        </div>
                    </div>
                )}
                <hr style={hrStyle} />
                <div style={infoItemStyle}>
                    <span style={labelStyle}>픽업시간</span>
                    <span style={valueStyle}>{reservation.reservationSlotDate} {reservation.reservationTime}</span>
                </div>
                <hr style={hrStyle} />
            </div>

            <div>
                {filteredReservationItems.map((item, index) => {
                    const isFirstInGroup = index === 0 || filteredReservationItems[index - 1].mainCategoryName !== item.mainCategoryName;
                    const isMiddleCategoryDifferent = index === 0 || filteredReservationItems[index - 1].middleCategoryName !== item.middleCategoryName;

                    return (
                        <div key={index}>
                            {isFirstInGroup && (
                                <div style={infoItemStyle}>
                                    <span style={labelStyle}>{item.mainCategoryName}</span>
                                    <span style={valueStyle}>(+{item.mainPrice}원)</span>
                                </div>
                            )}
                            {isMiddleCategoryDifferent && (
                                <div style={infoItemStyle}>
                                    <span style={labelStyle}>⌞{item.middleCategoryName}</span>
                                    <span style={valueStyle}>{item.subCategoryName || item.middleCategoryValue} {item.middleCategoryValue != null ? `(+${item.middlePrice} 원)` : `(+${item.subPrice} 원)`}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr style={hrStyle} />

            <div style={infoItemStyle}>
                <span style={labelStyle}>요청사항</span>
                <span style={valueStyle}>{reservation.customerRequest || '요청사항 없음'}</span>
            </div>

            <hr style={hrStyle} />

            <div style={infoItemStyle}>
                <span style={labelStyle}>예약가격</span>
                <span style={valueStyle}>{reservation.reservationPrice} 원</span>
            </div>
            <div style={infoItemStyle}>
                <span style={labelStyle}>결제상태</span>
                <span style={valueStyle}>{reservation.paymentStatus}</span>
            </div>

            <hr style={hrStyle2} />

            <div style={footerStyle}>
                <p>HadnyLink는 {filteredReservationItems[0]?.storeName}를 응원합니다.</p>
                <p>HadnyLink는 어쩌고 어쩌고 어쩌고</p>
            </div>
        </div>
    );
};

export default PrintReservationInfo;
