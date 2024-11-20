import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './MasterApproval.css';
import StoreInfoModal from './StoreInfoModal';

function MasterApproval() {
  const [store, setStore] = useState([]);
  const [filter, setFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState("");  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");    // 검색 버튼으로 트리거된 실제 검색어
  const [isSearched, setIsSearched] = useState(false);  // 검색이 트리거되었는지 여부
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetch('/getStoreInfo')
      .then((response) => response.json())
      .then((data) => {
        setStore(data);
      })
      .catch((error) => console.error('업체 목록을 가져오는 중 오류 발생:', error));
  }, []);

  // 상태 필터링
  const filteredStores = store.filter((store) => {
    if (filter === '대기') {
      return store.storeStatus === '대기';
    } else if (filter === '정지') {
      return store.storeStatus === '정지';
    } else if (filter === '전체') {
      return store.storeStatus === '대기' || store.storeStatus === '정지';
    }
    return true;
  });

  // 검색 필터링 (검색이 트리거되었을 때만)
  const searchFilteredStores = isSearched
    ? filteredStores.filter((store) =>
        store.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredStores;

  const handleSearch = () => {
    setSearchTerm(searchQuery);  // 현재 입력된 검색어로 검색 트리거
    setIsSearched(true);  // 검색이 수행되었음을 표시
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();  // Enter 키로 검색 트리거
    }
  };

  const handleApprove = (storeNo, currentStatus) => {
    const confirmationMessage = currentStatus === '대기'
      ? "승인 하시겠습니까?"
      : "정지해제 하시겠습니까?";

    if (window.confirm(confirmationMessage)) {
      fetch(`/getStoreInfo/${storeNo}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            alert(currentStatus === '대기' ? "승인이 완료되었습니다." : "업체가 활성화 되었습니다.");
            return fetch('/getStoreInfo');
          }
          throw new Error('업체 상태 업데이트에 실패했습니다.');
        })
        .then((response) => response.json())
        .then((data) => setStore(data))
        .catch((error) => {
          alert(currentStatus === '대기' ? "승인에 실패했습니다." : "활성화에 실패했습니다.");
          
          error('업체 상태 업데이트 중 오류 발생:', error);
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

  return (
    <div>
      <div className="header-container">
        <h3>승인관리</h3>

         {/* 검색바 추가 */}
         <div className="search-bar">
                <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyPress={handleKeyPress}  // 엔터키로 검색 가능
                   placeholder="업체명 검색"
                />
               <button onClick={handleSearch}>검색</button>
            </div>

        <div className="store-filter-container">
          <select id="store-status-select" onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="전체">전체</option>
            <option value="대기">대기</option>
            <option value="정지">정지</option>
          </select>

        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>업체번호</th>
            <th>업체명</th>
            <th>대표자</th>
            <th>담당자</th>
            <th>담당자연락처</th>
            <th>주소</th>
            <th>사업자 번호</th>
            <th>업체정보</th>
            <th>상태</th>
            <th>승인</th>
          </tr>
        </thead>
        <tbody>
          {searchFilteredStores.map((store) => {
            
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
                  {store.storeStatus === '대기' ? (
                    <button className="activate-button" onClick={() => handleApprove(store.storeNo, '대기')}>승인</button>
                  ) : (
                    <button className="activate-button" onClick={() => handleApprove(store.storeNo, '정지해제')}>정지해제</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <StoreInfoModal isOpen={isModalOpen} onClose={handleCloseModal} store={selectedStore} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MasterApproval />);
