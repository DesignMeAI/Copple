<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import styles from '../styles/CalendarThumbnail.module.css';  
import { useCalendar } from '../routes/MainPage';

function ThumbnailList() {
  const { selectedDate, dataForSelectedDate } = useCalendar();  
  const [goals, setGoals] = useState([]); // 상태 초기화
  const navigate = useNavigate();  // 리액트 라우터의 navigate 훅
  const date = "2023-09-20";  // 

  // useEffect(() => {
  //   setGoals(dataForSelectedDate.goals); 
  // }, [dataForSelectedDate]);

  useEffect(() => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJpbiIsImlhdCI6MTY5NTEzODc2MiwiZXhwIjoxNjk1MTc0NzYyfQ.YyUze1XmaiijtruyEOcPtLBsdzzQjmsKn5xO1P66dMQ"

    // fetch API를 이용하여 목표 정보 가져오기
    fetch(`/goal/readByDate/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // JWT 토큰을 Authorization 헤더에 추가
      },
    })
    .then(res => res.json())
    .then(data => {
      // 받은 데이터를 콘솔에서 확인
      console.log('Received data:', data);
      console.log('Type:', typeof data);

      // 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        console.error('Received data is not an array');
      }
    })
    .catch(err => {
      console.error('Fetch Error:', err);  // 오류 로깅
    });
  }, [date]);  // date가 변경될 때마다 useEffect를 다시 실행

  // 목표 상세 페이지로 이동하는 함수
  const goToPlanList = () => {
    navigate('/planlist');
  };




  

  return (
    <div className={styles.CalendarThumbnailContainer}>
      {goals.map((goal, index) => (
        <div key={index} className={styles.CalendarThumbnailbigBox} onClick={goToPlanList}>
          <div className={styles.CalendarThumbnailthumbnailBox}>
            <img src={goal.photoUrl} alt={`Goal ${goal.title}`} className={styles.CalendarThumbnailthumbnail} />
          </div>
          <div className={styles.CalendarThumbnailgoalInfo}>
            <span className={styles.CalendarThumbnailgoalTitle}>{goal.title}</span>
            <span className={styles.CalendarThumbnailgoalPeriod}>{`${goal.startDatetime} - ${goal.endDatetime}`}</span>
          </div>
        </div>
      ))}
      <button className={styles.CalendarThumbnailloadMore} onClick={() => navigate('/goal')}>+</button>
=======
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/CalendarThumbnail.module.css";

const exampleThumbnails = [
  {
    id: 1,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 2,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 3,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 4,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 5,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 6,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 7,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
];
function ThumbnailList() {
  const navigate = useNavigate();
  const goToGoalDetails = (goalId) => {
    navigate(`/goal-details/${goalId}`);
  };

  return (
    <div className={styles.ThumbnailContainer}>
      {exampleThumbnails.map((thumbnail, index) => (
        <div
          key={index}
          className={styles.bigBox}
          onClick={() => goToGoalDetails(thumbnail.id)}
        >
          <div className={styles.thumbnailBox}>
            <img
              src={thumbnail.imageURL}
              alt={`Thumbnail ${index + 1}`}
              className={styles.thumbnail}
            />
          </div>
          <div className={styles.goalInfo}>
            <span className={styles.goalTitle}>{thumbnail.title}</span>
            <span className={styles.goalPeriod}>{thumbnail.period}</span>
          </div>
        </div>
      ))}
      <button
        className={styles.loadMore}
        onClick={() => navigate("/create-goal")}
      >
        +
      </button>
>>>>>>> 68e88b5 (eunjae)
    </div>
  );
}

export default ThumbnailList;
