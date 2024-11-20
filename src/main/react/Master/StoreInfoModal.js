import React from 'react';
import './StoreInfoModal.css';

function StoreInfoModal({ isOpen, onClose, store }) {
  console.log(store);
  
  if (!isOpen || !store) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>

        <h2>{store.storeName} 정보</h2>

        <div className="modal-body">
          <div className="info-section">
            <h3>기본 정보</h3>
            <p><strong>가입일:</strong> {new Date(store.storeSignup).toLocaleDateString('ko-KR')}</p>
            <p><strong>업종:</strong> {store.storeCate}</p>
            <p><strong>우편번호:</strong> {store.zipcode}</p>
            <p><strong>주소:</strong> {store.addr} {store.addrdetail}</p>
          </div>

          <div className="info-section">
            <h3>운영 정보</h3>
            <p><strong>영업시간:</strong> {store.storeOpenTime} - {store.storeCloseTime}</p>
            <p><strong>휴무일:</strong>
              {store.dayOffs.filter(day => day.dayOffFixStatus === 'Y').length > 0 || store.dayOffSets.length > 0 ? (
                <>
                  {/* 고정 휴무일 (dayOffs에서 dayOffFixStatus가 'Y'인 값만 표시) */}
                  {store.dayOffs
                    .filter(day => day.dayOffFixStatus === 'Y')
                    .map((day, index, array) => (
                      <span key={`fixed-${index}`}>
                        {day.dayOffDay}{index < array.length - 1 ? ', ' : ''}
                      </span>
                    ))}

                  {/* 기간 휴무일 (dayOffSets의 시작일과 종료일 표시) */}
                  {store.dayOffSets.map((set, index) => (
                    <span key={`set-${index}`}>
                      {`${set.dayOffStart} ~ ${set.dayOffEnd}`}{index < store.dayOffSets.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </>
              ) : (
                <span>정보 없음</span>
              )}
            </p>

            <div><strong>공지사항: </strong>
              {store.storeNotice.filter(notice => notice.status === 'Y' && notice.noticeType === '공지사항').length > 0 ? (
                store.storeNotice
                  .filter(notice => notice.status === 'Y' && notice.noticeType === '공지사항')
                  .map((notice, index) => (
                    <span key={`공지-${index}`}>{notice.noticeContent}{index < store.storeNotice.length - 1 ? ', ' : ''}</span>
                  ))
              ) : (
                <span>공지사항 없음</span>
              )}
            </div>
            <div><strong>소식: </strong>
              {store.storeNotice.filter(notice => notice.status === 'Y' && notice.noticeType === '소식').length > 0 ? (
                store.storeNotice
                  .filter(notice => notice.status === 'Y' && notice.noticeType === '소식')
                  .map((notice, index) => (
                    <span key={`소식-${index}`}>{notice.noticeContent}{index < store.storeNotice.length - 1 ? ', ' : ''}</span>
                  ))
              ) : (
                <span>소식 없음</span>
              )}
            </div>
            <p><strong>계좌번호:</strong> {store.accountBank} {store.accountNumber}</p>
          </div>

          <div className="info-section">
            <h3>추가 정보</h3>
            <p><strong>리뷰평점: </strong> {store.averageRating}</p>
            <p><strong>소개:</strong> {store.storeIntro}</p>
            <p><strong>주차가능여부:</strong> {store.storeParkingYn === 'Y' ? '가능' : '불가능'}</p>
            {store.snsLinks.length > 0 ? (
              store.snsLinks.map((sns, index) => (
                <div key={index}>
                  <p><strong>{sns.snsName}:</strong> <a href={sns.snsLink} target="_blank" rel="noopener noreferrer">{sns.snsLink}</a></p>
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreInfoModal;
