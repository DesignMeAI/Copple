import React, { useState, useRef, useEffect } from 'react';
// import EllipsisSvg from '/AiPlanner/myplanner/FE/src/assets/images/ellipsis.svg';
import styles from '../styles/GoalPhoto.module.css';

function GoalPhoto({ goalId }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const optionsRef = useRef(null);

  useEffect(() => {

    async function fetchGoalPhoto() {
      try {
        const response = await fetch(`/api/goal-photo/${goalId}`); 
        if (response.ok) {
          const data = await response.json();
          setImageSrc(data.imageUrl);
          setEditedTitle(data.title);
          setEditedDate(data.date);
        } else {
          console.error('Failed to fetch goal photo');
        }
      } catch (error) {
        console.error('Error fetching goal photo:', error);
      }
    }

    fetchGoalPhoto();
  }, [goalId]);

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

  return (
    <div className={styles.goalPhoto}>
      {imageSrc ? (
       
        <>
          <img src={imageSrc} alt="Goal Thumbnail" />
          <div className={styles.overlay}>
            {editMode ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
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
              </>
            ) : (
              <div className={styles.titleDateContainer}>
                <div className={styles.title}>{editedTitle || 'Loading...'}</div>
                {editedDate && <div className={styles.date}>{editedDate}</div>}
              </div>
            )}
            {/* ... Rest of the component */}
          </div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <label htmlFor="photo-input">사진 추가하기 <br/> &nbsp;Click! </label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>
      )}
      {/* ... */}
    </div>
  );
}

export default GoalPhoto;
