import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, setMonth, setYear, isToday } from 'date-fns';
import styles from '../styles/WeeklyCalendar.module.css';
import { isEqual } from 'date-fns';
import { useCalendar } from '../routes/MainPage';
import { useNavigate } from 'react-router-dom';



function WeeklyCalendar() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const yearModalRef = useRef(null);
  const monthModalRef = useRef(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [goals, setGoals] = useState({});
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const addModalRef = useRef(null);


  useEffect(() => {
    if (selectedDate) {
      const formattedDay = format(selectedDate, 'yyyy-MM-dd');
      const startDatetime = `${formattedDay}T00:00:00`;
      const endDatetime = `${formattedDay}T23:59:59`;
  
      // 백엔드 API URL 및 필요한 인증 정보
      fetch(`http://3.39.153.9:3000/goal/read?startDatetime=${startDatetime}&endDatetime=${endDatetime}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJpbiIsImlhdCI6MTY5NTEzODc2MiwiZXhwIjoxNjk1MTc0NzYyfQ.YyUze1XmaiijtruyEOcPtLBsdzzQjmsKn5xO1P66dMQ"}`,  // YOUR_ACCESS_TOKEN은 실제 액세스 토큰으로 대체해야 합니다.
        },
      })
        .then(res => res.json())
        .then(data => {
          console.log('Data:', data);
          setGoals({
            ...goals,
            [formattedDay]: data

          });
        })
        .catch(error => {
          console.log('Error:', error);
        });
    }
  }, [selectedDate]); 

  useEffect(() => {
    const newDate = setYear(setMonth(new Date(), selectedMonth), selectedYear);
    setStartDate(startOfWeek(newDate, { weekStartsOn: 0 }));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (yearModalRef.current && !yearModalRef.current.contains(event.target)) {
        setShowYearModal(false);
      }
      if (monthModalRef.current && !monthModalRef.current.contains(event.target)) {
        setShowMonthModal(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const days = Array.from({ length: 7 }).map((_, idx) => addDays(startDate, idx));
  const goToPreviousWeek = () => setStartDate((prevStartDate) => addDays(prevStartDate, -7));
  const goToNextWeek = () => setStartDate((prevStartDate) => addDays(prevStartDate, 7));

  const handleDayClick = (day) => {
    setSelectedDate(day);
};

const toggleAddModal = () => {
  setShowAddModal(!showAddModal);
};

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (addModalRef.current && !addModalRef.current.contains(event.target)) {
      setShowAddModal(false);
    }
  };

  document.addEventListener('mousedown', handleOutsideClick);
  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, []);

const handleAddOptionClick = (path) => {
  navigate(path);
};


  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.dateSelector}>
        <div className={styles.selectorItem} style={{cursor: 'pointer'}} onClick={() => setShowYearModal(true)}>
          {selectedYear}년
          {showYearModal && (
            <div className={styles.modal} ref={yearModalRef}>
              {Array.from({ length: 31 }).map((_, idx) => {
                const yearValue = 2020 + idx;
                return (
                  <div 
                    key={yearValue} 
                    onClick={(event) => { 
                        event.stopPropagation();
                        setSelectedYear(yearValue); 
                        setShowYearModal(false);
                    }}
                  >
                    {yearValue}년
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.selectorItem} style={{cursor: 'pointer'}} onClick={() => setShowMonthModal(true)}>
          {selectedMonth + 1}월
          {showMonthModal && (
            <div className={styles.modal} ref={monthModalRef}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={(event) => { 
                      event.stopPropagation();
                      setSelectedMonth(idx); 
                      setShowMonthModal(false);
                  }}
                >
                  {idx + 1}월
                </div>
              ))}
            </div>
          )}
        </div>
       
      </div>

      {showMonthlyModal && (
        <div className={styles.monthlyModal}>
            <button onClick={() => setShowMonthlyModal(false)}>
                Close
            </button>
        </div>
      )}

      <div className={styles.addIconWrapper}>
      <div className={styles.addIcon} onClick={toggleAddModal}>+</div>
      {showAddModal && (
        <div ref={addModalRef} className={styles.addModal}>
            <button onClick={() => handleAddOptionClick('/goal')}>목표 추가</button><br />
            <button onClick={() => handleAddOptionClick('/plan')}>일정 추가</button><br />
            <button onClick={() => handleAddOptionClick('/todo')}>할일 추가</button>
          </div>
        )}
      </div>
        
      <div className={styles.calendarNavigation}>
        <button onClick={goToPreviousWeek}>◀</button>
        <div className={styles.calendarContainer}>
          {days.map((day, idx) => (
            <div 
            key={idx} 
            className={`${styles.calendarDay} ${isEqual(selectedDate, day) ? styles.selectedDay : ''}`}  // 조건부 스타일 적용
            onClick={() => handleDayClick(day)}
          >
              <div className={styles.calendarDayName}>{format(day, 'E')}</div>
              <div className={`${styles.calendarDayNumber} ${isToday(day) ? styles.today : ''}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        <button onClick={goToNextWeek}>▶️</button>
      </div>
    </div>
  );
};

export default WeeklyCalendar;