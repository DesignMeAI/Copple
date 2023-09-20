import React, { useState } from 'react';
import styles from '../styles/GoalSchedule.module.css';

function GoalSchedule() {
  const [selectedCategory, setSelectedCategory] = useState('일정');
  const schedules = [
    {
      day: 1,
      schedules: [
        { title: '인천 → 방콕', time: '02:00am - 08:32am' },
        { title: '왕궁, 왓포 사원 방문 ', time: '11:00am - 02:00pm' },
        { title: '저녁이야~~', time: '18:00' }
      ]
    },
    {
      day: 1,
      schedules: [
        { title: '인천 → 방콕', time: '02:00am - 08:32am' },
        { title: '왕궁, 왓포 사원 방문 ', time: '11:00am - 02:00pm' },
        { title: '저녁이야~~', time: '18:00' }
      ]
    },
    {
      day: 2,
      schedules: [
        { title: '2일차 일정', time: '11:00' },
        { title: '인천 → 방콕', time: '02:00am - 08:32am' },
        { title: '왕궁, 왓포 사원 방문 ', time: '11:00am - 02:00pm' },
        { title: '저녁이야~~', time: '18:00' }
      ]
    },
    {
      day: 3,
      schedules: [
        { title: '3일차 일정', time: '11:00' },
        { title: '인천 → 방콕', time: '02:00am - 08:32am' },
        { title: '왕궁, 왓포 사원 방문 ', time: '11:00am - 02:00pm' },
        { title: '저녁이야~~', time: '18:00' }
      ]
    },
    
  ];

  const todos = [
    { id: 1, task: '티켓 예매하기', completed: false },
    { id: 2, task: '호텔 예약하기', completed: true },
    // ...
  ];


  const getButtonClassName = (category) => selectedCategory === category ? `${styles.active}` : '';
  const getBlueButtonClassName = () => selectedCategory === '추가' ? `${styles.active} ${styles.blueButton}` : `${styles.blueButton}`;

  return (
    <div>
      <div className={styles.categoryRow}>
        <div>
          <button className={getButtonClassName('일정')} onClick={() => setSelectedCategory('일정')}>일정</button>
          <button className={getButtonClassName('할일')} onClick={() => setSelectedCategory('할일')}>할일</button>
        </div>
        <button style={{ marginLeft: '175px' }} className={getBlueButtonClassName('추가')} onClick={() => setSelectedCategory('추가')}>+ 추가</button>
      </div>
      
      {/* 일정 렌더링 로직 */}
      {selectedCategory === '일정' &&
        <div className={styles.scheduleContainer}>
          {schedules.map((daySchedule, index) => (
            <div key={`day-${index}`} className={styles.daySchedule}> 
              <h3>{`${daySchedule.day}일 차`}</h3>
              {daySchedule.schedules.map((schedule, idx) => (
                <div key={`schedule-${idx}`} className={styles.scheduleBox}>
                  <div>{schedule.title}</div>
                  <div>{schedule.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      }
    </div>
  );
}

export default GoalSchedule;
