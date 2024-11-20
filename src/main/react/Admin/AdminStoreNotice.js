import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './AdminStoreNotice.css';
import { useNavigate } from 'react-router-dom';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { CloudinaryContext, Image, Transformation } from 'cloudinary-react';

function AdminStoreNotice() {


  const [noticeList, setNoticeList] = useState([]);
  const [status, setStatus] = useState();
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredList, setFilteredList] = useState(noticeList);
  const [activeFilter, setActiveFilter] = useState(null);
  const [visibilityFilter, setVisibilityFilter] = useState(null);



  useEffect(() => {
    const storeId = sessionStorage.getItem('storeId');
    const storeNo = sessionStorage.getItem('storeNo');
    console.log("세션 storeId: ", storeId);
    console.log("세션 storeNo: ", storeNo);

    console.log(storeNo);
    axios.post('/adminStore/getNoticeList',
      { storeNo: parseInt(storeNo) }
    )
      .then(response => {
        setNoticeList(response.data); // 기본값으로 빈 배열 설정
      })
      .catch(error => {
        console.log('Error Category', error);
      });
  }, [])



  const handleStatus = (e, id) => {
    console.log(id, e);
    if (e === 'D') {
      confirm("소식을 숨기시겠습니까?");
    } else if (e === 'Y') {
      confirm("소식을 보이게하시겠습니까?");
    } else if (e === 'N') {
      confirm("소식을 삭제하시겠습니까?");
    }

    axios.post('/adminStore/setNoticeStatus', { status: e, noticeNo: id })
      .then(response => {
        console.log(response.data);
        // setNoticeList(response.data);
        axios.get('/adminStore/getNoticeList')
          .then(response => {

            console.log(response.data);
            setNoticeList(response.data);

          })
      })
      .catch(error => {
        console.log('Error Category', error);
      });
  }


  const noticeModi = (id) => {
    window.location.href = `/AdminStoreNoticeModi.admin/${id}`; // 페이지 이동
  }


  // 가게 소식 추가하기 
  const handleAddClick = () => {
    window.location.href = `/AdminStoreNoticeRegist.admin`; // 페이지 이동
  };


  //  const goToAdminPage2 = (id) => {
  //    window.location.href = `/AdminReserveSettingDetailSlot.admin/${id}`;
  //  };


  const [showAllContent, setShowAllContent] = useState(false);

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





  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };


  // -------------------- 필터 부분 --------------------

  // 필터를 적용하고 정렬된 목록을 반환
  const getSortedFilteredList = () => {
    const listToSort = applyFilters(); // 현재 필터가 적용된 목록 가져오기

    // 정렬하기
    const sortedList = [...listToSort].sort((a, b) => {
      const valueA = new Date(a.noticeRegdate);
      const valueB = new Date(b.noticeRegdate);
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return sortedList;
  };

  // 등록일 정렬
  const handleDateSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);

    // 정렬된 목록 업데이트
    setFilteredList(getSortedFilteredList());
  };

  // 소식, 카테고리 필터
  const handleFilter = (category) => {
    setActiveFilter(category);
    setFilteredList(getSortedFilteredList()); // 필터 후 정렬된 목록으로 업데이트
  };

  const handleVisibilityFilter = (status) => {
    setVisibilityFilter(status);
    setFilteredList(getSortedFilteredList()); // 필터 후 정렬된 목록으로 업데이트
  };

  // 필터 적용
  const applyFilters = () => {
    let filtered = noticeList;

    // 소식/공지사항 필터 적용
    if (activeFilter) {
      filtered = filtered.filter(notice => notice.noticeType === activeFilter);
    }
    // 보이기/숨기기 필터 적용
    if (visibilityFilter) {
      filtered = filtered.filter(notice => notice.status === visibilityFilter);
    }

    return filtered;
  };

  // 필터 초기화
  const resetFilter = () => {
    setFilteredList(noticeList);
    setActiveFilter(null);
    setVisibilityFilter(null);
    setSortOrder('asc');
  };



  // ---------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
// const itemsPerPage = 10; // 한 페이지에 표시할 아이템 수
  const [itemsPerPage , setItemsPerPage] = useState(20);


const paginatedData = getSortedFilteredList().slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const handleItemsPerPageChange = (newItemsPerPage) => {
  setItemsPerPage(newItemsPerPage);
  setCurrentPage(1);  // 페이지 번호를 1로 리셋
};


const totalPages = Math.ceil(getSortedFilteredList().length / itemsPerPage);

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
  
};

// --------------------------------------------

const cld = new Cloudinary({ cloud: { cloudName: 'dtzx9nu3d' } });
  
// Use this sample image or upload your own via the Media Explorer
const img = cld
      .image('cld-sample-5')
      .format('auto') // Optimize delivery by resizing and applying auto-format and auto-quality
      .quality('auto')
      .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio



    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleUpload = async () => {
      if (!file) return;
  
      // FormData를 사용하여 이미지 파일을 Cloudinary로 전송
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hye123');  // Cloudinary에서 설정한 Upload Preset
  
      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dtzx9nu3d/image/upload',
          formData
        );
        console.log('Uploaded Image URL: ', response.data.secure_url);
        alert(`Image uploaded successfully! URL: ${response.data.secure_url}`);
      } catch (error) {
        console.error('Error uploading image: ', error);
      }
    };
  
  return (
    <div>
      {/* ------------------------------------------------ */}
      <div className="main-content-title"> <div className='header-title'> 가게 소식 </div>
        <button type="button" className="btn-st" onClick={handleAddClick}>
          추가하기
        </button></div>

      <div className="main-btns">

      </div>


      <div className="main-contents">

        <div className="store-notice-top">
          <div className="filter-btn-box">
            <button onClick={resetFilter}><i class="bi bi-arrow-clockwise"></i></button>
            <button className={activeFilter === '소식' ? 'active' : ''} onClick={() => handleFilter('소식')}>소식</button>
            <button className={activeFilter === '공지사항' ? 'active' : ''} onClick={() => handleFilter('공지사항')}>공지사항</button>
          </div>

          {/* 
          <div className="search-bar-box">
            <input type='text' placeholder='검색할 내용을 입력해주세요' />
            <button> <i className="bi bi-search"></i> </button>
          </div> 
          */}


                                <div className="select-filter-box">
            <button onClick={() => handleVisibilityFilter('Y')} className={visibilityFilter === 'Y' ? 'active' : ''}>보이기</button>
            <button onClick={() => handleVisibilityFilter('D')} className={visibilityFilter === 'D' ? 'active' : ''}>숨기기</button>
          </div>


        </div>

        <div className='store-notice-top'>
         <div className='totalpage'> {paginatedData.length} 건 ( 총 {noticeList.length} 건)</div>
          <div className="dropdown-menu">
                                    <select onChange={(e) => handleItemsPerPageChange(e.target.value)} value={itemsPerPage}>
                                        <option value="20" >20개씩 보기</option>
                                        <option value="50">50개씩 보기</option>
                                        <option value="100">100개씩 보기</option>
                                    </select>
                                </div>
          </div>

        <div className="management-container">
       
  <table className="management-table">
  
    <thead>
      <tr>
        <th><input type="checkbox" /></th>
        <th>카테고리</th>
        <th>소식내용</th>
        <th>등록일<span onClick={handleDateSort}><i className="bi bi-chevron-expand"></i></span></th>
        <th>상태변경</th>
        <th>수정</th>
      </tr>
    </thead>
    <tbody>
      {paginatedData.map((value, index) => (
        <React.Fragment key={index}>
          <tr onDoubleClick={() => goToDetail(value.reservationNo)}>
            <td><input type="checkbox" /></td>
            <td>{value.noticeType}</td>
            <td onClick={() => handleToggleRow(index)}>
              {value.noticeContent.slice(0, 50)}
              <i className="bi bi-chevron-down" onClick={() => handleToggleRow(index)}></i>
            </td>
            <td>{formatDate(value.noticeRegdate)} {value.modi === 'Y' ? '(수정됨)' : ''}</td>
            <td>
              <select className='select-btn' value={value.status} onChange={(e) => handleStatus(e.target.value, value.noticeNo)}>
                <option value='Y'>보이기</option>
                <option value='D'>숨기기</option>
                <option value='N'>삭제</option>
              </select>
            </td>
            <td><button type='button' className="btn-st" onClick={() => noticeModi(value.noticeNo)}>수정</button></td>
          </tr>
          {expandedRows.includes(index) && (
            <tr>
              <td colSpan="6" className="expanded-content">
                <div>
                  <p>{value.noticeContent}</p>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  </table>

  {/* 페이지네이션 버튼 */}
  <div className="pagination">
    <button
      className="page-nav"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      &lt;
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i + 1}
        onClick={() => handlePageChange(i + 1)}
        className={currentPage === i + 1 ? 'active' : ''}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="page-nav"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
       &gt;
    </button>
  </div>
</div>


      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AdminStoreNotice />
);