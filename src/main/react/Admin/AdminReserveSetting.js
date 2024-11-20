import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import './AdminReserveSetting.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { CloudinaryContext, Image, Transformation } from 'cloudinary-react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


function AdminReserveSetting() {





    const [list, setList] = useState(reservationList);

    // const [list, setList] = useState(reservationList);

    // 예시로 storeNo를 상태로 관리할 수 있습니다. 
    // 실제 앱에서는 적절한 방법으로 storeNo를 받아오세요.
    const [storeNo, setStoreNo] = useState(123);  // storeNo는 상태나 props로 관리

    const onDragEnd = async (result) => {
      const { destination, source } = result;
    
      // 드래그가 잘못된 곳에 놓였을 경우 처리
      if (!destination) return;
    
      // 잘못된 index를 방지하기 위해 유효한 index 확인
      if (source.index === destination.index) return;
    
      // list가 undefined가 아닌지 체크 후, 기본값은 빈 배열로 설정
      const items = Array.isArray(list) ? Array.from(list) : [];
    
      const [reorderedItem] = items.splice(source.index, 1); // 원래 위치에서 아이템 제거
      items.splice(destination.index, 0, reorderedItem); // 새 위치에 아이템 추가
    
      // 아이템의 순서 index를 새롭게 업데이트합니다.
      const updatedItems = items.map((item, index) => ({
        ...item,
        orderIndex: index, // 아이템 순서를 갱신
      }));
    
      setList(updatedItems); // 순서 업데이트
    
      try {
        // 순서가 변경된 리스트와 storeNo를 서버에 전송
        const response = await axios.post('/adminReservation/save-order', {
          orderedList: updatedItems,  // 순서 업데이트된 리스트
          storeNo: storeNo,  // storeNo 추가
        });
    
        // 성공 시 처리 (예: 서버 응답 메시지 출력)
        if (response.status === 200) {
          console.log('순서가 성공적으로 저장되었습니다.');
        }
      } catch (error) {
        // 실패 시 처리 (예: 에러 메시지 출력)
        console.error('서버에 데이터를 저장하는데 실패했습니다:', error);
      }
    };
    

const [reservationList, setReservationList] = useState([]);


    


    useEffect(() => {
      const storeId = sessionStorage.getItem('storeId');
      const storeNo = sessionStorage.getItem('storeNo');
      console.log("세션 storeId: ", storeId);
      console.log("세션 storeNo: ", storeNo);
setStoreNo(storeNo);


            axios.post('/adminReservation/getList', {storeNo : storeNo})
                .then(response => {
                    console.log(response.data);
                    setReservationList(response.data);
                })
                .catch(error => {
                    console.log('Error Category', error);
                });
        }, [])

//   const navigate = useNavigate();
//
//    const handleModifyClick = () => {
//        navigate(`/AdminReserveSettingDetailModify?categoryLevel=${value.categoryLevel}`);
//    };

  const handleAddClick = () => {
        window.location.href = '/AdminReserveSettingDetail.admin'; // 페이지 이동
    };


//   const goToAdminPage = (id) => {
//          console.log("hh");
//          const pageName = "AdminReserveSettingDetailModify"; // 전달할 첫 번째 값
//          navigate(`/${pageName}.admin/${id}`); // 두 번째 값으로 id를 포함
//      };
const goToAdminPage = (id) => {
    window.location.href = `/AdminReserveSettingDetailModify.admin/${id}`;
};

const goToAdminPage2 = (id) => {
  window.location.href = `/AdminReserveSettingDetailSlot.admin/${id}`;
};


//    const navigate = useNavigate();
//
//    const handleModifyClick = () => {
//        navigate(`/AdminReserveSettingDetailModify?categoryLevel=${value.categoryLevel}`);
//    };
  return (
    <div>
      <div className="main-content-title"> <div className='header-title'> 상품 관리 </div></div>

      <div className="main-btns">
          <button type="button" className="btn-st" onClick={handleAddClick}>
                  추가하기
              </button>
      </div>

      <div className="main-contents">
      <table className='management-table'>
      <thead>
        <th> No</th>
        <th> 이미지 </th>
        <th> 상품정보 </th>
        <th> 수정 </th>
        <th> 건수 </th>
      </thead>
      <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <tbody
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {reservationList.map((value, index) => (
              <Draggable key={index} draggableId={String(index)} index={index}>
                {(provided) => (
                  <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="reserve-img">
                        <img src={`${value.imageUrl}`} alt="My Image" />
                      </div>
                    </td>
                    <td>
                      <div className="reserve-container">
                        <div className="reserve-content">
                          <div className="reserve-content-title">
                            <div>{value.serviceName}</div>
                            <div>{value.servicePrice?.toLocaleString()} 원 ~</div>
                          </div>
                          <div className="reserve-content-text-box">
                            <div className="reserve-content-text">
                              {value.serviceContent.length > 30
                                ? `${value.serviceContent.slice(0, 50)}...`
                                : value.serviceContent}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button type="button" className="btn-modi" onClick={() => goToAdminPage(value.categoryId)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    </td>
                    <td>
                      <button type="button" className="btn-modi" onClick={() => goToAdminPage2(value.categoryId)}>
                        <i className="bi bi-clock-history"></i>
                      </button>
                    </td>
                  </tr>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </tbody>
        )}
      </Droppable>
    </DragDropContext>
      </table>
      
      </div>


    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AdminReserveSetting />
);