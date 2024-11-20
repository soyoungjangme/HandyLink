import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './Master.css';

function Master() {
    const [store, setStore] = useState([]);
    const [activeStores, setActiveStores] = useState([]);
    const [waitingStores, setWaitingStores] = useState([]);
    const [inactiveStores, setInactiveStores] = useState([]);

    // 모든 업체 정보 불러옴
    useEffect(() => {
        fetch('/getStoreInfo')
            .then((response) => response.json())
            .then((data) => {
                setStore(data);
                updateStoreCounts(data);
            })
            .catch((error) => console.error('업체 목록을 가져오는 중 오류 발생:', error));
    }, []);

    // 상태에 따른 업체 리스트 업데이트
    const updateStoreCounts = (data) => {
        setActiveStores(data.filter(store => store.storeStatus === '활성화'));
        setWaitingStores(data.filter(store => store.storeStatus === '대기'));
        setInactiveStores(data.filter(store => store.storeStatus === '정지'));
    };

    return (
        <div>
            <h3>업체현황</h3>
            <div className="store-counts">
                <div className="count-card">
                    <h4>승인 대기 업체</h4>
                    <p>{waitingStores.length}</p>
                </div>
                <div className="count-card">
                    <h4>승인된 업체</h4>
                    <p>{activeStores.length}</p>
                </div>
                <div className="count-card">
                    <h4>정지된 업체</h4>
                    <p>{inactiveStores.length}</p>
                </div>
            </div>

            <div className="tables-container">
                <div className="table-column">
                    <table>
                        <thead>
                            <tr>
                                <th>승인 대기 업체</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waitingStores.length > 0 ? (
                                waitingStores.map((store, index) => (
                                    <tr key={index}>
                                        <td>{store.storeName}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="1">승인 대기 업체가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-column">
                    <table>
                        <thead>
                            <tr>
                                <th>승인된 업체</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeStores.length > 0 ? (
                                activeStores.map((store, index) => (
                                    <tr key={index}>
                                        <td>{store.storeName}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="1">승인된 업체가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-column">
                    <table>
                        <thead>
                            <tr>
                                <th>정지된 업체</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inactiveStores.length > 0 ? (
                                inactiveStores.map((store, index) => (
                                    <tr key={index}>
                                        <td>{store.storeName}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="1">정지된 업체가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Master />);
