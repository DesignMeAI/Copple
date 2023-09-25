import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ProfilePhotoEdit.module.css";
import { useProfile } from '../context/ProfileContext';
import axios from "axios";
import { infoState, nameState } from "../atoms";
import { useRecoilValue } from "recoil";


function ProfilePhotoEdit() {
    const { profileImage, setProfileImage } = useProfile();
    const fileInput = useRef(null);
    const [imageURL, setImageURL] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [id, setId] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const name =  useRecoilValue(nameState);
    const info = useRecoilValue(infoState);
    const navigate = useNavigate();
  
    useEffect(() => {
        async function fetchUserProfile() {
          try {
            const tokenstring = document.cookie;
            const token = tokenstring.split("=")[1];
            await axios({
              method: "POST",
              url: "http://3.39.153.9:3000/account/profile",
              withCredentials: false, // 쿠키를 사용하므로 true로 설정
              headers: {
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${token}`,
              },
              data: {
                user_id: info,
                user_name: name,
              },
            }).then((response) => {
                setId(response.data.user_id);
                setUsername(response.data.user_name);
                setBio(response.data.introduction || '');
                setImageURL(response.data.profileImageUrl || '');
              console.log(response);
            });
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
        localStorage.removeItem('userId');
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userId');
        navigate('/');
    };

    // 파일 선택창 열기
    const handleFileSelect = () => {
        fileInput.current.click();
    };

    // 이미지 파일이 선택되면 미리보기를 생성
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                console.log("File Reader Result: ", result); 
                setImageURL(result);
            
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        } else {
            console.error("No File Selected");
        }
    };

    // 이미지 제거
    const handleRemoveImage = () => {
        console.log("Removing image...");
        setImageURL(null);
        setImageFile(null); 
        fileInput.current.value = null;
    };

    // 프로필 정보를 업데이트하는 함수
    const updateProfileInfo = async () => {
        console.log("Updating profile info...");
        const formData = new FormData();
        formData.append("user_id", id);
        formData.append("user_name", username);
        formData.append("introduction", bio);
        if (imageFile) {
            formData.append("profileImage", imageFile, imageFile.name);
        }

        try {
            const tokenstring = document.cookie;
            const token = tokenstring.split("=")[1];
            const response = await axios({
                method: "PUT",
                url: "http://3.39.153.9:3000/account/profile",
                headers: {
                  Authorization : `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data', 
                },
                data: formData,
              });
          
              if (response.status === 200) {
                alert(response.data.message);
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
            navigate('/home');
        } catch (error) {
            console.error("An error occurred while saving profile:", error);
        }
    };

    return (
        <div className={styles.profileEditWrap}>
            <div className={styles.profileEdit}>
                <div className={styles.profileheader}>
                    <h1>프로필 편집</h1>
                    <button className={styles.profilecompleteBtn} onClick={handleSaveProfile}>완료</button>
                </div>
                <div className={styles.profileImageSection}>
                <div
                    className={styles.imageCircle}
                    onClick={handleFileSelect}
                    style={imageURL ? { backgroundImage: `url(${imageURL})` } : {}}
                >
                    {!imageURL && <span>+</span>}
                </div>
                    <input type="file" ref={fileInput} style={{ display: 'none' }} onChange={handleImageChange} className={styles.profileinput}/>
                    <div className={styles.imageAction}>
                        <button className={styles.profilephotoBtn} onClick={handleFileSelect}>사진 선택</button>
                        <button className={styles.profilephotoBtn} onClick={handleRemoveImage}>지우기</button>
                    </div>
                </div>
                <div className={styles.profileinputBox}>
                <h6>ID</h6>  
                <input placeholder="ID" value={id} readOnly className={styles.profileinput} />
                <h6>USER NAME</h6> 
                <input placeholder="유저 이름" value={username} readOnly className={styles.profileinput} />
                <h6>BIO</h6>  
                <textarea placeholder="자기소개" value={bio} onChange={e => setBio(e.target.value)} className={styles.profiletextarea } ></textarea>
                <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
            </div>
            </div>
        </div>
    );
}

export default ProfilePhotoEdit;
