import './UserQnaRegist.css';
import React from 'react'; //어느 컴포넌트이든 React임포트가 필요합니다.
import ReactDOM from 'react-dom/client'; //root에 리액트 돔방식으로 렌더링시 필요합니다.


function UserQnaRegist() {
  return (

    <div>
      <div className="user-main-container">
        <div className="user-top-nav">
          <div className="user-top-btns">
            <button type="button"> &lt; </button>
            <div className="logo"> HiMade !</div>
            <button type="button"> &gt; </button>
          </div>
        </div>

        <div className="user-main-content">
          <div className="user-qna-container">
            <div className="radio-group">
              <label>
                <input type="radio" name="inquiry-type" value="문의" defaultChecked /> 일반 문의
              </label>
              <label>
                <input type="radio" name="inquiry-type" value="기타" /> 예약 문의
              </label>
            </div>

            <form>
              <div>
                <label htmlFor="subject">제목</label>
                <input type="text" id="subject" name="subject" />
              </div>

              <div>
                <label htmlFor="message">내용</label>
                <textarea id="message" name="message" rows="4"></textarea>
              </div>

              <div className="regist-button-container">
                <button type="submit">등록</button>
                <button type="reset">취소</button>
              </div>
            </form>
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


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserQnaRegist />
);