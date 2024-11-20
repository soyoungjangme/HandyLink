import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './MyStore.css';

function MyStore() {
    // 세션 스토리지에서 storeId 가져오기
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    console.log("세션 storeId: ", storeId);
    console.log("세션 storeNo: ", storeNo);

    const [myStoreInfo, setMyStoreInfo] = useState({
        storeId: storeId,
        storeNo: storeNo,
        storeIntro: '',
        storeOpenTime: '',
        storeCloseTime: '',
        storeParkingYn: '',
        deliveryType: '',
        accountBank: '',
        accountNumber: '',
        storeStatus: '',
        storeSns: [{ snsLink: '', snsName: ''}],
        storeImg:[{storeImgLocation: ''}]
    });

    const [initialMyStore, setInitialMyStore] = useState(myStoreInfo);

    const convertUrlsToFiles = async (imageUrls) => {
        const files = await Promise.all(
            imageUrls.map(async (url, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], `image${index}.jpg`, { type: blob.type });
                return file;
            })
        );
        return files;
    };
    

    //해당가게정보가져오기
    useEffect(() => {
        const fetchMyStoreInfo = async () => {
            try {
                if (storeId && storeNo) {
                    const resp = await axios.get(`/adminStore/myStoreInfo?storeNo=${storeNo}`);
                    console.log("불러온 데이터 이거 ", resp.data);

                    const formattedOpenTime = new Date(`1970-01-01T${resp.data.storeOpenTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const formattedCloseTime = new Date(`1970-01-01T${resp.data.storeCloseTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

               // URL 배열을 { previewUrl: <URL> } 형식의 객체 배열로 변환
const storeImg = Array.isArray(resp.data.storeImg)
? resp.data.storeImg
    .filter(img => img.storeImgLocation !== null) // null이 아닌 URL만 필터링
    .map(img => ({ previewUrl: img.storeImgLocation })) // 객체로 변환
: [];

// 변환된 객체 배열을 newImages에 설정
setNewImages(storeImg);
                  

                    const storeSns = Array.isArray(resp.data.storeSns)
                    ? resp.data.storeSns
                        .filter(sns => sns.snsLink !== null) // storeImgLocation이 null이 아닌 것만 필터링
                        .map(sns => ({ snsLink: sns.snsLink, snsName: sns.snsName }))
                    : [];

                    setMyStoreInfo(prevInfo => ({
                        ...prevInfo,
                        ...resp.data,
                        storeOpenTime: formattedOpenTime,
                        storeCloseTime: formattedCloseTime,
                        storeSns: storeSns,
                        storeImg: storeImg
                    }));

                    
                } else {
                    console.log("세션에 아이디정보가 없습니다.");
                }
            } catch (error) {
                console.log("가게목록 부르는 중 error ", error);
            }
        }
        fetchMyStoreInfo();
    }, []);
    const [isDisabled, setIsDisabled] = useState(true);


    const handleChangeInfo = (e) => {
        const { id, value } = e.target;
        setMyStoreInfo(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleChangeInform = (e) => {
        const { name, value } = e.target;
        setMyStoreInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleChangeSns = (index, field, value) => {
        const updatedSns = [...myStoreInfo.storeSns];
        updatedSns[index][field] = value;

        setMyStoreInfo(prevState => ({
            ...prevState,
            storeSns: updatedSns
        }));
    };

    const handleFixSns = (index) => {
        const fixSns = [...myStoreInfo.storeSns];
        const snsLink = fixSns[index].snsLink.toLowerCase();

        // 링크 유효성 검사
        if (snsLink.includes('instagram')) {
            fixSns[index].snsName = '인스타그램';
        } else if (snsLink.includes('facebook')) {
            fixSns[index].snsName = '페이스북';
        } else if (snsLink.includes('youtube')) {
            fixSns[index].snsName = '유튜브';
        } else if (snsLink.includes('naver')) {
            fixSns[index].snsName = '네이버';
        } else {
            alert('등록이 불가능한 SNS입니다.');
            return; // 유효하지 않으면 저장 중단
        }

        fixSns[index].isDisabled = !fixSns[index].isDisabled;
        setMyStoreInfo(prevState => ({
            ...prevState,
            storeSns: fixSns
        }));
    };

    const handleDeleteSns = (index) => {
        const updatedSns = myStoreInfo.storeSns.filter((_, idx) => idx !== index);
        setMyStoreInfo(prevState => ({
            ...prevState,
            storeSns: updatedSns
        }));
    };

    //영업시간 30분 단위로 입력
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                times.push(time);
            }
        }
        return times;
    };

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    const handleUpload = async () => {
        if (!newImages || newImages.length === 0) return []; // 파일이 없으면 빈 배열 반환
    
        const uploadedUrls = []; // 업로드된 이미지 URL을 저장할 배열
    
        for (let i = 0; i < newImages.length; i++) {
            const image = newImages[i];
    
            // file 속성이 없는 경우 (이미 업로드된 URL)라면 해당 URL을 그대로 사용
            if (!image.file && image.previewUrl) {
                uploadedUrls.push(image.previewUrl);
                continue;
            }
    
            // file 속성이 있는 경우 업로드 진행
            const formData = new FormData();
            formData.append('file', image.file); // 파일 추가
            formData.append('upload_preset', 'hye123'); // Cloudinary에서 설정한 Upload Preset
    
            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dtzx9nu3d/image/upload',
                    formData
                );
    
                if (response.data && response.data.secure_url) {
                    uploadedUrls.push(response.data.secure_url);
                }
            } catch (error) {
                console.error('이미지 업로드 오류:', error);
            }
        }
    
        console.log('Uploaded Images:', uploadedUrls);
        return uploadedUrls;
    };
    
    

    //사진업로드

    console.log("myStoreInfo ",myStoreInfo);


    //입력하기
    const handleClickSet = async() => {
        
        if(isDisabled == true){
            setIsDisabled(!isDisabled);
        }
        console.log("수정", isDisabled);


        try {
            if (!isDisabled){
                // 저장되지 않은 SNS를 체크
                const hasUnsavedSns = myStoreInfo.storeSns.some(sns => !sns.isDisabled); // 저장되지 않은 SNS가 있는지 확인
                const hasEmptySnsLink = myStoreInfo.storeSns.some(sns => sns.snsLink === ''); // 링크가 비어있는지 확인

                if (hasUnsavedSns || hasEmptySnsLink) {
                    alert("저장되지 않은 SNS 링크가 있습니다.");
                    return; // 저장되지 않은 SNS가 있을 경우 입력을 막음
                }else if (  myStoreInfo.storeStatus === null ||
                            myStoreInfo.storeParkingYn === null ||
                            myStoreInfo.deliveryType === null ||
                            myStoreInfo.storeOpenTime === null ||
                            myStoreInfo.storeCloseTime === null ||
                            myStoreInfo.storeIntro === null
                ) {
                    alert('기본 정보 입력을 완료해 주세요.');
                    return;
                }

                // const updatedImgs = [
                //     ...myStoreInfo.storeImg.map(img => ({
                //         storeId: myStoreInfo.storeId,
                //         storeNo: myStoreInfo.storeNo,
                //         storeImgLocation: img.storeImgLocation
                //     })),
                //     ...newImgUrls.map(url =>({
                //         storeId: myStoreInfo.storeId,
                //         storeNo: myStoreInfo.storeNo,
                //         storeImgLocation: url
                //     }))
                // ];

                // if(updatedImgs.length < 1){
                //     alert('이미지는 최소 1장 입력해 주세요.');
                //     return;
                // }

           
                const imageUrls = await handleUpload(); // 이미지 URL 배열을 기다림
                if (imageUrls.length === 0) return; // 업로드 실패 시 함수 종료

                const response = await axios.post('/adminStore/updateStore',{ //update
                    storeId: myStoreInfo.storeId,
                    storeNo: myStoreInfo.storeNo,
                    storeIntro: myStoreInfo.storeIntro,
                    deliveryType: myStoreInfo.deliveryType,
                    storeOpenTime: myStoreInfo.storeOpenTime,
                    storeCloseTime: myStoreInfo.storeCloseTime,
                    storeParkingYn: myStoreInfo.storeParkingYn,
                    accountBank: myStoreInfo.accountBank,
                    accountNumber: myStoreInfo.accountNumber,
                    storeSns: myStoreInfo.storeSns.map(sns => ({
                        storeId: myStoreInfo.storeId,
                        storeNo: myStoreInfo.storeNo,
                        snsLink: sns.snsLink,
                        snsName: sns.snsName
                    })),
                    // storeImg: updatedImgs,
                    storeStatus: myStoreInfo.storeStatus

                    
                });
                    // 이미지 파일을 추가할 FormData


                    const formData = new FormData();
                    formData.append('id', storeNo);
                    
                    // 배열의 각 URL을 개별적으로 추가
                    imageUrls.forEach((url, index) => {
                    formData.append('file', url); // 'file' 필드에 각 이미지를 추가
                    });
                    
                    // FormData의 내용을 확인 (Array.from을 사용하여 배열로 변환)
                    console.log([...formData]);
                    
                    axios.post(`/adminStore/uploadImageToServer`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // 헤더 설정
                    },
                    })
                    .then(response => {
                    console.log('파일 업로드 성공:', response.data);
                    // alert("리뷰 등록이 완료되었습니다.");
                    // window.location.href = '/userMyReservationList.user'; // 페이지 이동;
                    })
                    .catch(error => {
                    console.error('에러 발생:', error);
                    });
                    


                console.log("등록성공 ", response.data);
                alert('가게 정보 수정이 완료되었습니다.');
                setIsDisabled(!isDisabled);
                // window.location.href='/mystore.admin';
            }
        }catch (error){
            console.log("error발생 ", error);
        }
    };


    
    // 이미지 파일 업로드 핸들러
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files); // 선택된 파일들
        const totalImagesCount = files.length + newImages.length;

        // 이미지 개수 제한: 최대 8개
        if (totalImagesCount > 8) {
            alert("이미지는 최대 8개까지 업로드할 수 있습니다.");
            return;
        }

        // 파일을 객체와 URL로 변환하여 newImages 상태에 추가
        const newImagesWithUrl = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        // 상태 업데이트: 새 이미지 객체 추가
        setNewImages((prev) => [...prev, ...newImagesWithUrl]);

        console.log("newImages:", newImagesWithUrl);
    };

    // 이미지 삭제 핸들러
    const handleImageDelete = (index) => {
        // 선택된 이미지 삭제 (URL과 파일 둘 다 삭제)
        setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
      
    useEffect(()=> {
        console.log(newImages, images);
    },[newImages, images])

    const handleClickUnSubscribe = async() => {
        const isConfirmed = confirm('탈퇴하시겠습니까?');  // 사용자가 "확인"을 클릭했는지 확인

        if (isConfirmed) {  // "확인" 클릭 시에만 상태 변경
            try {
                const resp = await axios.post(`/adminStore/updateUnSubcribe?storeNo=${storeNo}`);
                const unSubscribe = resp.data;
                if(unSubscribe > 0){
                    alert('탈퇴되었습니다.');
                    window.location.href='/adminlogin.login';
                }else{
                    alert('탈퇴 처리에 실패하였습니다.');
                }
            }catch (error){
                alert('탈퇴 요청 중 오류 발생');
                console.log("탈퇴 처리 중 error ", error);
            }
        }
    };



    return (
    <div className="admin-store-info-container">
           <div className="main-content-title"> <div className='header-title'> 가게 관리 </div></div>

        <div className="btn-box">
        {isDisabled && (
            <button type="button" className="modify-btn" onClick={handleClickSet}>
                수정하기
            </button>
        )}

        </div>

        {/* 기본 정보 섹션 */}
        <div className="section-container">
            <div className="section-title">
            <h2>기본 정보</h2>
            <span className="small-text">*필수</span>
            </div>
            <div className="section-content">
            {/*<div className="form-group">
                    <label htmlFor="storeStatus">공개 여부</label>
                    <div className="radio-group public-yn">
                        <label htmlFor="storeStatusY">
                            <input type="radio" name="storeStatus" id="storeStatusY" value="활성화" checked={myStoreInfo.storeStatus === '활성화'} onChange={handleChangeInform} disabled={isDisabled} /> 공개
                        </label>
                        <label htmlFor="storeStatusN">
                            <input type="radio" name="storeStatus" id="storeStatusN" value="비활성화" checked={myStoreInfo.storeStatus === '비활성화'} onChange={handleChangeInform} disabled={isDisabled} /> 비공개
                        </label>
                    </div>
                </div>*/}

                <div className="form-group">
                    <label htmlFor="delivery">배송 여부</label>
                    <div className="delivery">
                        <label htmlFor="deliveryY"><input type="radio" name="deliveryType" value="배송" checked={myStoreInfo.deliveryType === '배송'} onChange={handleChangeInform} disabled={isDisabled} /> 배송</label>
                        <label htmlFor="deliveryPick"><input type="radio" name="deliveryType" value="픽업" checked={myStoreInfo.deliveryType === '픽업'} onChange={handleChangeInform} disabled={isDisabled} /> 픽업</label>
                        <label htmlFor="deliveryAll"><input type="radio" name="deliveryType" value="배송+픽업" checked={myStoreInfo.deliveryType === '배송+픽업'} onChange={handleChangeInform} disabled={isDisabled} /> 배송 + 픽업</label>
                    </div>
                </div>


                <div className="form-group">
                    <label htmlFor="parking">주차 여부</label>
                    <div className="parking-yn">
                        <label htmlFor="parkingY"><input type="radio" name="storeParkingYn" id="parkingY" value="Y" checked={myStoreInfo.storeParkingYn === 'Y'} onChange={handleChangeInform} disabled={isDisabled} /> 주차 가능</label>
                        <label htmlFor="parkingN"><input type="radio" name="storeParkingYn" id="parkingN" value="N" checked={myStoreInfo.storeParkingYn === 'N'} onChange={handleChangeInform} disabled={isDisabled} /> 주차 불가</label>
                    </div>
                </div>

<div className="form-group">
<label htmlFor="storeIntro">소개</label>
<div className="input-field" >
<textarea rows="4" id="storeIntro"  value={myStoreInfo.storeIntro} onChange={handleChangeInfo} disabled={isDisabled} />
</div>
</div>

                <div className="form-group">
                    <label htmlFor="storeOpenTime">영업 시작 시간</label>
                    <select id="storeOpenTime" value={myStoreInfo.storeOpenTime} onChange={handleChangeInfo}  disabled={isDisabled} className="time-select">
                        <option value="" disabled>시간 선택</option>
                        {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>

                    <label htmlFor="storeCloseTime">영업 종료 시간</label>
                    <select id="storeCloseTime" value={myStoreInfo.storeCloseTime} onChange={handleChangeInfo} disabled={isDisabled} className="time-select">
                        <option value="" disabled>시간 선택</option>
                        {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>




            </div>
        </div>

        {/* SNS 관리 섹션 */}
        <div className="section-container">
            <div  className="sns-btn">
            <h2>SNS 관리</h2>
            {myStoreInfo.storeSns.length < 3 && !isDisabled && (
                    <button type="button" onClick={() => setMyStoreInfo(prevState => ({
                            ...prevState,
                            storeSns: [...prevState.storeSns, { snsLink: ''}]
                        }))}
                       >
                        SNS 링크 추가
                    </button>
                )}
            </div>
           
            <div className="sns-content sns-management">
             
                {myStoreInfo.storeSns.map((sns, index) => (
                    (sns.snsLink || !isDisabled) ? ( //링크가 잇거나 수정상태
                        <div key={index} className="sns-row">
                            <label>SNS {index + 1}</label>

                            {(sns.isDisabled || isDisabled) ? ( //링크저장상태거나 수정완료상태
                                <div className="sns-fix" >
                                    {sns.snsLink}
                                </div>
                            ) : (
                                <input
                                type="text"
                                className="snsLink"
                                placeholder={`SNS ${index + 1} 링크를 입력하세요`}
                                value={sns.snsLink}
                                onChange={(e) => handleChangeSns(index, 'snsLink', e.target.value)}
                                disabled={sns.isDisabled}
                                />
                            )}
                            {!isDisabled &&  index > -1 && (
                                <>
                                    <button className='modify-btn' type="button" onClick={() => handleFixSns(index)}>
                                        {sns.isDisabled ? '수정':'저장'}
                                    </button>
                                    <button type="button" className="snsDelete-btn" onClick={() => handleDeleteSns(index)}>
                                        <i class="bi bi-x-square-fill"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : null
                ))}
            </div>
        </div>

        {/* 계좌 관리 섹션 */}
        <div className="section-container">
            <h2>계좌 관리</h2>
            <div className="account-content">
                <div className="form-group">
                    <label htmlFor="account">계좌번호</label>
                    <div className="account-info">
                        <select className="account-bank" name="accountBank" value={myStoreInfo.accountBank} onChange={handleChangeInform} disabled={isDisabled}>
                            <option value="">은행 선택</option>
                            <option value="농협">농협</option>
                            <option value="국민">국민</option>
                            <option value="하나">하나</option>
                            <option value="우리">우리</option>
                            <option value="카카오뱅크">카카오뱅크</option>
                        </select>
                        <input type="text" id="accountNumber" name="accountNumber" placeholder="- 제외하고 입력하세요." value={myStoreInfo.accountNumber} onChange={handleChangeInform} style={{ width: '70%' }} disabled={isDisabled} />
                    </div>
                </div>
            </div>
        </div>



        <div className="section-container">
            <div className="section-title">
                <h2>사진 관리</h2>
                <span className="small-text">* 필수 (최대 8장)</span>
            </div>
            {/* <label htmlFor="file-upload" className="custom-file-upload">
                파일 업로드
            </label> */}
            <div className="media-section">
         {/* + 버튼을 4개 이하일 때만 보이도록 조건 추가 */}
    
            {newImages.length < 8 && !isDisabled && (
                <div
                className="camera-placeholder"
                onClick={() => document.getElementById('file-input').click()}
                >
                <p className="camera-icon">+</p>
                <input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
                </div>
            )}
            {newImages.map((image, index) => (
                <div key={index} style={{ position: 'relative', margin: '10px' }}>
                <img
                    src={image.previewUrl} alt={`preview-${index}`} 
                    style={{ width: '100px', height: '100px' }}
                />
                {/* 삭제 버튼 */}
                { !isDisabled && (
                <button
                    onClick={() => handleImageDelete(index)}
            className='btn-del2'
                >
                    X
                </button>
                 )}
                </div>
            ))}
  
 
</div>

            {/* <div className="photo-grid">
   
                {myStoreInfo.storeImg.length > 0 && myStoreInfo.storeImg.map((imgurl, index) => (
                    <div key={imgurl.storeImgLocation} className="photo-item">
                        <img src={imgurl.storeImgLocation} alt={`DB 이미지 ${index + 1}`} />
                        {!isDisabled && (
                            <i className="bi bi-x-circle-fill" onClick={() => handleImageDelete(imgurl.storeImgLocation, true)}></i>
                        )}
                    </div>
                ))} 

                {!isDisabled && selectedImages.length > 0 && selectedImages.map((url, index) => (
                    <div key={url} className="photo-item">
                        <img src={url} alt={`첨부파일 ${index + 1}`} />
                            <i className="bi bi-x-circle-fill" onClick={() => handleImageDelete(index)}></i>
                    </div>
                ))}
            </div> */}
        </div> 



        <div className="btn-box">
            {!isDisabled ? (
                <>
                    <button type="button" className="cancel-btn" onClick={() => window.location.href = '/mystore.admin'}>
                        취소
                    </button>
                    <button type="button" className="modify-btn" onClick={handleClickSet}>
                        수정완료
                    </button>
                </>
            ):(
                <button type="button" className="unsubscribe-btn" onClick={handleClickUnSubscribe}>
                    탈퇴하기
                </button>
            )}
        </div>
    </div>
);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MyStore />);
