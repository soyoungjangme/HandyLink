import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactDOM from "react-dom/client";
import useKakaoLoader from '../Payment/useKakaoLoader';
import { useSwipeable } from 'react-swipeable';
import './UserMain.css';

function UserMain() {
  const [store, setStore] = useState([]);
  const [distances, setDistances] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10); // 가게 표시 개수 상태
  const LOAD_MORE_COUNT = 10; // 더 볼 가게 수
  const [level1Categories, setLevel1Categories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookmarked, setIsBookmarked] = useState([]); //찜
  const [activeSection, setActiveSection] = useState('menu1');

  // 검색어 입력 핸들러
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 검색 URL 생성 함수
  const generateSearchUrl = (term) => {
    return `/userSearchResult.user?searchTerm=${encodeURIComponent(term)}`;
  };


  // 검색 버튼 클릭 시 검색어를 쿼리 파라미터로 전달하며 페이지 이동
  const handleSearch = () => {
    if (searchTerm) {
      window.location.href = generateSearchUrl(searchTerm);
    }
  };

  // 추천 해시태그, 카테고리 배너 클릭 시 즉시 검색 실행
  const handleHashtagClick = (serviceName) => {
    window.location.href = generateSearchUrl(serviceName);
  };

  // 각 섹션마다 다른 ref를 사용
  const storeListRef1 = useRef(null);
  const storeListRef2 = useRef(null);
  const storeListRef3 = useRef(null);
  const storeListRef4 = useRef(null);
  const storeListRef5 = useRef(null);
  const storeListRef6 = useRef(null);

  const btnLeftStoreRef1 = useRef(null);
  const btnLeftStoreRef2 = useRef(null);
  const btnLeftStoreRef3 = useRef(null);
  const btnLeftStoreRef4 = useRef(null);
  const btnLeftStoreRef5 = useRef(null);
  const btnLeftStoreRef6 = useRef(null);

  const btnRightStoreRef1 = useRef(null);
  const btnRightStoreRef2 = useRef(null);
  const btnRightStoreRef3 = useRef(null);
  const btnRightStoreRef4 = useRef(null);
  const btnRightStoreRef5 = useRef(null);
  const btnRightStoreRef6 = useRef(null);

  const setupScrollControls = (listWrap, btnLeft, btnRight) => {
    btnLeft.addEventListener('click', () => {
      listWrap.scrollBy({ left: -200, behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
      listWrap.scrollBy({ left: 200, behavior: 'smooth' });
    });

    listWrap.addEventListener('scroll', () => {
      updateButtonVisibility(listWrap, btnLeft, btnRight);
    });

    updateButtonVisibility(listWrap, btnLeft, btnRight);
  };

  const updateButtonVisibility = (list, leftBtn, rightBtn) => {
    const scrollLeft = list.scrollLeft;
    const maxScrollLeft = list.scrollWidth - list.clientWidth;


    leftBtn.style.display = scrollLeft <= 0 ? 'none' : 'block';
    rightBtn.style.display = scrollLeft >= maxScrollLeft ? 'none' : 'block';
  };

  useEffect(() => {
    // 각 섹션마다 스크롤 제어 설정
    setupScrollControls(storeListRef1.current, btnLeftStoreRef1.current, btnRightStoreRef1.current);
    setupScrollControls(storeListRef2.current, btnLeftStoreRef2.current, btnRightStoreRef2.current);
    setupScrollControls(storeListRef3.current, btnLeftStoreRef3.current, btnRightStoreRef3.current);
    setupScrollControls(storeListRef4.current, btnLeftStoreRef4.current, btnRightStoreRef4.current);
  }, [store]);


  // Kakao Maps API 로드
  useKakaoLoader();

  useEffect(() => {
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
        const formattedData = data.map(([serviceName, storeNo, servicePrice, serviceContent, imageUrl]) => ({
          serviceName,
          storeNo,
          servicePrice,
          serviceContent,
          imageUrl,
        }));
        setLevel1Categories(formattedData);
      })
      .catch((error) => console.error('카테고리를 가져오는 중 오류 발생:', error));
  }, []);


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


  const handleLoadMore = () => {
    if (visibleCount >= store.length) {
      alert("마지막 가게 입니다.");
    } else {
      setVisibleCount((prevCount) => prevCount + LOAD_MORE_COUNT); // 상수로 증가
    }
  };

  const goToStoreDetail = (id) => {
    window.location.href = `/userStoreDetail.user/${id}`;
  }


  // --------------- 광고 슬라이더 ---------------
  // 광고 슬라이더 이미지
  const slides = [
    { id: 1, imageUrl: 'https://ugc-images.catchtable.co.kr/admin/marketing/banner/images/3bd07d6ef62c467ea30cfe61e0ee07dd' },
    { id: 2, imageUrl: 'https://ugc-images.catchtable.co.kr/admin/marketing/banner/images/a36659bd0f5f4ac4a7fa8da410f4c3fe' },
    { id: 3, imageUrl: 'https://ugc-images.catchtable.co.kr/admin/marketing/banner/images/0532d8bf721e42a59a49d79bb78db54a' },
    { id: 4, imageUrl: 'https://ugc-images.catchtable.co.kr/admin/marketing/banner/images/986e4206814741629306bf1d85e6de06' },
    { id: 5, imageUrl: 'https://image.idus.com/image/files/8e017c9e650a48ea89c443a46fd4446f_720.jpg' },
    { id: 6, imageUrl: 'https://image.idus.com/image/files/1d02be1cfc264156947c3f44b7193afc_1080.jpg' },
    { id: 7, imageUrl: 'https://image.idus.com/image/files/f7a382d62af644e5bf93d94b3280bc1e.jpg' },
    { id: 8, imageUrl: 'https://image.idus.com/image/files/b43ecba302cb4b79a8ac3eeb1c2f8ae7_1080.jpg' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이딩 기능 (3초마다 슬라이드 이동)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // 7초 간격으로 슬라이드 변경
    return () => clearInterval(interval);
  }, []);

  // 스와이프 기능을 위한 핸들러
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPreviousSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const slideContainer = document.querySelector('.slide-container');
    slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
  }, [currentIndex]);

  // ----------------------------------------------------------

  //가게 찜하기 (수정)
  const handleStoreLike = async (store) => {
    try {
      await axios.post('/userStoreList/storeLike', { storeNo: store.storeNo });
      setIsBookmarked(prev =>
        prev.includes(store.storeNo) ? prev.filter(storeNo => storeNo !== store.storeNo) : [...prev, store.storeNo]
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("로그인 후 이용 가능한 서비스입니다.");
        // window.location.href = "/UserLoginPage.user";
      }
    }
  };


  return (
    <div>
      <div className="user-main-container">

        <div className="user-main-header-fix">
          <div className="search-top">
            <div className='left'> NEEZ </div>
            <div className='right' onClick={() => window.location.href = '/userlikelist.user'}><img src="/img/user-main/heart.png" /></div>
          </div>

          {/* 검색바 */}
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


        <div className="user-main-body-fix">

          {/* 광고 슬라이더 */}
          <div className="slider" {...handlers}>
            <div className="slide-container">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`slide ${index === currentIndex ? 'active' : ''}`}
                >
                  <img src={slide.imageUrl} alt={`Slide ${index + 1}`} />
                </div>
              ))}
            </div>

            <div className="indicator-container">
              {slides.map((slide, index) => (
                <span
                  key={slide.id}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                ></span>
              ))}
            </div>
          </div>


          {/* 가게 카테고리 */}
          <div className="user-category-content">
            <div className="store-category-item" onClick={() => handleHashtagClick("디저트")}>
              <img src="./img/category/dessert.png" alt="디저트" />
              <p>디저트</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("꽃")}>
              <img src="./img/category/flower.png" alt="꽃" />
              <p>꽃</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("공예")}>
              <img src="./img/category/handcraft.png" alt="공예" />
              <p>공예</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("뷰티")}>
              <img src="./img/category/beauty.png" alt="뷰티" />
              <p>뷰티</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("패션")}>
              <img src="./img/category/fashion.png" alt="패션" />
              <p>패션</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("주얼리")}>
              <img src="./img/category/jewelry.png" alt="주얼리" />
              <p>주얼리</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("디지털")}>
              <img src="./img/category/digital.png" alt="디지털" />
              <p>디지털</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("반려동물")}>
              <img src="./img/category/pet.png" alt="반려동물" />
              <p>반려동물</p>
            </div>
          </div>



          {/* 위치 카테고리 */}
          {/* <h3>어디로 가시나요?</h3>
        <div className="user-location-content">
          <div className="user-location-item">내주변</div>
          <div className="user-location-item">압구정 청담</div>
          <div className="user-location-item">부산</div>
          <div className="user-location-item">잠실 송파</div>
          <div className="user-location-item">이태원 한남</div>
          <div className="user-location-item">성수</div>
        </div> */}




          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731039573/nh8d2u43ldav5tetglsb.png' />
          </div>

          {/* 내 주변 가게 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef1} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef1} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/shop.png" alt="쇼핑 아이콘" /></div>
              <div className="title-name">고객님 주변 이런 가게는 어떠신가요?</div>
            </h3>

            <div className="user-main-list-wrap" ref={storeListRef1}>
              {store.length > 0 ? (
                store
                  .map((store) => ({
                    ...store,
                    distance: distances[store.addr] || Infinity,
                  }))
                  .sort((a, b) => a.distance - b.distance)
                  .map((store) => {
                    if (store.storeImages.length === 0) {
                      return null;
                    }

                    const imageUrl = store.storeImages[0].storeImgLocation;

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                          </div>
                          <div className="store-title-1">{store.storeName}</div>
                          <div className="store-review-option-1">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                          </div>
                          <div className="store-distance">
                            내 위치에서 {distances[store.addr] ? formatDistance(distances[store.addr]) : '정보 없음'}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 </div>
              )}
            </div>
          </div>


          {/* 서비스 랜덤으로 뿌리기 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef3} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef3} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/unicorn.png" alt="smile" /></div>
              <div className="title-name">특별한 서비스가 고객님을 기다립니다!</div>
            </h3>
            <div className="user-main-list-wrap" ref={storeListRef3}>
              {level1Categories.length > 0 ? (
                // 이미지 URL이 있는 카테고리만 필터링 후, storeNo 중복 제거 및 랜덤으로 섞기
                [...new Map(level1Categories.filter(category => category.imageUrl)  // 이미지가 있는 카테고리만 필터링
                  .map(category => [category.storeNo, category])).values()]
                  .sort(() => Math.random() - 0.5)  // 배열을 랜덤으로 섞기
                  .map((category) => {
                    const imageUrl = category.imageUrl;
                    const serviceName = category.serviceName;
                    const servicePrice = category.servicePrice;
                    const serviceContent = category.serviceContent;

                    return (
                      <div className="user-main-list-container" key={category.storeNo} onClick={() => goToStoreDetail(category.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img">
                            <img src={imageUrl} alt={serviceName} />
                            <div className="event-box3">{serviceName}</div>
                          </div>
                          <div className="category-service-content">{serviceContent}</div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다</div>
              )}
            </div>
          </div>



          {/* 예약 많은 순 */}
          <div className="user-main-content">
            <h3>
              <div className="title-name"><img src="/img/user-main/hot.png" alt="hot" /></div>
              <div className="title-name">예약 핫플레이스 BEST</div>
            </h3>
            <div className="user-main-list-wrap user-main-list-wrap-22">
              {store.length > 0 ? (
                store
                  .sort((a, b) => b.reservationCount - a.reservationCount) // 예약 많은 순으로 정렬
                  .slice(0, Math.floor(store.length / 2) * 2) // 길이를 반으로 자르기
                  .slice(0, 8)
                  .map((store) => {
                    const imageUrl = store.storeImages.length > 0
                      ? store.storeImages[0].storeImgLocation
                      : "/img/cake001.jpg"; // 기본 이미지 설정

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img user-category-menu-img2">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                            <div className="event-box">Hot Place</div>
                          </div>
                          <div className="store-title-2">{store.storeName}</div>
                          <div className="store-review-option">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다</div>
              )}
            </div>
          </div>


          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731039573/hgsu9ohdoygw2ysrkcsg.jpg' />
          </div>


          {/* 신규 오픈 가게 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef2} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef2} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/new.png" /></div> <div className="title-name">새로 오픈했어요!</div>
            </h3>

            <div className="user-main-list-wrap" ref={storeListRef2}>
              {store.length > 0 ? (
                // storeSignup 날짜 기준으로 최신 오픈 가게부터 정렬
                store
                  .map((store) => ({
                    ...store,
                    signupDate: new Date(store.storeSignup), // storeSignup 날짜를 Date 객체로 변환
                  }))
                  .sort((a, b) => b.signupDate - a.signupDate) // 최신 날짜 순으로 정렬
                  .map((store) => {
                    const imageUrl = store.storeImages.length > 0
                      ? store.storeImages[0].storeImgLocation
                      : "/img/cake001.jpg"; // 기본 이미지 설정

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                            <div className="event-box2">Newly Opened</div>
                          </div>
                          <div className="store-title-2">{store.storeName}</div>
                          <div className="store-review-option">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 </div>
              )}
            </div>
          </div>


          <div className="user-main-menu-bar-container">
            <h3>원하는 가격대에 맞는 가게를 찾아보세요!</h3>
            <div className="user-main-menu-bar">
              <button type="button" className={activeSection === 'menu1' ? 'active' : ''} onClick={() => setActiveSection('menu1')}>2만원 이하</button>
              <button type="button" className={activeSection === 'menu2' ? 'active' : ''} onClick={() => setActiveSection('menu2')}>2~3만원</button>
              <button type="button" className={activeSection === 'menu3' ? 'active' : ''} onClick={() => setActiveSection('menu3')}>3~5만원</button>
              <button type="button" className={activeSection === 'menu4' ? 'active' : ''} onClick={() => setActiveSection('menu4')}>5만원 이상</button>
            </div>
          </div>

          {activeSection === 'menu1' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store
                  .filter((store) => {
                    // 해당 store에 대한 level1Categories 중 servicePrice가 20,000 이하인 항목이 하나라도 있으면 해당 store 표시
                    return level1Categories
                      .filter(category => category.storeNo === store.storeNo && category.servicePrice <= 20000)
                      .length > 0;
                  })
                  .slice(0, 5)
                  .map((store) => {
                    // 이미지가 없는 가게는 표시하지 않음
                    if (store.storeImages.length === 0) {
                      return null; // 이미지가 없는 가게는 렌더링하지 않음
                    }

                    const imageUrl = store.storeImages[0].storeImgLocation;

                    return (
                      <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-main-menu-img">
                          <img src={imageUrl} alt={store.storeName} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '50%' }}/>
                        </div>
                        <div className='user-main-menu-info'>
                          <div className="menu-info-store-name">{store.storeName}</div>
                          <div className="menu-info-hashtag">
                            {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                              <span key={category.id} className="menu-info-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>
                            ))}
                          </div>

                          <div className="menu-info-bottom-box">
                            <div className="menu-info-review-cate">
                              <i className="bi bi-star-fill"></i> <span className="menu-info-review">{store.averageRating}</span> <span className="menu-info-cate">{store.storeCate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}


          {activeSection === 'menu2' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store
                  .filter((store) => {
                    // servicePrice가 20,000 초과 30,000 이하인 store만 필터링
                    return level1Categories
                      .filter(category => category.storeNo === store.storeNo && category.servicePrice > 20000 && category.servicePrice <= 30000)
                      .length > 0;
                  })
                  .slice(0, 5)
                  .map((store) => {
                    // 이미지가 없는 가게는 표시하지 않음
                    if (store.storeImages.length === 0) {
                      return null; // 이미지가 없는 가게는 렌더링하지 않음
                    }

                    const imageUrl = store.storeImages[0].storeImgLocation;

                    return (
                      <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-main-menu-img">
                          <img src={imageUrl} alt={store.storeName} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '50%' }}/>
                        </div>
                        <div className='user-main-menu-info'>
                          <div className="menu-info-store-name">{store.storeName}</div>
                          <div className="menu-info-hashtag">
                            {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                              <span key={category.id} className="menu-info-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>
                            ))}
                          </div>
                          <div className="menu-info-review-cate">
                            <i className="bi bi-star-fill"></i> <span className="menu-info-review">{store.averageRating}</span> <span className="menu-info-cate">{store.storeCate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}


          {activeSection === 'menu3' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store
                  .filter((store) => {
                    // servicePrice가 30,000 초과 50,000 미만인 store만 필터링
                    return level1Categories
                      .filter(category => category.storeNo === store.storeNo && category.servicePrice > 30000 && category.servicePrice < 50000)
                      .length > 0;
                  })
                  .slice(0, 5)
                  .map((store) => {
                    // 이미지가 없는 가게는 표시하지 않음
                    if (store.storeImages.length === 0) {
                      return null; // 이미지가 없는 가게는 렌더링하지 않음
                    }

                    const imageUrl = store.storeImages[0].storeImgLocation;

                    return (
                      <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-main-menu-img">
                          <img src={imageUrl} alt={store.storeName} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '50%' }}/>
                        </div>
                        <div className='user-main-menu-info'>
                          <div className="menu-info-store-name">{store.storeName}</div>
                          <div className="menu-info-hashtag">
                            {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                              <span key={category.id} className="menu-info-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>
                            ))}
                          </div>
                          <div className="menu-info-review-cate">
                            <i className="bi bi-star-fill"></i> <span className="menu-info-review">{store.averageRating}</span> <span className="menu-info-cate">{store.storeCate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}

          {activeSection === 'menu4' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store
                  .filter((store) => {
                    // 해당 store에 대한 level1Categories 중 servicePrice가 50,000 이상인 항목이 하나라도 있으면 해당 store 표시
                    return level1Categories
                      .filter(category => category.storeNo === store.storeNo && category.servicePrice >= 50000)
                      .length > 0;
                  })
                  .slice(0, 5)
                  .map((store) => {
                    // 이미지가 없는 가게는 표시하지 않음
                    if (store.storeImages.length === 0) {
                      return null; // 이미지가 없는 가게는 렌더링하지 않음
                    }

                    const imageUrl = store.storeImages[0].storeImgLocation;

                    return (
                      <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-main-menu-img">
                          <img src={imageUrl} alt={store.storeName} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '50%' }}/>
                        </div>
                        <div className='user-main-menu-info'>
                          <div className="menu-info-store-name">{store.storeName}</div>
                          <div className="menu-info-hashtag">
                            {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                              <span key={category.id} className="menu-info-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>
                            ))}
                          </div>
                          <div className="menu-info-review-cate">
                            <i className="bi bi-star-fill"></i> <span className="menu-info-review">{store.averageRating}</span> <span className="menu-info-cate">{store.storeCate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}



          {/* 그냥 가게 랜덤으로 뿌리기 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef4} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef4} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/smile.png" /></div> <div className="title-name">고객님을 위한 특별한 추천 리스트입니다!</div>
            </h3>
            <div className="user-main-list-wrap" ref={storeListRef4}>
              {store.length > 0 ? (
                store.sort(() => Math.random() - 0.5)
                  .map((store) => {
                    const imageUrl = store.storeImages.length > 0
                      ? store.storeImages[0].storeImgLocation
                      : "/img/cake001.jpg"; // 기본 이미지 설정

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img user-category-menu-img2">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                            {/* <div className="event-box">최대 40% 할인 이벤트</div> */}
                          </div>
                          <div className="store-title-2">{store.storeName}</div>
                          <div className="store-review-option">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                            {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 </div>
              )}
            </div>
          </div>


          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731039573/fuwqrgrxuqtho4exgpk5.jpg' />
          </div>


          {/* 별점 높은 순 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef5} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef5} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/review.png" alt="review icon" /></div>
              <div className="title-name">예약 만족도가 높은 가게만 모아봤어요!</div>
            </h3>

            <div className="user-main-list-wrap" ref={storeListRef5}>
              {store.length > 0 ? (
                store
                  .sort((a, b) => b.averageRating - a.averageRating) // 별점 높은 순으로 정렬
                  .map((store) => {
                    const imageUrl = store.storeImages.length > 0
                      ? store.storeImages[0].storeImgLocation
                      : "/img/cake001.jpg"; // 기본 이미지 설정

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                          </div>
                          <div className="store-title-2">{store.storeName}</div>
                          <div className="store-review-option">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 </div>
              )}
            </div>
          </div>


          {/* 서비스명 랜덤으로 뿌리기 */}
          <div className="user-main-content">
            <h3>
              <div className="title-name"><img src="/img/user-main/hot3.png" alt="Hot" /></div>
              <div className="title-name">고객님께 딱 맞는 서비스, 추천드립니다!</div>
            </h3>
            <div className="user-main-list-wrap user-main-list-wrap-33">
              {level1Categories.length > 0 ? (() => {
                // 무작위로 섞기 (원본 순서와 패턴 고정)
                const shuffledCategories = [...new Map(
                  level1Categories.filter(category => category.imageUrl)
                    .map(category => [category.storeNo, category])
                ).values()].sort(() => Math.random() - 0.5).slice(0, 20);

                // 고정된 패턴에 따라 배열을 나눔
                const patternOrder = ['s', 'l', 'l', 's', 's', 'l', 'l', 's', 's', 'l', 'l', 's', 's', 'l', 'l', 's', 's', 'l', 'l', 's', 's', 'l', 'l'];

                return patternOrder.map((size, index) => {
                  const category = shuffledCategories[index];
                  if (!category) return null; // 카테고리가 부족한 경우 대비

                  const className = size === 's'
                    ? 'user-main-list-container-s'
                    : 'user-main-list-container-l';
                  const imageUrl = category.imageUrl;

                  return (
                    <div
                      className={`user-main-list-container ${className}`}
                      key={category.storeNo}
                      onClick={() => goToStoreDetail(category.storeNo)}
                    >
                      <div className="user-category-menu">
                        <div className="user-category-menu-img user-category-menu-img2">
                          <img src={imageUrl} alt={category.serviceName} />
                          <div className="store-service-name">{category.serviceName}</div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })() : (
                <div className="no-stores">정보를 불러오지 못 했습니다</div>
              )}
            </div>
          </div>



          {/* 리뷰 많은 순 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef6} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef6} aria-label="오른쪽으로 이동">›</button>
            <h3>
              <div className="title-name"><img src="/img/user-main/review2.png" alt="review icon" /></div>
              <div className="title-name">리뷰가 많은 가게에서 만나는 최고의 서비스!</div>
            </h3>

            <div className="user-main-list-wrap" ref={storeListRef6}>
              {store.length > 0 ? (
                store
                  .sort((a, b) => b.reviewCount - a.reviewCount) // 리뷰 많은 순으로 정렬
                  .map((store) => {
                    const imageUrl = store.storeImages.length > 0
                      ? store.storeImages[0].storeImgLocation
                      : "/img/cake001.jpg"; // 기본 이미지 설정

                    return (
                      <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                        <div className="user-category-menu">
                          <div className="user-category-menu-img">
                            <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                              <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                            </button>
                            <img src={imageUrl} alt={store.storeName} />
                          </div>
                          <div className="store-title-2">{store.storeName}</div>
                          <div className="store-review-option">
                            <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                            <span className="review-count">({store.reviewCount})</span>
                            <span className="store-option">{store.storeCate || '미등록'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다</div>
              )}
            </div>
          </div>


          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731039573/hgsu9ohdoygw2ysrkcsg.jpg' />
          </div>

          <div className="search-result-list-container">
            <h3>다양한 가게들을 더 많이 만나보세요!</h3>
            {store.length > 0 ? (
              store.slice(0, visibleCount).map((store) => {
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
                        {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                          <span key={category.id} className="result-list-option">
                            <i className="bi bi-hash"></i>
                            {category.serviceName}
                          </span>
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
              <div className="no-stores">Loading...</div>
            )}

            <div className='load-more-btn-wrap'>
              <button onClick={handleLoadMore} className="load-more-btn">추천 가게 더 보기</button>
            </div>
          </div>




        </div>
      </div>
    </div>


  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<UserMain />);
