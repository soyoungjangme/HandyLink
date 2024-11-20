
import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.
import './UserQnaList.css'; //css파일 임포트



function UserQnaList() { // 함수 선언에서 괄호 추가
  return (
    <div>
      <div className="user-main-container"> {/* class 대신 className 사용 */}
        <div className="user-top-nav">
          <div className="user-top-btns">
            <button type="button"> &lt; </button>
            <div className="logo"> HiMade !</div> {/* <logo> 대신 <div> 사용 */}
            <button type="button"> &gt; </button>
          </div>
        </div>

        <div className="user-main-content">
          <div className="user-qna-container">
            <div className="button-container">
              <button type="button">1:1 문의</button>
              <button type="button">FAQ</button>
            </div>

            <div className="button-mid-container">
              <button type="button" className="qna-btn"> 문의하기 </button>
            </div>

            <div className="qna-table-container">
              <h2> 내 문의 내역</h2>
              <hr />
              <table id="reservationTable">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 예시 데이터, 실제 데이터로 변경할 수 있음 */}
                  <tr>
                    <td> 1 </td>
                    <td> 안녕하세요 </td>
                    <td> user </td>
                  </tr>
                  {/* 추가 데이터... */}
                </tbody>
              </table>
            </div>

            <div className="faq-section">
              <h2>FAQ</h2>
              <hr />
              <div className="faq-item">
                <details>
                  <summary>이용문의</summary>
                  <p>FAQ 내용 1</p>
                </details>
              </div>
              <div className="faq-item">
                <details>
                  <summary>충전문의</summary>
                  <p>FAQ 내용 2</p>
                </details>
              </div>
              <div className="faq-item">
                <details>
                  <summary>결제문의</summary>
                  <p>FAQ 내용 3</p>
                </details>
              </div>
            </div>
          </div>

          <div className="user-bottom-nav">
            <a href="#"><span>메인</span></a>
            <a href="#"><span>검색</span></a>
            <a href="#"><span>예약</span></a>
            <a href="#"><span>문의</span></a>
            <a href="#"><span>MY</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}

//페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserQnaList />
);



