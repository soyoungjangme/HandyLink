import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import BasicMap from "../Payment/BasicMap";
import "./UserStoreDetail.css";

function UserStoreDetail() {

  const [activeSection, setActiveSection] = useState('home');
  const [cateId, setCateId] = useState(0);
  const [reservationList, setReservationList] = useState([]);
  const [storeInfo, setStoreInfo] = useState([]);
  const [reviewList, setReviewList] = useState({});
  const [reviewPhotoList, setReviewPhotoList] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState([]); //찜
  const [showMap, setShowMap] = useState(true); // 맵 표시 상태
  const [storeLocation, setStoreLocation] = useState({ lat: 37.5709, lng: 126.9851 });

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

  /************채팅**************/

  const [userId, setUserId] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 사용자 정보 가져오기 (로그인된 userId)
    axios.get('/chat/current')
      .then(response => setUserId(response.data.userId))
      .catch(error => console.error('사용자 정보를 가져오는데 실패했습니다:', error));
  }, []);


  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const storeNo = pathSegments[pathSegments.length - 1];
    console.log("Store No from URL:", storeNo);

    // 가게 정보 가져오기
    axios.get(`/UserStoreDetail/getStoreInfo/${storeNo}`)
      .then(response => {
        setStoreInfo(response.data);

        // Kakao Maps API로 주소 좌표 검색
        if (window.kakao && response.data.addr) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(response.data.addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const { x: lng, y: lat } = result[0];
              setStoreLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
            } else {
              console.error('Kakao Maps 주소 검색 실패:', status);
            }
          });
        }
      })
      .catch(error => console.error('Error loading store info:', error));
  }, []);



  // 채팅방으로 이동
  const handleInquiryClick = async () => {

    if (!userId) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      //window.location.href = "/UserLoginPage.user";
      return;
    }

    if (userId && storeInfo.storeNo) {
      try {
        // 채팅 상태를 Y로 업데이트
        await axios.post(`/chat/reactivate?userId=${userId}&storeNo=${storeInfo.storeNo}`);

        // 채팅방으로 이동
        window.location.href = `/UserChatRoom.user?userId=${userId}&storeNo=${storeInfo.storeNo}`;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("로그인 후 이용 가능한 서비스입니다.");
          // window.location.href = "/UserLoginPage.user";
        } else {
          console.error("문의하기 중 에러 발생:", error);
        }
      }
    } else {
      console.error('문의하기 중 에러 발생');
    }
  };




  /*****************************/


  const goToAdminPage = (id) => {



    sessionStorage.setItem('storeCloseTime', storeInfo.storeCloseTime);
    sessionStorage.setItem('storeOpenTime', storeInfo.storeOpenTime);
    sessionStorage.setItem('storeNo', storeInfo.storeNo);
    sessionStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    sessionStorage.setItem('userName', userInfo.userName);
    sessionStorage.setItem('userPhonenum', userInfo.userPhonenum);
    sessionStorage.setItem('userId', userInfo.userId);
    sessionStorage.setItem('pickupStatus', pickupStatus);

    window.location.href = `/UserReservationDate.user/${id}`;
  };

  const goToAdminPage2 = (id) => {



    sessionStorage.setItem('storeCloseTime', storeInfo.storeCloseTime);
    sessionStorage.setItem('storeOpenTime', storeInfo.storeOpenTime);
    sessionStorage.setItem('storeNo', storeInfo.storeNo);
    sessionStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    sessionStorage.setItem('userName', userInfo.userName);
    sessionStorage.setItem('userPhonenum', userInfo.userPhonenum);
    sessionStorage.setItem('userId', userInfo.userId);
    sessionStorage.setItem('pickupStatus', pickupStatus);

    window.location.href = `/UserReservationOption.user/${id}`;
  };

  // ------------------------------------------------------

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);

    axios.get(`/UserStoreDetail/getStoreMainCategory/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReservationList(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });
    axios.get(`/UserStoreDetail/getStoreInfo/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setStoreInfo(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });
    axios.get(`/adminStore/getNoticeList/${categoryId}`)
      .then(response => {
        const modifiedData = response.data.map(notice => ({
          ...notice,
          noticeRegdate: notice.noticeRegdate.split("T")[0] // 날짜 부분만 저장
        }));
        console.log(modifiedData);
        setNoticeList(modifiedData);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

    axios.get(`/userReservation/getReviewList/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReviewList(response.data);
      })
      .catch(error => {
        console.log("리뷰 쪽 에러 발생", error);
      })
    axios.get(`/userReservation/getReviewPhotoList/${categoryId}`)
      .then(response => {
        console.log(response.data);
        setReviewPhotoList(response.data);
      })
      .catch(error => {
        console.log("리뷰 쪽 에러 발생", error);
      })
    axios.get(`/user/profile`)
      .then(response => {
        console.log(response.data);
        setUserInfo(response.data);
      })
      .catch(error => {
        console.log("리뷰 쪽 에러 발생", error);
      })


  }, []);

  const totalRating = reviewList.length > 0
    ? reviewList.reduce((sum, review) => sum + review.reviewRating, 0) / reviewList.length
    : 0;

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = (imgUrl) => {
    setSelectedImage(imgUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const defaultPhotos = [
    'https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731331851/bznpxzxdgutdtextodq0.png', // 기본 사진 경로 1
    'https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731331851/bznpxzxdgutdtextodq0.png', // 기본 사진 경로 2
    'https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731331851/bznpxzxdgutdtextodq0.png'  // 기본 사진 경로 3
  ];


  const formatServiceStartDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');

    const currentTime = new Date(); // 현재 시간

    // serviceStart 시간과 현재 시간을 비교
    const serviceStartDate = new Date(dateString);
    const isPast = serviceStartDate < currentTime; // 이미 지난 시간이라면 true

    // 시간이 지난 경우 아무것도 렌더링하지 않음
    if (isPast) {
      return null; // 해당 시간이 지나면 아무것도 렌더링하지 않음
    }


    return ` ${year}/${month}/${day} ${hours}시 OPEN `;
  };

  // ------------------------------------------------------


  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (storeInfo && storeInfo.storeImg && storeInfo.storeImg.length > 0) {
      const totalSlides = storeInfo.storeImg.length;

      const slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000); // 3초마다 슬라이드 변경

      return () => clearInterval(slideInterval); // 컴포넌트 언마운트 시 클리어
    }
  }, [storeInfo]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % storeInfo.storeImg.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + storeInfo.storeImg.length) % storeInfo.storeImg.length);
  };

  // 남은 시간을 계산하는 함수
  const calculateRemainingTime = (serviceStart) => {
    const serviceStartDate = new Date(serviceStart);
    const today = new Date();


    // 두 날짜 간의 차이 계산
    const timeDifference = serviceStartDate - today;

    // 남은 시간, 일, 시간, 분, 초 계산
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // 음수인 경우 0으로 설정
    return {
      days: Math.max(days, 0),
      hours: Math.max(hours, 0),
      minutes: Math.max(minutes, 0),
      seconds: Math.max(seconds, 0),
    };
  };


  // // 날짜 포맷 변환 함수
  // const convertDateFormat2 = (dateString, format) => {
  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const hours = String(date.getHours()).padStart(2, '0');
  //   const minutes = String(date.getMinutes()).padStart(2, '0');

  //   switch (format) {
  //     case 'YYYY/MM/DD':
  //       return `${year}/${month}/${day}`;
  //     case 'DD-MM-YYYY':
  //       return `${day}-${month}-${year}`;
  //     case 'MM-DD-YYYY':
  //       return `${month}-${day}-${year}`;
  //     case 'YYYY/MM/DD HH:mm':
  //       return `${year}/${month}/${day} ${hours}:${minutes}`; // 연/월/일 시:분
  //     default:
  //       return dateString; // 기본적으로 원본 반환
  //   }
  // };

  const calculateDaysUntilServiceStart = (serviceStart) => {
    const serviceStartDate = new Date(serviceStart);
    const today = new Date();

    // 오늘 날짜의 시간을 00:00:00으로 설정
    today.setHours(0, 0, 0, 0);

    // 두 날짜 간의 차이 계산
    const timeDifference = serviceStartDate - today;

    // 차이를 일로 변환
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    // 음수인 경우 0으로 설정
    return Math.max(daysDifference, 0);
  };

  // const convertDateFormat = (dateString, format) => {
  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');

  //   switch (format) {
  //     case 'YYYY/MM/DD':
  //       return `${year}/${month}/${day}`;
  //     case 'DD-MM-YYYY':
  //       return `${day}-${month}-${year}`;
  //     case 'MM-DD-YYYY':
  //       return `${month}-${day}-${year}`;
  //     default:
  //       return dateString; // 기본적으로 원본 반환
  //   }
  // };

  // --------------------------------------------------------- 소식


  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleText = (id) => {
    setExpandedReviews((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const [noticeList, setNoticeList] = useState([]);


  // 각 공지의 토글 상태를 저장하는 상태 (행별로 관리)
  const [expandedRows, setExpandedRows] = useState([]);

  // 특정 행을 클릭했을 때 해당 행의 상세 내용을 표시하도록 토글
  const handleToggleRow = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };


  console.log("가게정보 ", storeInfo);

  // ------------------------------------------------

  const [sortOrder, setSortOrder] = useState('latest'); // 기본 정렬 기준 설정



  // 리뷰 정렬 함수
  // 리뷰 정렬 함수
  const sortReviews = (reviews, order) => {
    if (!Array.isArray(reviews)) {
      console.warn('Reviews should be an array.'); // 디버깅용 경고 메시지
      return []; // reviews가 배열이 아닐 경우 빈 배열 반환
    }

    switch (order) {
      case 'latest':
        return [...reviews].sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)); // 최신순
      case 'oldest':
        return [...reviews].sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate)); // 오래된순
      case 'lowRating':
        return [...reviews].sort((a, b) => a.reviewRating - b.reviewRating); // 별점 낮은순
      case 'highRating':
        return [...reviews].sort((a, b) => b.reviewRating - a.reviewRating); // 별점 높은순
      default:
        return reviews;
    }
  };
  // 정렬된 리뷰 목록
  const sortedReviewList = sortReviews(reviewList, sortOrder);




  // 정렬 기준 변경 함수
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // 뒤로가기 추가
  const handleGoBack = () => {
    window.history.back();
  };
  const photosToDisplay = [
    ...Array.from(new Set(reviewPhotoList.map(photo => photo.reviewImgUrl))),
    ...defaultPhotos
  ].slice(0, 3);

  const uniquePhotos = reviewPhotoList
    .map((photo) => photo.reviewImgUrl) // reviewImgUrl만 추출
    .filter((url, index, self) => self.indexOf(url) === index); // 중복 제거


  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const handleModalOpen = (value) => {
    if (!userId) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      window.location.href = "/UserLoginPage.user";
      return;
    }
    setSelectedReservation(value); // 선택된 예약 데이터를 저장
    setIsModalOpen2(true); // 모달 열기
  };

  const handleModalClose = () => {
    setIsModalOpen2(false); // 모달 닫기
    setSelectedReservation(null); // 선택된 예약 데이터 초기화
    setPickupStatus('');
  };


  const [pickupStatus, setPickupStatus] = useState('');

  const handleChange = (e) => {
    setPickupStatus(e.target.value);
  };

  
const handlePickupOrDeliveryClick = (value) => {
  setPickupStatus(value); // 상태 업데이트 (배송/픽업)
};


const handleNextClick = () => {
  if (pickupStatus === '') {
    alert('배송 방법을 선택해주세요!');
    return;
  }

  if (pickupStatus === '배송') {
    goToAdminPage2(selectedReservation.categoryId);
  } else {
    goToAdminPage(selectedReservation.categoryId);
  }

  // 모달 닫기
  handleModalClose();
};


  return (
    <div>
      <div className="user-main-container">
        {/*     잠시 주석 처리하겠습니다..
        <div className="user-top-nav">
          <i className="bi bi-arrow-left" onClick={handleGoBack}></i>
          <logo className="logo"> 상단바 고민중 </logo>
        </div>
*/}

        <div className="user-main-content">
          <div className="user-content-first">
            <div className="user-content-first-img">
              {storeInfo && storeInfo.storeImg && storeInfo.storeImg.length > 0 ? (
                <>
                  <div className="slides">
                    {storeInfo.storeImg.map((store, index) => (
                      <div
                        key={index}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                      >
                        <img src={store.storeImgLocation} alt="가게 이미지" width="100%" height="300px " object-fit="cover" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handlePrevSlide} className="slide-button prev-button">❮</button>
                  <button onClick={handleNextSlide} className="slide-button next-button">❯</button>
                </>
              ) : (
                <p>이미지를 불러올 수 없습니다.</p>
              )}
            </div>
            <div className="user-content-first-img-num"></div>

            <div className="user-content-first-content">
              <div className="store-name-box">
                <div style={{ display: 'flex' }}>
                  {/*<button type="button">
                    <i className="bi bi-star"></i>
                  </button>*/}

                  <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(storeInfo); }}>
                    <i className={`bi bi-heart-fill ${isBookmarked.includes(storeInfo.storeNo) ? 'like' : ''}`}></i>
                  </button>

                  <div className="store-name">{storeInfo.storeName}</div>
                </div>
                <button className="chat-btn" type="button" onClick={handleInquiryClick}>
                  <img src="../img/store/chat.png" />

                </button>{/*문의하기 버튼*/}
              </div>
              <div className="store-basic-info"><img src="../img/store/shop2.png" />
                <div className="store-addr"> {storeInfo.addr}   {storeInfo.addrdetail}</div>
              </div>
              {/* <hr /> */}
              <div className="store-basic-info"><img src="../img/store/clock.png" /> {storeInfo.formattedOpenTime} ~ {storeInfo.formattedCloseTime}</div>
              <div className="store-basic-info"><img src="../img/store/telephone.png" /> {storeInfo.managerPhone} </div>
            </div>
          </div>

          <div className="store-detail-menu">
            <button
              type="button"
              onClick={() => setActiveSection('home')}
              className={activeSection === 'home' ? 'active' : ''}
            >
              홈
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('info')}
              className={activeSection === 'info' ? 'active' : ''}
            >
              소식
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('reservation')}
              className={activeSection === 'reservation' ? 'active' : ''}
            >
              예약
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('review')}
              className={activeSection === 'review' ? 'active' : ''}
            >
              리뷰
            </button>
          </div>


          {/* 홈 */}
          {activeSection === 'home' && (
            <div>

              <div className="user-content-container"> {/*위치, 번호, 영업시간, 주차, sns*/}
                <div>
                  <div className="store-basic-info"><img src="../img/store/shop2.png" />
                    <div className="store-addr">{storeInfo.addr}   {storeInfo.addrdetail} </div>
                  </div>
                  <div className="store-basic-info"><img src="../img/store/clock.png" /> {storeInfo.formattedOpenTime} ~ {storeInfo.formattedCloseTime}</div>
                  <div className="store-basic-info">
                    <img src="../img/store/calendar.png" />
                    <div>
                      {Array.isArray(storeInfo.dayOffDayList) && storeInfo.dayOffDayList.some(day => day.dayOffDay) > 0 ? (
                        <div>
                          매주 {storeInfo.dayOffDayList.map(day => day.dayOffDay).join(', ')} 휴무
                        </div>
                      ) : (
                        <div>연중무휴</div>
                      )}
                      {Array.isArray(storeInfo.dayOffSetList) && storeInfo.dayOffSetList.some(dayOffSet =>
                        dayOffSet.dayOffStart && dayOffSet.dayOffEnd) > 0 ? (
                        storeInfo.dayOffSetList.map((dayOffSet, index) => {
                          const startDate = new Date(dayOffSet.dayOffStart);
                          const endDate = new Date(dayOffSet.dayOffEnd);

                          // 원하는 형식으로 변환 (MM/DD 형식)
                          const formattedStartDate = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
                          const formattedEndDate = `${endDate.getMonth() + 1}/${endDate.getDate()}`;

                          return (
                            <div key={index}>
                              {formattedStartDate} ~ {formattedEndDate} 휴무
                            </div>
                          );
                        })
                      ) : (
                        null
                      )}
                    </div>
                  </div>
                  <div className="store-basic-info"><img src="../img/store/telephone.png" /> {storeInfo.managerPhone}</div>
                  <div className="store-basic-info">
                    {storeInfo.storeParkingYn === 'Y' ? (
                      <img src="../img/store/parking.png" alt="주차 가능" />
                    ) : (
                      <img src="../img/store/noparking.png" alt="주차 불가" />
                    )}
                    {storeInfo.storeParkingYn === 'Y' ? '주차가능' : '주차불가'}
                  </div>

                  <div className="store-basic-info">
                    <div>
                      {storeInfo.storeSns ? (
                        storeInfo.storeSns.map((sns, index) => {
                          const snsImageMap = {
                            "인스타그램": "../img/store/instagram.png",
                            "페이스북": "../img/store/facebook.png",
                            "네이버": "../img/store/naver.png",
                            "유튜브": "../img/store/youtube.png"
                          };
                          const imageSrc = snsImageMap[sns.snsName];

                          return (
                            <div key={index} className="sns-list-box">
                              {imageSrc && <img src={imageSrc} alt={sns.snsName} className="sns-image" />}
                              <a href={sns.snsLink} className="sns-name">{sns.snsName}</a>
                            </div>

                          );
                        })
                      ) : null}
                    </div>
                  </div>


                </div>
              </div>

              <div className="user-content-container">
                <div className="store-intro-box">
                  <img src="../img/store/smile.png" /> {storeInfo.storeName}
                </div>
                <div style={{ margin: '10px 10px 0 10px' }}>
                  {storeInfo.storeIntro}
                </div>
              </div>


              {noticeList.length === 0 ? (
                <></>
              ) : (
                <div className="user-content-container">
                  {noticeList.slice(0, 5).map((notice, index) => (
                    notice.status === 'Y' && (
                      <ul key={index}>
                        <li className="announcement-list">
                          <img src="../img/store/announcement.png" /> {notice.noticeType} | {notice.noticeContent.slice(0, 20)}...
                        </li>
                      </ul>
                    )
                  ))}
                </div>
              )}




              <div className="user-store-map-box">
                <div></div>
                {showMap && (
                  <div>
                    <BasicMap storeLocation={storeLocation} storeName={storeInfo.storeName} />
                  </div>
                )}
              </div>


            </div>
          )}

          {/* 소식 */}
          {activeSection === 'info' && (

            <div>
              {/* 배너 */}
              <div className="advertisement-banner">
                <img src='https://res.cloudinary.com/dtzx9nu3d/image/upload/v1731039442/pbc4moqfrdcsxmipvbgw.jpg' />
              </div>


              {noticeList.length === 0 ? (
                <div className="user-content-container11" style={{ marginBottom: '50%' }}>
                  {/* 기본 정보는 항상 보이게 함 */}
                  <div className='notice-content1'>등록된 소식이 없습니다.</div>

                </div>


              ) : (
                noticeList.map((notice, index) => (
                  notice.status === 'Y' && (
                    <React.Fragment key={index}>
                      <div className="user-content-container11">
                        {/* 기본 정보는 항상 보이게 함 */}
                        <div className="notice-top">
                          <div
                            className="type-title"
                            style={{
                              backgroundColor: notice.noticeType === '소식' ? 'rgb(255 255 255)' :
                                notice.noticeType === '공지사항' ? 'rgb(255 242 224)' : 'transparent'
                            }}
                          >
                            {notice.noticeType}
                          </div>
                          <duv>{notice.noticeRegdate}</duv>
                        </div>

                        {/* noticeContent는 토글로 표시 */}
                        {expandedRows.includes(index) ? (
                          <div>
                            <div className='notice-content1'>{notice.noticeContent}</div>
                            <span onClick={() => handleToggleRow(index)} style={{ color: '#686868' }}>접기</span>
                          </div>
                        ) : (
                          <div>
                            <div>
                              {notice.noticeContent.length > 100
                                ? `${notice.noticeContent.slice(0, 100)}`
                                : notice.noticeContent}
                            </div>
                            {notice.noticeContent.length > 100 && (
                              <span onClick={() => handleToggleRow(index)} style={{ color: '#686868' }} >... 더보기</span>
                            )}
                          </div>
                        )}
                      </div>

                    </React.Fragment>
                  )
                )))}

            </div>



          )}

          {/* 예약 */}
          {activeSection === 'reservation' && (
            <>
              {reservationList.map((value, index) => {
                if (value.activated === 'Y') {
                  const serviceStartDate = new Date(value.serviceStart);
                  const isServiceStarted = serviceStartDate <= new Date(); // 현재 시간이 시작일보다 큰지 체크

                  return (
                    <div
                      className={`user-content-container ${isServiceStarted ? '' : 'disabled'}`}
                      key={index}
                      onClick={() => {
                        if (isServiceStarted) {
                          handleModalOpen(value); // 클릭된 항목의 value를 모달에 전달
                        }
                      }}
                    >
                      <div className="user-reserve-menu">
                        <div className="user-reserve-menu-img">
                          <img src={`${value.imageUrl}`} alt="Service Image" />
                        </div>
                        <div className="user-reserve-menu-content">
                          <div className='open-date'>{formatServiceStartDate(value.serviceStart)}</div>
                          <div>{value.serviceName}</div>
                          <div>{value.serviceContent}</div>
                          <div>{value.servicePrice} 원 ~</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}


{isModalOpen2 && selectedReservation && (
  <div className="modal-overlay2">
    <div className="modal2">
      <div className='modal-choice-img-box'>
        <div className="modal-choice-img">
          <img src="../img/store/choice.png" />
        </div>
        <div className="modal-choice-text">주문방법을 선택해주세요</div>
      </div>

      <div className="modal-box">
        <div className="modal-btns">
          <div
            className={`modal-pickup-img ${pickupStatus === '배송' ? 'selected' : ''}`}
            onClick={() => handlePickupOrDeliveryClick('배송')}
            style={storeInfo.deliveryType === '픽업' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            <img src="../img/store/deliveryr.png" />
            <label>배송</label>
          </div>
          <div
            className={`modal-deliveryr-img ${pickupStatus === '픽업' ? 'selected' : ''}`}
            onClick={() => handlePickupOrDeliveryClick('픽업')}
            style={storeInfo.deliveryType === '배송' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            <img src="../img/store/pickup.png" />
            <label>픽업</label>
          </div>
        </div>
      </div>

      <button 
        className="modal-next-btn" 
        onClick={handleNextClick}
        disabled={pickupStatus === ''}
      >
        다음
      </button>

      <button className='modal-close' onClick={handleModalClose}>
        X
      </button>
    </div>
  </div>
)}




            </>




          )}

          {/* 리뷰 */}
          {activeSection === 'review' && (
            <div className="user-content-container5">
              <div className="review-section">


                <div className='photo-rating-box'>

                  <div className="photo-review">
                    {photosToDisplay.map((url, index) => (
                      <div className="photo-item" key={index}>
                        <img src={url} alt="Review Photo" />
                        {index === 2 && reviewPhotoList.length > 3 && (
                          <div className="photo-item more" onClick={() => setActiveSection('photo')}>
                            +더보기
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="total-rating">

                    {[...Array(5)].map((_, index) => (
                      <span key={index} className={`star ${totalRating > index ? 'filled' : ''}`}>
                        &#9733; {/* 별 아이콘 */}
                      </span>
                    ))}
                    <span> {totalRating.toFixed(1)} / 5  <span style={{ color: '#999' }} >({sortedReviewList.length}) </span></span>
                  </div>
                </div>

                <div className="sort-reviews">
                  {/* <label htmlFor="sortOrder">정렬 기준: </label> */}
                  <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                    <option value="highRating">별점높은순</option>
                    <option value="lowRating">별점낮은순</option>
                  </select>
                </div>

                <div className="reviews">
                  {sortedReviewList.map((review) => (
                    <div key={review.reviewNo} className="review-item">

                      <div className="photo-review2">
                        {[...new Set(review.userReviewImg)].map((imgUrl, index) => {
                          const formattedUrl = imgUrl.replace('blob:', '');
                          return (
                            <img
                              key={index}
                              className="photo-item2"
                              src={formattedUrl}
                              alt={`Review image ${index + 1}`}
                              onClick={() => openModal(formattedUrl)}
                              style={{ cursor: 'pointer' }}
                            />
                          );
                        })}

                      </div>



                      <div className="review-header">
                        <span className="reviewer-name">{review.userName}</span>

                        <div className="review-rating">
                          <div className="rating-section">
                            {/* 총 5개의 별을 기준으로 렌더링 */}
                            {[...Array(5)].map((_, starIndex) => (
                              <span key={starIndex} className='review-rating'>
                                {starIndex < review.reviewRating ? (
                                  <span>&#9733;</span> // 채워진 별
                                ) : (
                                  <span>&#9734;</span> // 비어 있는 별
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                      <div className="review-details">
                        {/* <span className="review-title">{review.title}</span> */}
                        <span className="review-date">{review.reviewDate}</span>
                        <span className="review-date">{review.serviceName}</span>
                      </div>
                      <p
                        className={`review-text ${expandedReviews[review.reviewNo] ? "expanded" : ""}`}
                      >
                        {expandedReviews[review.reviewNo] ? review.reviewContent : review.reviewContent.slice(0, 50)}
                      </p>

                      {review.reviewContent.length < 50 ? '' : (
                        <a
                          className="more-link"
                          onClick={() => toggleText(review.reviewNo)}
                          style={{ cursor: "pointer" }}
                        >
                          {expandedReviews[review.reviewNo] ? " 접기" : "...더보기"}
                        </a>
                      )}


                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}




          {isModalOpen && (
            <div className="modal" onClick={closeModal}>
              <span className="close-button" onClick={closeModal}>×</span>
              <img src={selectedImage} alt="Selected" className="modal-image" />
            </div>
          )}





          {/* 포토 리스트  */}
          {activeSection === 'photo' && (
            <div className="user-content-container5">
              <div className="review-section">


                <h2> <i class="bi bi-chevron-left" onClick={() => setActiveSection('review')}></i> 포토 리뷰</h2>
                <div className="photo-review3">
                  {uniquePhotos.map((url, index) => (
                    <div key={index} className="photo-item">
                      <img
                        src={url}
                        alt="Review Photo"
                        onClick={() => openModal(url)} // 클릭 시 모달 열기
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}

                </div>

              </div>
            </div>
          )}



        </div>
      </div>
    </div>
  );
}

//페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserStoreDetail />
);