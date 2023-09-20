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
    </div>
  );
}

export default ThumbnailList;
