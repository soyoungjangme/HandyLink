import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import './UserReservationOption.css';
import { json } from 'react-router-dom';


function UserReservationOption() {
  {/*const [combinedInputs, setCombinedInputs] = useState({
    selectedFlavors: [], // 빈 배열로 초기화
    categoryInputs: {} // 빈 객체로 초기화
  }); */}

  const [reserveModi, setReserveModi] = useState('');
  const [categories, setCategories] = useState([{
    categoryId: 0,
    serviceName: '',
    servicePrice: 0,
    isPaid: false,
    isRequired: false,
    subCategoryType: 'SELECT1',
    subCategories: [{ serviceName: '', servicePrice: '' }]
  }]);

  const [cateId, setCateId] = useState(0);

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const categoryId = pathSegments[pathSegments.length - 1];
    setCateId(categoryId);
  }, []);

  useEffect(() => {
    axios
      .get(`/adminReservation/getListDetail/${cateId}`)
      .then(response => {
        console.log(response.data);
        setReserveModi(response.data);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

    axios
      .get(`/adminReservation/getMiddleItem/${cateId}`)
      .then(response => {
        console.log("get" + JSON.stringify(response.data));

        const transformedData = response.data.map(item => ({
          categoryId: item.categoryId,
          serviceName: item.serviceName,
          servicePrice: item.servicePrice,
          isPaid: item.isPaid === 'Y',
          isRequired: item.isRequired === 'Y',
          subCategoryType: item.subCategoryType,
          subCategories: item.subCategories.map(sub => ({
            serviceName: sub.serviceName,
            servicePrice: sub.servicePrice,
            categoryId: sub.categoryId
          }))
        }));
        setCategories(transformedData);
      })
      .catch(error => {
        console.log('Error subItemModi', error);
      });
  }, [cateId]);


  // combinedInputs 상태 정의
  const [combinedInputs, setCombinedInputs] = useState([]); // 배열로 초기화
  const [formData, setFormData] = useState([]);

  // 입력값 변경 처리
  // 입력값 변경 처리
  const handleCategoryInputChange = (index, value, servicePrice, categoryId, isRequired) => {
    setCombinedInputs(prev => {
      const updatedInputs = [...prev];
      updatedInputs[index] = {
        ...updatedInputs[index],

        inputValue: value, // 입력값 업데이트
        servicePrice: servicePrice,// 서비스 가격 업데이트
        categoryId: categoryId,
        isRequired : isRequired
      };
      return updatedInputs;
    });

    setFormData(prev => {
      const updatedFormDatas = [...prev];
      
      updatedFormDatas[index] = {
        ...updatedFormDatas[index],

        mainCategoryId: reserveModi.categoryId,
        middleCategoryId: categoryId,
        subCategoryId: null,
        middleCategoryValue: value
      };
      return updatedFormDatas;
    })


  };
const handleFlavorSelect1 = (subCategory, index, categoryId, isRequired) => {
  setCombinedInputs(prev => {
    const updatedInputs = [...prev];
    const isSelected = updatedInputs[index]?.[index]?.includes(subCategory);

    updatedInputs[index] = {
      ...updatedInputs[index],
      [index]: isSelected ? [] : [subCategory]
    };
    return updatedInputs;
  });

  setFormData(prev => {
    let updatedFormDatas = [...prev];

    // Remove item if it was already selected
    if (updatedFormDatas.some(item => item?.subCategoryId === subCategory.categoryId)) {
      updatedFormDatas = updatedFormDatas.filter(
        item => item?.subCategoryId !== subCategory.categoryId
      );
    } else {
      // Add new item if it wasn’t selected
      updatedFormDatas[index] = {
        mainCategoryId: reserveModi.categoryId,
        middleCategoryId: categoryId,
        subCategoryId: subCategory.categoryId,
        middleCategoryValue: null,
        isRequired
      };
    }
    return updatedFormDatas;
  });
};
const handleFlavorSelectN = (subCategory, index, categoryId, isRequired) => {
  setCombinedInputs(prev => {
    const updatedInputs = [...prev];
    const currentSelection = updatedInputs[index]?.[index] || [];

    updatedInputs[index] = {
      ...updatedInputs[index],
      [index]: currentSelection.includes(subCategory)
        ? currentSelection.filter(item => item !== subCategory)
        : [...currentSelection, subCategory]
    };
    return updatedInputs;
  });

  setFormData(prev => {
    let updatedFormDatas = [...prev];

    const existingIndex = updatedFormDatas.findIndex(
      item => item?.mainCategoryId === reserveModi.categoryId &&
              item?.middleCategoryId === categoryId &&
              item?.subCategoryId === subCategory.categoryId
    );

    if (existingIndex !== -1) {
      // Remove the item if it’s already selected (deselection)
      updatedFormDatas.splice(existingIndex, 1);
    } else {
      // Add new item if it wasn’t already selected
      updatedFormDatas.push({
        mainCategoryId: reserveModi.categoryId,
        middleCategoryId: categoryId,
        subCategoryId: subCategory.categoryId,
        middleCategoryValue: subCategory.value || null,
        isRequired
      });
    }

    return updatedFormDatas;
  });
};






  const checkRequiredCategoriesInFormData = () => {
    // isRequired가 true인 카테고리 찾기
    const requiredCategories = categories.filter(category => category.isRequired);

    // formData에서 각 카테고리 ID를 확인
    return requiredCategories.every(requiredCategory => {
        // formData에서 중간 카테고리 ID가 일치하는지 확인
        return formData.some(data => data.middleCategoryId === requiredCategory.categoryId);
    });
};






  // sessionStorage에서 데이터 가져오기
  const storedData = sessionStorage.getItem('storeInfo');
  const userName = sessionStorage.getItem('userName');
  const userPhonenum = sessionStorage.getItem('userPhonenum');


  // 가져온 데이터를 변환하여 바로 사용
  const storeInfo = storedData ? JSON.parse(storedData) : null; 
  console.log(storeInfo);

  const goToAdminPage = (id) => {
    // 사용 예시
const allRequiredSatisfied = checkRequiredCategoriesInFormData();
if (!allRequiredSatisfied) {
  alert("필수 항목을 선택해 주세요.");
  return;
}  

    sessionStorage.setItem('formData', JSON.stringify(formData));
    sessionStorage.setItem('combinedInputs', JSON.stringify(combinedInputs));
    sessionStorage.setItem('formattedDate', date);
    sessionStorage.setItem('storeNo', storeNo);
    sessionStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    window.location.href = `../UserReservationConfirm.user/${id}`;
  };




  // // 객체를 세션 스토리지에 저장하는 함수
  // const saveToSessionStorage = () => {
  //   // 객체를 JSON 문자열로 변환하여 저장
  //   sessionStorage.setItem('categoryInputs', JSON.stringify(categoryInputs));
  // };

  // useEffect(() => {
  //   saveToSessionStorage(); // 컴포넌트가 렌더링될 때 저장
  //   loadFromSessionStorage(); // 저장된 데이터를 불러옴
  // }, []);


  // 상태 변경 시 콘솔에 출력
  useEffect(() => {
    console.log(categories);
    console.log('Category Inputs:', combinedInputs);
    console.log('formData 입니다 ' + JSON.stringify(formData));
  }, [combinedInputs, categories, formData]);

  //------------------------------------
  const slot = sessionStorage.getItem('selectSlot');
  const date = sessionStorage.getItem('formattedDate');
  const reservationSlotKey = sessionStorage.getItem('reservationSlotKey');
  const storeNo = sessionStorage.getItem('storeNo');

  console.log('Slot:', slot);
  console.log('Date:', date);
  console.log('reservationSlotKey:', reservationSlotKey);

  sessionStorage.setItem('storeNo', storeNo);

    // 뒤로가기 추가
    const handleGoBack = () => {
      window.history.back();
    };


  return (
    <div>
      <div className="user-main-container">
      <div className="search-top">
        <div className='left'>     <i class="bi bi-chevron-left" onClick={handleGoBack}> </i> 옵션 선택 </div>
        <div className='right'></div>
      </div>

        <div className="user-main-content">

          <div className="user-content-container10">
            <div className="user-reserve-menu">
              <div className="user-reserve-menu-img">
                <img src={`${reserveModi.imageUrl}`} alt="My Image" />
              </div>
              <div className="user-reserve-menu-content">
                <div>{reserveModi.serviceName} </div>
                <div>
                  {reserveModi.serviceContent}

                </div>
                <div> {reserveModi.servicePrice} 원 ~</div>

              </div>
            </div>
          </div>

          <div className="user-content-container2">
            <div className="user-reserve-data">
              <div>
                <i className="bi bi-calendar-check-fill"></i> {date}
              </div>
              <div>
                <i className="bi bi-clock-fill"></i> {slot}
              </div>
            </div>
          </div>

          <hr />

          <div className="user-content-container2">
            <div className="user-reserve-title">예약자 정보</div>
            <div className="user-content-container3">
              <div className="sub-container3">
                <div className="bold-text">성함</div>
                <div>{userName}</div>
              </div>

              <div className="sub-container3">
                <div className="bold-text">전화번호</div>
                <div>{userPhonenum}</div>
              </div>
            </div>
          </div>

          <hr />

          <div className="user-content-container6">
            <div className="user-reserve-title2">옵션 선택</div>
          </div>
          {categories.map((category, index) => (
            <div key={index} className="user-content-container2">
              {category.subCategoryType === "TEXT" && (
                <div className="user-content-container3">
                  <div className="sub-title">
                    <div>{category.serviceName}  {category.isPaid === true && ( <span>  (+ {category.servicePrice} )</span>)} </div>

                    {category.isRequired === true  && (
                        <div className="option-title"> *필수</div>
                    )}
                  </div>
                  <div className="sub-container3">
                    <input
                      className="input-text"
                      type="text"
                      value={combinedInputs[index]?.inputValue || ''}  // combinedInputs에서 value 가져오기
                      onChange={(e) => handleCategoryInputChange(index, e.target.value, category.servicePrice, category.categoryId, category.isRequired)}
                    />
                  </div>
                </div>
              )}

              {/* NUMBER 타입일 때 */}
              {category.subCategoryType === "NUMBER" && (
                <div className="user-content-container3">
                  <div className="sub-title">
                    <div>{category.serviceName} 
                      {category.isPaid === true && ( <span>  (+ {category.servicePrice} )</span>)}
                   </div>
                    {category.isRequired === true  && (
                        <div className="option-title"> *필수</div>
                    )}
                  </div>
                  <div className="sub-container4">
                    <input
                      className="input-text2"
                      type="number"
                      value={combinedInputs[index]?.inputValue || ''}  // 통합된 상태에서 값 가져오기
                      onChange={(e) => handleCategoryInputChange(index, e.target.value, category.servicePrice, category.categoryId,  category.isRequired)}
                    />
                  </div>
                </div>
              )}

              {/* SELECT1 혹은 SELECTN 타입일 때 */}
              {(category.subCategoryType === "SELECT1" || category.subCategoryType === "SELECTN") && (
                <div className="user-content-container3">
                  <div className="sub-title">
                    <div>{category.serviceName}</div>
                    {category.isRequired === true  && (
                        <div className="option-title"> *필수</div>
                    )}
                  </div>
                  <div className="sub-container5">
                    {category.subCategories.map((subCategory, subIndex) => (
                      <button
                        key={subIndex}
                        className={`option-btn ${combinedInputs[index]?.[index]?.includes(subCategory) ? 'selected' : ''}`}
                        onClick={() =>
                          category.subCategoryType === "SELECT1"
                            ? handleFlavorSelect1(subCategory, index, category.categoryId,  category.isRequired)
                            : handleFlavorSelectN(subCategory, index, category.categoryId,  category.isRequired)
                        }
                      >
                        {subCategory.serviceName}  {category.isPaid === true && (<div> +{subCategory.servicePrice}</div>)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}


   {/* <hr /> */}
          <div className="user-content-container2">
            {/* <div className="user-content-container3">
              <div>기본 가격 :  {reserveModi.serviceName} (+  {reserveModi.servicePrice} ) </div>
              <div>
              {categories.map((category, index) => (
  <div key={index}>

    {combinedInputs[index] && combinedInputs[index].inputValue && (
      <span>
     
       
      </span>
    )}
    
    <span>
      {combinedInputs[index] && (
        <span>
             <span>{category.serviceName} :  </span>
          {Object.entries(combinedInputs[index]).map(([key, value]) => {
            // 값이 배열인 경우
            if (Array.isArray(value)) {
              return value.map((item, itemIndex) => (
                <span key={itemIndex}>
                  {item.serviceName}  {item.servicePrice > 0 && (
                    <span> (+ {item.servicePrice})</span>
                  )}
                </span>
              ));
            }
            // 값이 문자열인 경우
            else if (typeof value === 'string') {
              return (
                <span key={key}>
                  
                  {value} 

                  <span>
                      {combinedInputs[index]?.servicePrice > 0 && (
                        <span>(+ {combinedInputs[index]?.servicePrice})</span>
                      )}
                    </span>

                </span>
              );
            }
            // 값이 undefined이거나 다른 경우
            return null;
          })}
        </span>
      )}
    </span>
  </div>
))}

              </div>
            </div> */}
          </div>

          <div className="user-content-container6">
            <div className="user-content-last">
              <button type="button" onClick={() => goToAdminPage(cateId)}>
                다음 <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

        </div>
      </div>


    </div>
  )
};

//페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserReservationOption />
);




