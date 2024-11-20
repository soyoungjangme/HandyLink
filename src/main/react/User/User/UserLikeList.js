import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import './UserLikeList.css';

function UserLikeList(){

    const [myLikeList, setMyLikeList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("전체");

    useEffect(()=>{
        const fetchgetLike = async() => {
            try {
                //찜 리스트 불러오기
                const resp = await axios.get('/userStoreList/getLikeInfo');
                if (resp.status === 200) {
                    const data = resp.data;
                    setMyLikeList(data); // 전체 찜 리스트 설정
                }

            }catch (error){
                console.log("찜리스트 불러오기 중 error ", error);
            }
        };
        fetchgetLike();
    },[]);

    console.log("찜리스트 ", myLikeList);

    // 선택된 카테고리에 따라 리스트 필터링
    const filteredList = selectedCategory === "전체" ? myLikeList : myLikeList.filter(item => item.store_cate === selectedCategory);

    const goToStoreDetail = (id) => {
        window.location.href = `/userStoreDetail.user/${id}`;
    };

    return (
        <div className="favorite-list">
            <div className="category-buttons">
                {/* 첫 번째 줄 - 5개 버튼 */}
                <button className={`category-button ${selectedCategory === "전체" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("전체")}>전체
                </button>
                <button className={`category-button ${selectedCategory === "디저트" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("디저트")}>디저트
                </button>
                <button className={`category-button ${selectedCategory === "공방" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("공방")}>공방
                </button>
                <button className={`category-button ${selectedCategory === "꽃" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("꽃")}>꽃
                </button>
                <button className={`category-button ${selectedCategory === "뷰티" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("뷰티")}>뷰티
                </button>
            </div>
            {/* 두 번째 줄 - 4개 버튼 */}
            <div className="category-buttons second-row">
                <button className={`category-button ${selectedCategory === "패션" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("패션")}>패션
                </button>
                <button className={`category-button ${selectedCategory === "주얼리" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("주얼리")}>주얼리
                </button>
                <button className={`category-button ${selectedCategory === "디지털" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("디지털")}>디지털
                </button>
                <button className={`category-button ${selectedCategory === "반려동물" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("반려동물")}>반려동물
                </button>
            </div>

            <div className="card-list">
                {filteredList.length > 0 ? (
                    <>
                        {filteredList
                            .filter(likeList => likeList.store_status === '활성화') // 활성화된 카드만 필터링
                            .map(likeList => (
                                <div className="likecard activate" key={likeList.store_no}
                                     onClick={() => goToStoreDetail(likeList.store_no)}>
                                    <div className="card">
                                        <p className="category">{likeList.store_cate}</p>
                                        <div className="card-main">
                                            <img src={likeList.store_img_location} alt="store" className="card-image"/>
                                            <div className="card-content">
                                            <h2 className="store">{likeList.store_name}</h2>
                                            <p className="address">{likeList.addr}</p>
                                            <p className="addrdetail">{likeList.addrdetail}</p>
                                            <div className="rating-section">
                                                <span className="rating">★ {likeList.avg_rating ? likeList.avg_rating : "0"}</span>
                                                <span className="reviews">리뷰 {likeList.review_count}개</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    ))}

                    {filteredList
                        .filter(likeList => likeList.store_status !== '활성화') // 비활성화된 카드만 필터링
                        .map(likeList => (
                            <div className="likecard no-activate" key={likeList.store_no}>
                                <div className="card">
                                    <p className="category">{likeList.store_cate}</p>
                                    <div className="card-main">
                                        <img src="../img/logo2.png" alt="store" className="card-image" />
                                        <div className="card-content">
                                            <h2 className="store">{likeList.store_name}</h2>
                                            <p>더이상 운영하지 않습니다.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overlay"></div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>해당 카테고리의 찜 리스트가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<UserLikeList />);

