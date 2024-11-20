import ReactDOM from "react-dom/client";
import './UserAccountFind.css';
import React, { useState, useEffect } from "react";

function UserAccountFind() {
    const [formType, setFormType] = useState("userId");
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [phonenum, setPhonenum] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [foundId, setFoundId] = useState(null);
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [message, setMessage] = useState("");

    const clearInputFields = () => {
        setUserId("");
        setUserName("");
        setPhonenum("");
        setNewPassword("");
        setConfirmPassword("");
        setFoundId(null);
        setIsUserVerified(false);
        setMessage("");
    };

    const showIdForm = () => {
        setFormType("userId");
        clearInputFields();
    };

    const showPwForm = () => {
        setFormType("userPw");
        clearInputFields();
    };

    useEffect(() => {
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
            if (input.value) {
                input.classList.add("used");
            } else {
                input.classList.remove("used");
            }

            input.addEventListener("blur", () => {
                if (input.value) {
                    input.classList.add("used");
                } else {
                    input.classList.remove("used");
                }
            });
        });
    }, [userId, userName, phonenum, newPassword, confirmPassword]);

    const handleFindId = async () => {
        if (!userName.trim() || !phonenum.trim()) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        setFoundId(null);
        setMessage("");

        try {
            const response = await fetch(`/user/find-id?userName=${userName}&phonenum=${phonenum}`);
            if (response.ok) {
                const data = await response.text();
                setFoundId(data);
            } else {
                setMessage("사용자 정보를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("Error finding user ID:", error);
        }
    };

    const handleVerifyUser = async () => {
        if (!userId.trim() || !userName.trim() || !phonenum.trim()) {
            alert("모든 필드를 입력해 주세요.");
            return;
        }

        try {
            const response = await fetch("/user/verify-reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, userName, phonenum }),
            });
            const data = await response.json();
            if (data.verified) {
                setIsUserVerified(true);
                setMessage("");
            } else {
                setIsUserVerified(false);
                setMessage(data.message);
            }
        } catch (error) {
            console.error("Error verifying user:", error);
        }
    };

    const handleResetPassword = async () => {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (!newPassword || !confirmPassword) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!passwordPattern.test(newPassword)) {
            alert("비밀번호는 영문+특수문자+숫자 8자리 이상이어야 합니다.");
            return;
        }

        try {
            const response = await fetch("/user/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, newPassword }),
            });
            const data = await response.json();
            if (data.success) {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                clearInputFields();
                setFormType("id");
                window.location.href = '/UserLoginPage.user';
            } else {
                alert(data.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("비밀번호 변경에 실패했습니다.");
        }
    };

    return (
        <div>
            <div className="user-account-find">
                <div className="user-account-find-toggle">
                    <button
                        type="button"
                        id="find-id-btn"
                        onClick={showIdForm}
                        style={{
                            backgroundColor: formType === "userId" ? "#FE8517" : "#E5E5EA",
                            color: formType === "userId" ? "#fff" : "#000",
                        }}
                    >
                        아이디 찾기
                    </button>
                    <button
                        type="button"
                        id="find-pw-btn"
                        onClick={showPwForm}
                        style={{
                            backgroundColor: formType === "userPw" ? "#FE8517" : "#E5E5EA",
                            color: formType === "userPw" ? "#fff" : "#000",
                        }}
                    >
                        비밀번호 찾기
                    </button>
                </div>

                <div className="user-account-msg">
                    {isUserVerified
                        ? '영문+특수문자+숫자 8자리 이상 입력해 주세요.'
                        : '가입 시 기입한 정보로 입력해 주세요.'}
                </div>

                <form id="account-form">
                    {!isUserVerified && (
                        <>
                            {formType === "userPw" && (
                                <div className="form-group" id="id-form-group">
                                    <input
                                        type="text"
                                        id="userId"
                                        placeholder=" "
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="id">아이디</label>
                                    <div className="highlight"></div>
                                    <div className="bar"></div>
                                </div>
                            )}
                            <div className="form-group" id="name-form-group">
                                <input
                                    type="text"
                                    id="userName"
                                    placeholder=" "
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                                <label htmlFor="name">이름</label>
                                <div className="highlight"></div>
                                <div className="bar"></div>
                            </div>
                            <div className="form-group" id="phone-form-group">
                                <input
                                    type="text"
                                    id="phonenum"
                                    placeholder=" "
                                    value={phonenum}
                                    onChange={(e) => setPhonenum(e.target.value)}
                                    required
                                />
                                <label htmlFor="phone-number">연락처</label>
                                <div className="highlight"></div>
                                <div className="bar"></div>
                            </div>

                            <div className="result-message">
                                {foundId ? `찾은 아이디: ${foundId}` : message}
                            </div>

                            <button
                                type="button"
                                className="btn-findaccount"
                                id="btn-findaccount"
                                onClick={formType === "userId" ? handleFindId : handleVerifyUser}
                            >
                                {formType === "userId" ? "아이디 찾기" : "비밀번호 찾기"}
                            </button>
                        </>
                    )}
                </form>

                {isUserVerified && (
                    <form id="reset-password-form">
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder=" "
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="new-password">새 비밀번호</label>
                            <div className="highlight"></div>
                            <div className="bar"></div>
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder=" "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="confirm-password">새 비밀번호 확인</label>
                            <div className="highlight"></div>
                            <div className="bar"></div>
                        </div>
                        <button
                            type="button"
                            className="btn-findaccount"
                            onClick={handleResetPassword}
                        >
                            비밀번호 변경
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserAccountFind/>
);