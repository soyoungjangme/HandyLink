import React, { useState, useEffect } from 'react';
import './UserMyReview.css';
import ReactDOM from "react-dom/client";
import axios from "axios";

function UserMyReview () {
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedReviewImages, setSelectedReviewImages] = useState([]);
    const [startX, setStartX] = useState(0);


    useEffect(() => {
        axios.get('/userReservation/getMyReviews')
            .then(response => {
                const sortedReviews = response.data.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
                setReviews(sortedReviews);
            })
            .catch(error => {
                console.error("리뷰 데이터를 가져오는 데 오류가 발생했습니다:", error);
            });
    }, []);

    const handleStoreClick = (storeNo) => {
        window.location.href = `/userStoreDetail.user/${storeNo}`;
    };

    const openModal = (images, index) => {
        setSelectedReviewImages(images);
        setSelectedImageIndex(index);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImageIndex(0);
        setSelectedReviewImages([]);
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % selectedReviewImages.length);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prevIndex) =>
            (prevIndex - 1 + selectedReviewImages.length) % selectedReviewImages.length
        );
    };

    const handleMouseDown = (e) => {
        setStartX(e.clientX || e.touches[0].clientX); // 마우스 또는 터치 시작 위치 저장
    };

    const handleMouseUp = (e) => {
        const endX = e.clientX || e.changedTouches[0].clientX; // 마우스 또는 터치 종료 위치
        if (startX - endX > 50) {
            handleNextImage();
        } else if (endX - startX > 50) {
            handlePrevImage();
        }
    };

    return (
        <div>
            <div className="reviews-container">
                <div className="header">
                    {/*<h2>내가 쓴 후기 총 {reviews.length}건</h2>*/}
                </div>

                {reviews.map((review) => (
                    <div key={review.reviewNo} className="review-card">
                        <div className="store-image">
                            {review.storeImg && review.storeImg.length > 0 ? (
                                <img
                                    src={review.storeImg[0].storeImgLocation}
                                    alt="가게 이미지"
                                    className="store-image"
                                />
                            ) : (
                                <p>가게 이미지가 없습니다.</p>
                            )}
                        </div>
                        <div className="review-content">
                            <div className="review-space">
                                <h3 className="store-name"
                                    onClick={() => handleStoreClick(review.storeNo)}>{review.storeName} &gt;</h3>
                                <p className="review-service">{review.serviceName}</p>
                                <p className="review-date">{new Date(review.reviewDate).toLocaleDateString()}</p>
                            </div>
                            <div className="rating">
                            {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                        {i < review.reviewRating ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                            <p className="review-text">{review.reviewContent}</p>
                            <div className="review-images">
                                {review.userReviewImg && review.userReviewImg.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt="리뷰 이미지"
                                        className="review-thumbnail"
                                        onClick={() => openModal(review.userReviewImg, index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {showModal && (
                    <div
                        className="modal"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                        onClick={closeModal}
                    >
                        <span className="close" onClick={closeModal}>&times;</span>
                        <img
                            className="modal-content"
                            src={selectedReviewImages[selectedImageIndex]}
                            alt="원본 리뷰 이미지"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserMyReview/>
);
