import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './MasterStore.css';
import StoreInfoModal from './StoreInfoModal';

function MasterStore() {
    const [store, setStore] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");  // 검색어 상태
    const [searchResult, setSearchResult] = useState([]);  // 검색 결과 상태
    const [isSearched, setIsSearched] = useState(false);  // 검색 트리거 상태

    useEffect(() => {
        fetch('/getStoreInfo')
            .then((response) => response.json())
            .then((data) => setStore(data))
            .catch((error) => console.error('업체 목록을 가져오는 중 오류 발생:', error));
    }, []);
    
    

    const activeStores = store.filter((store) => store.storeStatus === '활성화');

    const handleDeactivate = (storeNo) => {
        if (window.confirm("업체를 정지 하시겠습니까?")) {
            fetch(`/getStoreInfo/${storeNo}/deactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    if (response.ok) {
                        alert("업체가 정지 되었습니다.");
                        return fetch('/getStoreInfo');
                    } else {
                        return response.text().then((errorText) => {
                            throw new Error(`업체 상태 업데이트에 실패했습니다. 상태 코드: ${response.status}, 메시지: ${errorText}`);
                        });
                    }
                })
                .then((response) => response.json())
                .then((data) => setStore(data))
                .catch((error) => {
                    console.error('업체 상태 업데이트 중 오류 발생:', error);
                    alert(`업체 정지에 실패했습니다. 오류 메시지: ${error.message}`);
                });
        }
    };

    // 모달 열기 함수
    const handleShowModal = (store) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    // 모달 닫기 함수
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };


    // 검색어 변경 핸들러
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // 검색 실행 함수
    const handleSearch = () => {
        const filteredStores = activeStores.filter((store) =>
            store.storeName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResult(filteredStores);  // 검색 결과 업데이트
        setIsSearched(true);  // 검색이 실행됨
    };

    // 엔터키로 검색 실행
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // 검색 결과 또는 전체 목록을 보여줌
    const displayedStores = isSearched ? searchResult : activeStores;

    return (
        <div>
            <div className="header-container">
                <h3>업체관리</h3>

                {/* 검색바 추가 */}
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleKeyPress} // 엔터키 입력 처리
                        placeholder="업체명 검색"
                    />
                    <button onClick={handleSearch}>검색</button>
                </div>
            </div>


            <table>
                <thead>
                    <tr>
                        <th>업체ID</th>
                        <th>업체명</th>
                        <th>대표자</th>
                        <th>담당자</th>
                        <th>담당자연락처</th>
                        <th>주소</th>
                        <th>사업자 번호</th>
                        <th>업체정보</th>
                        <th>상태</th>
                        <th>정지</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedStores.map((store) => {
                        return (
                            <tr key={store.storeNo}>
                                <td>{store.storeNo}</td>
                                <td>{store.storeName}</td>
                                <td>{store.storeMaster || '-'}</td>
                                <td>{store.managerName || '-'}</td>
                                <td>{store.managerPhone || '-'}</td>
                                <td>{store.addr} {store.addrdetail}</td>
                                <td>{store.storeBusinessNo || '-'}</td>
                                <td>
                                    <button className="details-button" onClick={() => handleShowModal(store)}>상세보기</button>
                                </td>
                                <td>{store.storeStatus}</td>
                                <td>
                                    <button className="deactivate-button" onClick={() => handleDeactivate(store.storeNo)}>정지</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <StoreInfoModal isOpen={isModalOpen} onClose={handleCloseModal} store={selectedStore} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MasterStore />);
