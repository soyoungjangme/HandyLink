import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './AdminReserveSetting.css';
import './AdminReserveSettingDetail.css';

const AdminReserveSettingDetailModify = () => {





  const [reserveModi, setReserveModi] = useState('');
  const [subItemModi, setSubItemModi] = useState('');
  const [categories, setCategories] = useState([{
    serviceName: '',
    servicePrice: 0,
    isPaid: false,
    isRequired: false,
    subCategoryType: 'SELECT1',
    subCategories: [ {serviceName : '', servicePrice : ''}]
  }]);

  const [reserveAdd, setReserveAdd] = useState({
    serviceName: '',
    servicePrice: 0,
    serviceContent: ''
  });


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
        const { imageUrl,serviceContent,serviceName,servicePrice,serviceStart} = response.data; 
        setImagePreview(imageUrl);
        setName(serviceName);
        setPrice(servicePrice);
        setDescription(serviceContent);
        setServiceStart(serviceStart);
      })
      .catch(error => {
        console.log('Error Category', error);
      });

      axios
      .get(`/adminReservation/getMiddleItem/${cateId}`)
      .then(response => {
        console.log("get"  + JSON.stringify(response.data));
        
        const transformedData = response.data.map(item => ({
          serviceName: item.serviceName, // serviceName -> name
          servicePrice: item.servicePrice, // servicePrice -> price
          isPaid: item.isPaid === 'Y', // isPaid ("Y"/"N") -> true/false
          isRequired: item.isRequired === 'Y', // isRequired ("Y"/"N") -> true/false
          subCategoryType: item.subCategoryType, // subCategoryType -> inputType
          subCategories: item.subCategories.map(sub => ({
            serviceName: sub.serviceName,
            servicePrice: sub.servicePrice
          }))
        }));
        setCategories(transformedData);
      })
      .catch(error => {
        console.log('Error subItemModi', error);
      });
  }, [cateId]);






  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // 이미지 미리보기
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log(previewUrl);
    }
  };


//사진업로드


const [serviceStart, setServiceStart] = useState('');
const [dateNumCase, setDateNumCase] = useState(0);
const [timeNumCase, setTimeNumCase] = useState(0);

// 입력값 변경 처리 함수
const handleServiceStartChange = (e) => {
  setServiceStart(e.target.value);
};

const handleDateNumChange = (e) => {
  setDateNumCase(Number(e.target.value));
};

const handleTimeNumChange = (e) => {
  setTimeNumCase(Number(e.target.value));
};

  // -----------------------------------

  const setName = (name) => {
    setReserveAdd(prev => ({
      ...prev,
      serviceName: name
    }));
  };
  
  const setPrice = (price) => {
    setReserveAdd(prev => ({
      ...prev,
      servicePrice: price
    }));
  };
  
  const setDescription = (description) => {
    setReserveAdd(prev => ({
      ...prev,
      serviceContent: description
    }));
  };
  
//   const isValid = () => {
//     if (
//         !reserveAdd.serviceName || reserveAdd.serviceName.trim() === '' || // reserveAdd.serviceName이 null 또는 빈 문자열인지 확인
//         categories.some(category => {
//             return (
//                 !category.serviceName || category.serviceName.trim() === '' || // category.serviceName이 null 또는 빈 문자열인지 확인
//                 category.subCategories.some(sub => !sub.serviceName || sub.serviceName.trim() === '') // sub.serviceName이 null 또는 빈 문자열인지 확인
//             );
//         })
//     ) {
//         return false; // Invalid if any service name or subcategory name is empty
//     }
//     return true; // Valid
// };

  //--------------------------------------------------


  const handleDelete = () => {
    axios.get(`/adminReservation/setCategoryDel/${cateId}`)
    .then(response => {
      alert('삭제되었습니다.')
      window.location.href = '/AdminReserveSetting.admin'; // 페이지 이동
    }
  )}

  // const isValid2 = () => {
  //   if (reserveAdd.serviceName.trim() === '' || categories.some(category => {
  //     const hasEmptyServiceName = category.serviceName.trim() === '';
  //     const hasEmptySubCategoryName = category.subCategories.some(sub => sub.serviceName.trim() === '');
  //     const isSelectNType = category.subCategoryType === 'SELECTN' && category.subCategories.length < 2;
  //     return hasEmptyServiceName || hasEmptySubCategoryName || isSelectNType;
  //   })) {
  //     return false; // Invalid if any service name or subcategory name is empty or if SELECT_N condition fails
  //   }
  //   return true; // Valid
  // };

  const handleUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'hye123'); // Cloudinary에서 설정한 Upload Preset
  
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dtzx9nu3d/image/upload',
        formData
      );
      console.log('Uploaded Image URL:', response.data.secure_url);
//      alert(`Image uploaded successfully! URL: ${response.data.secure_url}`);
      return response.data.secure_url; // 업로드된 이미지 URL을 반환
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("이미지 업로드에 실패했습니다.");
      return null; // 업로드 실패 시 null 반환
    }
  };

  

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(e.target.files[0]);
    if (file) {
      setSelectedImage(file);
      // 이미지 미리보기
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log(previewUrl);
    }}
  
  

    

  const isValid5 = () => {
    const isServiceNameEmpty = categories.some(category => category.serviceName.trim() === '');

    return !isServiceNameEmpty;
  }

  const isValid = () => {
  
    // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우에만 카테고리 체크
    const hasInvalidCategories = categories.some(category => {
      // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우만 체크
      if (category.subCategoryType === 'SELECTN' || category.subCategoryType === 'SELECT1') {
        return (
          category.serviceName.trim() === '' || // 카테고리 서비스 이름이 비어 있는지 체크
          category.subCategories.some(sub => sub.serviceName.trim() === '') // 서브카테고리 이름이 비어 있는지 체크
        );
      }
      return false; // 'SELECTN' 또는 'SELECT1'이 아닐 경우 유효하지 않다고 고려하지 않음
    });
  
    return !hasInvalidCategories; // 유효하지 않은 카테고리가 없으면 유효함
  };
  
  const isValid2 = () => {
    // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우에만 카테고리 체크
    const hasInvalidCategories = categories.some(category => {
      // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우만 체크
      if (category.subCategoryType === 'SELECTN' || category.subCategoryType === 'SELECT1') {
        const hasEmptySubCategoryName = category.subCategories.some(sub => sub.serviceName.trim() === '');
        const isSelectNType = category.subCategoryType === 'SELECTN' && category.subCategories.length < 2;
        return hasEmptySubCategoryName || isSelectNType; // 비어 있는 서브카테고리 이름 또는 SELECT_N 조건 체크
      }
      return false; // 'SELECTN' 또는 'SELECT1'이 아닐 경우 유효하지 않다고 고려하지 않음
    });
  
    return !hasInvalidCategories; // 유효하지 않은 카테고리가 없으면 유효함
  };
  
   
  const isValid3 = () => {
    // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우에만 카테고리 체크
    const hasInvalidCategories = categories.some(category => {
      // subCategoryType이 'SELECTN' 또는 'SELECT1'인 경우만 체크
      if (category.subCategoryType === 'SELECTN' || category.subCategoryType === 'SELECT1') {
        const hasEmptySubCategoryName = category.subCategories.some(sub => sub.serviceName.trim() === '');
        const isSelectNType = category.subCategoryType === 'SELECT1' && category.subCategories.length < 1;
        return hasEmptySubCategoryName || isSelectNType; // 비어 있는 서브카테고리 이름 또는 SELECT_N 조건 체크
      }
      return false; // 'SELECTN' 또는 'SELECT1'이 아닐 경우 유효하지 않다고 고려하지 않음
    });
  
    return !hasInvalidCategories; // 유효하지 않은 카테고리가 없으면 유효함
  };
  

     
  const isValid4 = () => {
    // isPaid가 true이면서 servicePrice가 0인 경우 유효하지 않음
    const hasInvalidPaidCategories = categories.some(category => {
      // 카테고리의 서브 카테고리 타입이 'SELECTN' 또는 'SELECT1'일 때만 체크
      if (category.subCategoryType === 'NUMBER' || category.subCategoryType === 'TEXT') {
        return category.isPaid && category.servicePrice === 0; // 조건에 맞는지 체크
      }
      return false; // 'SELECTN' 또는 'SELECT1'이 아닐 경우는 무시
    });
  
    return !hasInvalidPaidCategories; // 유효하지 않은 카테고리가 없으면 유효함
  };


  //-------------------------------------------
  const handleComplete = async () => {

    const imageUrl = await handleUpload(); // 이미지 URL을 기다림

  // 업로드 실패 시 기존 이미지 링크 사용
    const finalImageUrl = imageUrl || imagePreview;
   
    if (reserveAdd.serviceName === ''){
      alert("서비스 명을 입력해주세요.")
      return;
    }else if (reserveAdd.servicePrice === 0) {
      alert("서비스 가격을 입력해주세요.")
      return;
    }else if(reserveAdd.serviceContent === ''){
      alert("서비스 설명을 입력해주세요");
      return;
    }

 else if(!isValid5()) {
  alert("모든 서비스 명을 입력해주세요.");
  return;
 }
    else if (!isValid()) {
      alert("모든 소분류명을 입력해주세요."); // Alert message for empty names
      return;
      // return;
    }else if(!isValid2()){
      alert("다중선택은 소분류를 두개이상 입력해주세요");
      return;
    }else if(!isValid3()) {
      alert("소분류 하나 이상 입력해주세요.");
      return;
    }else if(!isValid4()) {
      alert("유료인 경우에는 가격을 입력해주세요!");
      return;
    }
   
    const hasRequiredCategory = categories.some(category => category.isRequired === true);
    if (!hasRequiredCategory) {
      alert("필수 항목이 하나 이상 있어야 합니다.");
      return;
    }


    const transformedCategories = categories.map(category => ({
      ...category,
      isPaid: category.isPaid ? 'Y' : 'N',
      isRequired: category.isRequired ? 'Y' : 'N'
    }));

 
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    console.log("세션 storeId: ", storeId);
    console.log("세션 storeNo: ", storeNo);


    console.log(transformedCategories);
    const requestData = {
      serviceName: reserveAdd.serviceName,
      servicePrice: reserveAdd.servicePrice,
      serviceContent: reserveAdd.serviceContent,
      categories: transformedCategories,
      ServiceStart: serviceStart,
      StoreNo : storeNo,
    };

    console.log(requestData);
    
    // 첫 번째 요청: 메인 카테고리 설정
    axios.post(`/adminReservation/setMainCategoryModi/${cateId}`, requestData, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
   
        console.log('메인 카테고리 설정 성공:', response.data);
        const formData = new FormData();
        formData.append('dataUrl', finalImageUrl); // Cloudinary 이미지 URL을 추가
        formData.append('category_id', response.data);
    
        // 두 번째 요청: 카테고리 이미지 업로드
        return axios.post('/adminReservation/setMainCategoryImg', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    })
    .then(response => {
        console.log('파일 업로드 성공:', response.data);
        console.log('파일 업로드 성공:', response.data);
        alert("서비스 등록이 완료되었습니다.");
        window.location.href = '/AdminReserveSetting.admin'; // 페이지 이동
        
    })
    .catch(error => {
        console.error('에러 발생:', error);
    });
    
  };
//-------------------------------------------------------

// const handleUpload = async () => {
//   if (!selectedImage) return;

//   const formData = new FormData();
//   formData.append('file', selectedImage); // 'image'는 서버에서 기대하는 필드명입니다.
//   formData.append('category_id', 118);
//   console.log(formData);
  
//   try {
//     const response = await axios.post('/adminReservation/setMainCategoryImg', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
 
//   } catch (error) {
//     console.error('파일 업로드 실패:', error);
//   }
// };


//-----------------------------------------------------------------
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const handleAddCategory = () => {
    setCategories(prev => [...prev, {
      serviceName: '',
      servicePrice: 0,
      isPaid: false,
      isRequired: false,
      subCategoryType: '',
      subCategories: [{ name: '', price: 0 }]
    }]);
  };

  const handleRemoveCategory = (index) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeCategory = (index, field, value) => {
    setCategories(prev =>
      prev.map((category, i) =>
        i === index
          ? {
              ...category,
              [field]: value,
              // 'subCategoryType' 변경 시, 'SELECT1' 또는 'SELECTN'일 때 servicePrice를 0으로 초기화
              ...(field === 'subCategoryType' && (value === 'SELECT1' || value === 'SELECTN') && category.servicePrice !== 0
                ? { servicePrice: 0 }  // 초기 설정만 0으로 하고 이후 수정 가능하게 유지
                : {}),
              // 'isPaid' 변경 시, 유료/무료 값에 따라 servicePrice를 0으로 초기화 (서브카테고리 가격 초기화 포함)
              ...(field === 'isPaid' && value !== category.isPaid
                ? { 
                    servicePrice: 0,  // 서비스 가격을 0으로 초기화
                    subCategories: category.subCategories.map(subCategory => ({
                      ...subCategory,
                      servicePrice: 0, // 서브카테고리 가격도 0으로 초기화
                    }))
                } : {}),
            }
          : category
      )
    );
  };
  
  const handleChangeSubCategory = (categoryIndex, subCategoryIndex, field, value) => {
    setCategories(prev =>
      prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              subCategories: category.subCategories.map((sub, i) =>
                i === subCategoryIndex
                  ? {
                      ...sub,
                      // 필드명이 'serviceName' 또는 'servicePrice'일 경우에만 값을 변경
                      ...(field === 'serviceName' || field === 'servicePrice'
                        ? { [field]: value }
                        : {}) // 해당 필드가 아니면 변경하지 않음
                    }
                  : sub
              )
            }
          : category
      )
    );
  };

// subCategory 객체를 { serviceName: '', servicePrice: 0 } 형태로 수정
const handleAddSubCategory = (categoryIndex) => {
  const newSubCategory = { serviceName: '', servicePrice: 0 }; // 오타 수정: servicePirce -> servicePrice
  setCategories(prev => prev.map((category, index) =>
    index === categoryIndex
      ? { ...category, subCategories: [...category.subCategories, newSubCategory] }
      : category
  ));
};

const handleRemoveSubCategory = (categoryIndex, subCategoryIndex) => {
  setCategories(prev => prev.map((category, index) =>
    index === categoryIndex
      ? { ...category, subCategories: category.subCategories.filter((_, i) => i !== subCategoryIndex) }
      : category
  ));
};

// // 필드명이 serviceName 또는 servicePrice일 경우에만 값을 변경하도록 수정
// const handleChangeSubCategory = (categoryIndex, subCategoryIndex, field, value) => {
//   setCategories(prev => prev.map((category, index) =>
//     index === categoryIndex
//       ? {
//         ...category,
//         subCategories: category.subCategories.map((sub, i) =>
//           i === subCategoryIndex ? { ...sub, [field]: value } : sub
//         )
//       }
//       : category
//   ));
// };

const [serviceDate, setServiceDate] = useState(''); // 날짜 상태
const [serviceHour, setServiceHour] = useState(''); // 시간 상태



//  const onDragEnd = (result) => {
//    if (!result.destination) return;
//
//    const reorderedCategories = Array.from(categories);
//    const [removed] = reorderedCategories.splice(result.source.index, 1);
//    reorderedCategories.splice(result.destination.index, 0, removed);
//
//    setCategories(reorderedCategories);
//  };
//
//
//  useEffect(() => {
//    console.log('Category :', categories);
//}, [categories]);


  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(result.source.index, 1);

    // Check if user is moving a non-required item above required items
    if (
    !removed.isRequired &&
    reorderedCategories.slice(0, result.destination.index).some(category => category.isRequired)
    ) {
      alert("필수 항목은 항상 목록의 위쪽에 있어야 합니다.");
      return; // Prevent reordering if the rule is violated
    }

    reorderedCategories.splice(result.destination.index, 0, removed);

    // Validate that all required items are at the top of the reordered list
    const firstNonRequiredIndex = reorderedCategories.findIndex(category => !category.isRequired);
    if (firstNonRequiredIndex !== -1) {
      // Check if any required item appears after a non-required item
      const isValidOrder = reorderedCategories
        .slice(firstNonRequiredIndex)
        .every(category => !category.isRequired);

      if (!isValidOrder) {
        alert("필수 항목은 항상 목록의 위쪽에 있어야 합니다.");
        return;
      }
    }

    setCategories(reorderedCategories);
  };

  useEffect(() => {
    console.log('Category Order:', categories.map(cat => ({ name: cat.name, isRequired: cat.isRequired })));
    console.log('Service Date:', serviceDate);
    console.log('Service Hour:', serviceHour);
  }, [categories, serviceDate, serviceHour]);


  return (
    <div>
      <div className="main-content-title">주문 상품 수정</div>
      <div className="main-btns">
        <button type="button" className="btn-st" onClick={handleComplete}>완료</button>
        <button type="button" className="btn-st" onClick={handleDelete}>삭제</button>
      </div>

      <div className="main-contents">
      <div className="reserve-container22">
      <div className="reserve-img">
      {imagePreview && <img src={imagePreview} alt="미리보기"    style={{ width: '400px', objectFit: 'cover' }}/>}
        
      <div>
      <input type="file" className="btn-st btn-imgChg"  accept="image/*" onChange={handleFileChange} />
      
      
   
    </div>
    {/* <button type="button" className="btn-st btn-imgChg" onClick={handleUpload}>
        사진 변경하기
      </button> */}
        </div>
        <div className="reserve-content">
          <div className="reserve-content-title">
            <div className="reserve-content-title-name">
              <input
                type="text"
                value={reserveAdd.serviceName}
                onChange={(e) => setName(e.target.value)}
                placeholder='서비스 명'
              />
            </div>
            <div className="reserve-content-title-price">
              <input
                type="number"
                value={reserveAdd.servicePrice}
                onChange={(e) => setPrice(e.target.value)}
                placeholder='서비스 가격'
              />
            </div>
          </div>
          <div className="reserve-content-text">
            <textarea
              value={reserveAdd.serviceContent}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='서비스 설명'
            />
          </div>
        </div>
      </div>

      <div className="main-btns">
        <button type="button" className="btn-st" onClick={() => { handleAddCategory();}}>추가하기</button>
      </div>

      <div className="category-contents">
      <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="categories">
    {(provided) => (
      <div className="category-contents" {...provided.droppableProps} ref={provided.innerRef}>
      {categories.map((category, index) => (
        <Draggable key={index} draggableId={`category-${index}`} index={index}>
          {(provided) => (
            <div className="category-container" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <div className="category-container-content">
                <div className="type-input-require">
                <div className="type-paid">
                    <label>
                      <input
                        type="radio"
                        checked={category.isPaid}
                        onChange={() => handleChangeCategory(index, 'isPaid', true)}
                      />
                      유료
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={!category.isPaid}
                        onChange={() => handleChangeCategory(index, 'isPaid', false)}
                      />
                      무료
                    </label>
                  </div>

                  <div className="type-require">
                  <label>
                    <input
                      type="radio"
                      checked={category.isRequired}
                      onChange={() => handleChangeCategory(index, 'isRequired', true)}
                    />
                    필수
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={!category.isRequired}
                      onChange={() => handleChangeCategory(index, 'isRequired', false)}
                    />
                    선택
                  </label>
                </div>

                </div>
                <div className="type-category-sub">
<input
  type="text"
  placeholder="이름"
  value={category.serviceName}
  onChange={(e) => handleChangeCategory(index, 'serviceName', e.target.value)}
/>
<input
  type="number"
  placeholder="가격"
  value={category.isPaid ? category.servicePrice : 0} // isPaid가 false일 경우 가격을 0으로 설정
  onChange={(e) => handleChangeCategory(index, 'servicePrice', category.isPaid ? Number(e.target.value) : 0)}
  disabled={!category.isPaid || category.subCategoryType === 'SELECT1' || category.subCategoryType === 'SELECTN'}
  
/>


</div>


                <div className="type-input-type">
                  <input
                    type="checkbox"
                    checked={category.subCategoryType === 'SELECT1'}
                    onChange={() => handleChangeCategory(index, 'subCategoryType', 'SELECT1')}
                  /> 선택 (하나)
                  <input
                    type="checkbox"
                    checked={category.subCategoryType === 'SELECTN'}
                    onChange={() => handleChangeCategory(index, 'subCategoryType', 'SELECTN')}
                  /> 선택 (다중)
                  <input
                    type="checkbox"
                    checked={category.subCategoryType === 'NUMBER'}
                    onChange={() => handleChangeCategory(index, 'subCategoryType', 'NUMBER')}
                  /> 숫자
                  <input
                    type="checkbox"
                    checked={category.subCategoryType === 'TEXT'}
                    onChange={() => handleChangeCategory(index, 'subCategoryType', 'TEXT')}
                  /> 텍스트
                </div>

                {category.subCategoryType !== 'NUMBER' && category.subCategoryType !== 'TEXT' && (
  <div className="category-sub-sub">
    {category.subCategories.map((subCategory, subIndex) => (
      <div key={subIndex} className="type-category-sub-sub">
        <input
          type="text"
          placeholder="서브카테고리 이름"
          value={subCategory.serviceName}
          onChange={(e) => handleChangeSubCategory(index, subIndex, 'serviceName', e.target.value)}
        />
        <input
          type="number"
          placeholder="서브카테고리 가격"
          value={category.isPaid ? subCategory.servicePrice : 0} // isPaid가 false일 경우 가격을 0으로 설정
          onChange={(e) => handleChangeSubCategory(index, subIndex, 'servicePrice', Number(e.target.value))}
          disabled={!category.isPaid} // isPaid가 false일 경우 비활성화
        />
        <button type="button" className="btn-sub-del" onClick={() => handleRemoveSubCategory(index, subIndex)}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    ))}
    <button type="button" className="btn-sub-add" onClick={() => handleAddSubCategory(index)}> + </button>
  </div>
)}

              
              </div>
              <button type="button" className="btn-del" onClick={() => handleRemoveCategory(index)}>
                  <i className="bi bi-x-lg"></i>
                </button>
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>

      
    )}
  </Droppable>
</DragDropContext>

    </div>
      </div>
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminReserveSettingDetailModify />);
