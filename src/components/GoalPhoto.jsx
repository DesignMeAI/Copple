import React, { useState, useRef, useEffect } from "react";
import EllipsisSvg from "../assets/images/ellipsis.svg";
import styles from "../css/GoalPhoto.module.css";

function GoalPhoto({ title }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDate, setEditedDate] = useState("");
  const optionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const toggleEditMode = () => {
    setEditMode((prevEditMode) => !prevEditMode);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  return (
    <div className={styles.goalPhoto}>
      {imageSrc ? (
        <>
          <img src={imageSrc} alt="Goal Thumbnail" />
          <div className={styles.overlay}>
            <div className={styles.topRightMenu} onClick={toggleOptions}>
              <img src={EllipsisSvg} alt="More Options" />
            </div>
            {showOptions && (
              <div
                className={showOptions ? "options show" : "options"}
                ref={optionsRef}
              >
                <button onClick={toggleEditMode}>
                  {editMode ? "완료" : "수정하기"}
                </button>
                <button
                  onClick={() => document.getElementById("image-input").click()}
                >
                  사진수정
                </button>
                <button onClick={() => setImageSrc(null)}>사진삭제</button>
              </div>
            )}
            <div className={styles.titleContainer}>
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    placeholder="목표 제목"
                    className={styles.titleInput}
                  />
                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    placeholder="날짜 입력"
                    className={styles.dateInputs}
                  />

                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    placeholder="날짜 입력"
                    className={styles.dateInputs}
                  />
                </>
              ) : (
                <div className={styles.titleDateContainer}>
                  <div className={styles.title}>{editedTitle}</div>
                  {editedDate && (
                    <div className={styles.date}>{editedDate}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <label htmlFor="photo-input">
            사진 추가하기 <br /> &nbsp;Click!{" "}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
      )}
      <input
        id="image-input"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          handleImageChange(e);
          setEditMode(false);
        }}
      />
    </div>
  );
}

export default GoalPhoto;
