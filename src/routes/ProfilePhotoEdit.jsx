import React, { useEffect, useRef, useState } from "react";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { useNavigate } from "react-router-dom";
import styles from "../css/ProfilePhotoEdit.module.css";

const client = new DynamoDBClient({ region: "ap-northeast-2" });

function ProfilePhotoEdit() {
  const fileInput = useRef(null);
  const [imageURL, setImageURL] = useState(null);
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const command = new GetItemCommand({
        TableName: "Users",
        Key: { UserId: { S: "arin1234" } },
      });

      try {
        const result = await client.send(command);
        if (result.Item) {
          setImageURL(result.Item.imageURL.S);
          setNickname(result.Item.nickname.S);
          setUsername(result.Item.UserName.S);
          setBio(result.Item.bio.S);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    sessionStorage.removeItem("userId");
    // navigate('/login');
  };

  const handleFileSelect = () => {
    fileInput.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageURL(null);
    fileInput.current.value = null;
  };

  const handleSaveProfile = async () => {
    if (!imageURL || !nickname || !username || !bio) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    const params = {
      TableName: "Users",
      Key: { UserId: { S: "arin1234" } },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c, #d = :d",
      ExpressionAttributeNames: {
        "#a": "UserName",
        "#b": "nickname",
        "#c": "bio",
        "#d": "imageURL",
      },
      ExpressionAttributeValues: {
        ":a": { S: username },
        ":b": { S: nickname },
        ":c": { S: bio },
        ":d": { S: imageURL },
      },
    };

    const updateItemCommand = new UpdateItemCommand(params);

    try {
      await client.send(updateItemCommand);
      alert("프로필 수정이 완료되었습니다!");
      console.log("Navigating to /main");
      navigate("/main");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className={styles.profileEditWrap}>
      <div className={styles.profileEdit}>
        <div className={styles.header}>
          <h1>프로필 편집</h1>
          <button className={styles.completeBtn} onClick={handleSaveProfile}>
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
          />
          <div className={styles.imageAction}>
            <button className={styles.photoBtn} onClick={handleFileSelect}>
              사진 선택
            </button>
            <button className={styles.photoBtn} onClick={handleRemoveImage}>
              지우기
            </button>
          </div>
        </div>
        <div className={styles.inputBox}>
          <input
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            placeholder="유저 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <textarea
            placeholder="자기소개"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
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
