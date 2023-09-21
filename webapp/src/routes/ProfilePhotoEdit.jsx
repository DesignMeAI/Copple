import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ProfilePhotoEdit.module.css";
import { useProfile } from "../context/ProfileContext";
import { useRecoilState, useRecoilValue } from "recoil";
import { infoState, nameState } from "../atoms";

function ProfilePhotoEdit() {
  const { profileImage, setProfileImage } = useProfile();
  const info = useRecoilValue(infoState);
  const name = useRecoilValue(nameState);
  const fileInput = useRef(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserProfile() {
      console.log(name, info);
      try {
        const tokenstring = document.cookie;
        const token = tokenstring.split("=")[1];
        const response = await fetch("http://3.39.153.9:3000/account/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: {
            user_name: name,
            user_id: info[0],
          },
        });
        if (response.ok) {
          const data = await response.json();
          setId(data.user_id);
          setUsername(data.user_name);
          setBio(data.introduction || "");
          setImageURL(data.profileImageUrl || "");
        } else {
          console.error("Failed to fetch user information.");
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching user information:",
          error
        );
      }
    }

    fetchUserProfile();
    setImageURL(profileImage);
  }, [profileImage]);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userId");
    navigate("/");
  };

  // 파일 선택창 열기
  const handleFileSelect = () => {
    fileInput.current.click();
  };

  // 이미지 파일이 선택되면 미리보기를 생성
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.onloadend = () => {
        const result = reader.result;
        setImageURL(result);
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    console.log("Removing image...");
    setImageURL(null);
    setImageFile(null); // 추가된 이미지 파일 상태도 초기화 (위에서 추가한 상태 변수)
    fileInput.current.value = null;
  };

  // 프로필 정보를 업데이트하는 함수
  const updateProfileInfo = async () => {
    console.log("Updating profile info...");
    if (!bio) {
      alert("자기소개를 입력해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", id);
    formData.append("user_name", username);
    formData.append("introduction", bio);

    if (imageFile) {
      formData.append("profileImageURL", imageFile);
    } else {
      // 만약 서버가 'null'을 받아서 이미지를 지우는 기능을 지원한다면
      formData.append("profileImageURL", "null"); // 또는 formData.append("profileImage", null);
    }

    // if (imageURL) {
    //     formData.append("profileImage", imageURL);
    // }

    try {
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
      const response = await fetch("http://3.39.153.9:3000/account/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        console.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("An error occurred while updating profile:", error);
    }
  };

  // 프로필 저장 처리
  const handleSaveProfile = async () => {
    if (!bio) {
      alert("자기소개를 입력해 주세요.");
      return;
    }

    try {
      await updateProfileInfo();
      alert("프로필 수정이 완료되었습니다!");
      navigate("/home");
    } catch (error) {
      console.error("An error occurred while saving profile:", error);
    }
  };

  return (
    <div className={styles.profileEditWrap}>
      <div className={styles.profileEdit}>
        <div className={styles.profileheader}>
          <h1>프로필 편집</h1>
          <button
            className={styles.profilecompleteBtn}
            onClick={handleSaveProfile}
          >
            완료
          </button>
        </div>
        <div className={styles.profileImageSection}>
          <div
            className={styles.imageCircle}
            onClick={handleFileSelect}
            style={imageURL ? { backgroundImage: `url(${imageURL})` } : {}}
          >
            {!imageURL && <span>+</span>}
          </div>
          <input
            type="file"
            ref={fileInput}
            style={{ display: "none" }}
            onChange={handleImageChange}
            className={styles.profileinput}
          />
          <div className={styles.imageAction}>
            <button
              className={styles.profilephotoBtn}
              onClick={handleFileSelect}
            >
              사진 선택
            </button>
            <button
              className={styles.profilephotoBtn}
              onClick={handleRemoveImage}
            >
              지우기
            </button>
          </div>
        </div>
        <div className={styles.profileinputBox}>
          <div>
            <h6>ID</h6>
          </div>
          <input
            placeholder="ID"
            value={id}
            readOnly
            className={styles.profileinput}
          />
          <div>
            <h6>USER NAME</h6>
          </div>
          <input
            placeholder="유저 이름"
            value={username}
            readOnly
            className={styles.profileinput}
          />
          <div>
            {" "}
            <h6>BIO</h6>
          </div>
          <textarea
            placeholder="자기소개"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.profiletextarea}
          ></textarea>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePhotoEdit;
