import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactDOM from "react-dom/client";
import useKakaoLoader from '../Payment/useKakaoLoader';
import './UserSearchResult.css';

// URL에서 쿼리 파라미터를 가져오는 함수
const getSearchTermFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('searchTerm');
};

function UserSearchResult() {
  const [store, setStore] = useState([]);
  const [distances, setDistances] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  // const [visibleCount, setVisibleCount] = useState(2); // 가게 표시 개수 상태
  // const LOAD_MORE_COUNT = 1; // 더 볼 가게 수
  const [level1Categories, setLevel1Categories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState([]); //찜
  const [sortCriterion, setSortCriterion] = useState('기본순');

  useEffect(() => {
    // URL에서 검색어 가져오기
    const searchTermFromUrl = getSearchTermFromUrl();
    setSearchTerm(searchTermFromUrl);

    fetch('/getStoreInfo/activeWithCategory')
      .then((response) => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then((data) => {
        setStore(data);
        console.log('활성화된 업체 목록:', data);
      })
      .catch((error) => console.error('업체 목록을 가져오는 중 오류 발생:', error));
  }, []);

  // 레벨 1 서비스네임, 스토어NO 가져오기
  useEffect(() => {
    fetch('/userSearch/categories/level1')
      .then((response) => {
        if (!response.ok) {
          throw new Error('카테고리를 가져오는 중 오류 발생');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const formattedData = data.map(([serviceName, storeNo, servicePrice]) => ({
          serviceName,
          storeNo,
          servicePrice,
        }));
        setLevel1Categories(formattedData);
      })
      .catch((error) => console.error('카테고리를 가져오는 중 오류 발생:', error));
  }, []);


  // 검색 필터링
  useEffect(() => {
    if (searchTerm) {
      const matchingStoreNos = level1Categories
        .filter(category => category.serviceName.includes(searchTerm))
        .map(category => category.storeNo);

      const filtered = store.filter((store) =>
        store.storeName.includes(searchTerm) ||
        store.storeCate.includes(searchTerm) ||
        matchingStoreNos.includes(store.storeNo)
      );

      setFilteredStores(filtered);
      console.log('필터링된 업체:', filtered);
    } else {
      setFilteredStores(store);
    }
  }, [searchTerm, store, level1Categories]);;

  // 검색어 입력 핸들러
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(searchTerm);
  };

  // Kakao Maps API 로드
  useKakaoLoader();

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      alert("Geolocation을 지원하지 않습니다.");
    }
  }, []);

  // Kakao Map API를 이용한 거리 계산 함수
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름 (킬로미터 단위)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); // 거리 반환
  };

  // 거리 계산 및 geocoder 로드
  const getStoreDistance = (storeAddr) => {
    if (currentPosition) {
      if (window.kakao) {
        const geocoder = new kakao.maps.services.Geocoder();

        // storeAddr 파싱 (storeAddr를 직접 사용)
        const addrOnly = storeAddr; // 주소를 직접 사용

        geocoder.addressSearch(addrOnly, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const storeLat = result[0].y;
            const storeLng = result[0].x;
            const distance = calculateDistance(
              currentPosition.lat,
              currentPosition.lng,
              storeLat,
              storeLng
            );
            setDistances((prevDistances) => ({
              ...prevDistances,
              [storeAddr]: distance.toFixed(2),
            }));
          } else {
            console.error(`거리 계산 불가: ${addrOnly} - ${status}`);
          }
        });
      } else {
        console.log("Kakao 객체가 정의되지 않음");
      }
    } else {
      console.log("내 위치 확인 불가");
    }
  };

  useEffect(() => {
    // Kakao Maps API 로드 후 가게 거리 계산
    if (currentPosition && store.length > 0) {
      store.forEach(store => {
        getStoreDistance(store.addr); // addr 필드를 사용하여 거리 계산
      });
    }
  }, [store, currentPosition]);

  // 거리 변환 함수
  const formatDistance = (distance) => {
    const km = parseFloat(distance); // 거리 값을 float로 변환
    if (km >= 1) {
      return `${km.toFixed(2)} km`;  // 1km 이상일 경우 km 단위
    } else {
      return `${(km * 1000).toFixed(0)} m`;  // 1km 미만일 경우 m 단위
    }
  };

  //찜 데이터 가져오기
  useEffect(() => {
    const getBookmarked = async () => {
      try {
        const resp = await axios.get('/userStoreList/getLike');

        if (resp.status === 200) {
          setIsBookmarked(resp.data.map(like => like.storeNo));
          console.log("찜 목록 ", resp.data);
        }
      } catch (error) {
        console.log("찜 데이터 가져오는 중 error ", error);
      }
    };

    getBookmarked();
  }, []);



  // const handleLoadMore = () => {
  //   if (visibleCount >= store.length) {
  //     alert("마지막 가게 입니다.");
  //   } else {
  //     setVisibleCount((prevCount) => prevCount + LOAD_MORE_COUNT); // 상수로 증가
  //   }
  // };

  const goToStoreDetail = (id) => {
    window.location.href = `/userStoreDetail.user/${id}`;
  }

  //가게 찜하기
  const handleStoreLike = async (store) => {
    console.log("가게번호 ", store.storeNo);

    try {
      const resp = await axios.post('/userStoreList/storeLike', { storeNo: store.storeNo });
      setIsBookmarked(prev =>
        prev.includes(store.storeNo) ? prev.filter(storeNo => storeNo !== store.storeNo) //찜 해제
          : [...prev, store.storeNo] //찜 추가
      );

    } catch (error) {
      console.log("찜하던 중 error ", error);
    }
  };


  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null); // 드롭다운 요소에 대한 참조

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    // 마운트 시 이벤트 리스너 추가
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 언마운트 시 이벤트 리스너 제거
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // 정렬
  useEffect(() => {
    if (sortCriterion) {
      const sortedStores = [...filteredStores];

      if (sortCriterion === '예약 많은 순') {
        sortedStores.sort((a, b) => b.reservationCount - a.reservationCount);
      } else if (sortCriterion === '리뷰 많은 순') {
        sortedStores.sort((a, b) => b.reviewCount - a.reviewCount);
      } else if (sortCriterion === '별점 높은 순') {
        sortedStores.sort((a, b) => b.averageRating - a.averageRating);
      } else if (sortCriterion === '가까운 순') {
        sortedStores.sort((a, b) => (distances[a.addr] || Infinity) - (distances[b.addr] || Infinity));
      } else if (sortCriterion === '가격 순') {
        sortedStores.sort((a, b) =>
          (level1Categories.find(category => category.storeNo === a.storeNo)?.servicePrice || Infinity) -
          (level1Categories.find(category => category.storeNo === b.storeNo)?.servicePrice || Infinity)
        );
      }
      setFilteredStores(sortedStores);
    }
  }, [sortCriterion]);


  // 정렬 기준 변경 핸들러
  const handleSortChange = (criterion) => {
    setSortCriterion(criterion);
    closeDropdown();
  };





  return (
    <div>
      <div className="search-result-header">
        <div className="search-box">
          <div className="back-btn-container">
            <button className="back-btn" onClick={() => window.history.back()}><i className="bi bi-chevron-left"></i></button>
          </div>
          <div className="store-search-bar">
            <button className="search-btn" onClick={handleSearch}><i className="bi bi-search"></i></button>
            <input type="text" placeholder="찾으시는 가게가 있나요?" value={searchTerm} onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }} />
          </div>
        </div>

        <div className="search-result-filter">
          <div className="left">검색결과 {filteredStores.length}개</div>

          <div className="right" onClick={toggleDropdown}>{sortCriterion}</div>
          {isDropdownVisible && (
            <div className="filter-dropdown" ref={dropdownRef}>
              <div className="filter-text">정렬</div>
              <div className="filter-list">


                <div
                  className={`filter-list-btn ${sortCriterion === '예약 많은 순' ? 'active' : ''}`}
                  onClick={() => handleSortChange('예약 많은 순')}
                >
                  예약 많은 순
                  {sortCriterion === '예약 많은 순' && <i className="bi bi-check2"></i>}
                </div>

                <div
                  className={`filter-list-btn ${sortCriterion === '리뷰 많은 순' ? 'active' : ''}`}
                  onClick={() => handleSortChange('리뷰 많은 순')}
                >
                  리뷰 많은 순
                  {sortCriterion === '리뷰 많은 순' && <i className="bi bi-check2"></i>}
                </div>

                <div
                  className={`filter-list-btn ${sortCriterion === '별점 높은 순' ? 'active' : ''}`}
                  onClick={() => handleSortChange('별점 높은 순')}
                >
                  별점 높은 순
                  {sortCriterion === '별점 높은 순' && <i className="bi bi-check2"></i>}
                </div>

                <div
                  className={`filter-list-btn ${sortCriterion === '가까운 순' ? 'active' : ''}`}
                  onClick={() => handleSortChange('가까운 순')}
                >
                  가까운 순
                  {sortCriterion === '가까운 순' && <i className="bi bi-check2"></i>}
                </div>

                <div
                  className={`filter-list-btn ${sortCriterion === '가격 순' ? 'active' : ''}`}
                  onClick={() => handleSortChange('가격 순')}
                >
                  가격 순
                  {sortCriterion === '가격 순' && <i className="bi bi-check2"></i>}
                </div>

              </div>

              <div className="filter=close-btn-box">
                <button className="filter-close-btn" onClick={closeDropdown}>닫기</button>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="search-result-body-fix">
        <div className="search-result-list-container">
          <div className="search-result-list-content-box">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => {
                const storeDistance = distances[store.addr] ? formatDistance(distances[store.addr]) : '정보 없음';
                const imageUrl = store.storeImages.length > 0
                  ? store.storeImages[0].storeImgLocation
                  : "/img/cake001.jpg"; // 기본 이미지 설정

                return (
                  <div className="search-result-list-content" key={store.storeId} onClick={() => goToStoreDetail(store.storeNo)}>
                    <button className="button bookmark-btn2" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                      <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                    </button>
                    <div className="result-list-content-img-box">
                      <img src={imageUrl} alt={store.storeName} />
                    </div>

                    <div className="result-list-top">
                      <div className="result-list-container">
                        <span className="result-list-title">{store.storeName}</span>
                        <span className="result-list-category">{store.storeCate}</span>
                      </div>
                    </div>

                    <div className="result-list-mid">
                      <div className="result-list-date">
                        <i className="bi bi-clock-fill"></i>영업시간: {store.storeOpenTime ? store.storeOpenTime.slice(0, 5) : ''} - {store.storeCloseTime ? store.storeCloseTime.slice(0, 5) : ''}
                        <span className="result-list-location">
                          <i className="bi bi-geo-alt-fill"></i>현재 위치에서 {storeDistance}
                        </span>
                      </div>
                    </div>

                    <div className="result-list-bottom">
                      <div className="result-list-option-container">
                        {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category, index) => (
                          <div key={index}>
                            <span className="result-list-option">
                              <i className="bi bi-hash"></i>
                              {category.serviceName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="result-list-bottom">
                      <div className="result-list-review">
                        <i className="bi bi-star-fill"></i> <span>{store.averageRating}</span>
                        <span>({store.reviewCount})</span>
                      </div>
                      <div className="result-list-price">
                        {Math.min(
                          ...level1Categories
                            .filter(category => category.storeNo === store.storeNo)
                            .map(category => category.servicePrice)
                        ).toLocaleString()}~
                      </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="no-search-wrap">
                <div className="no-search-img-box">
                  <img src="./img/user-search-result/search-result.png" alt="검색 결과 없음" />
                </div>
                <div className="no-search-text">검색 결과가 없습니다.</div>
                <div className="no-search-text">다른 검색어를 입력해 보세요.</div>
              </div>

            )}
          </div>
        </div>

        {/* <div className='load-more-btn-wrap'>
          <button onClick={handleLoadMore} className="load-more-btn">추천 가게 더 보기</button>
        </div> */}

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<UserSearchResult />);
