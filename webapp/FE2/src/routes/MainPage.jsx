import React, { createContext, useContext, useState, useEffect } from "react";
import WeeklyCalendar from '../components/WeeklyCalendar.jsx';
import CalendarThumbnail from '../components/CalendarThumbnail.jsx';
import styles from '../styles/MainPage.module.css';
import Category from '../components/Category.jsx';
import Navbar from '../components/Navbar.jsx';

export const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);

const MainPage = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [goals, setGoals] = useState({});
  const [dataForSelectedDate, setDataForSelectedDate] = useState({
    events: [],
    todos: [],
    goals: []
  });

  useEffect(() => {
    if (selectedDate) {

      const selectedDateString = selectedDate.toISOString().split('T')[0];

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJpbiIsImlhdCI6MTY5NTEzODc2MiwiZXhwIjoxNjk1MTc0NzYyfQ.YyUze1XmaiijtruyEOcPtLBsdzzQjmsKn5xO1P66dMQ";
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      fetch(`http://3.39.153.9:3000/goal/client/read`, {
  method: 'GET',
  headers,
})
.then((response) => response.json())
.then((data) => {
  console.log("Goal Data:", data);
  setDataForSelectedDate(prevData => ({
    ...prevData,
    goals: data,
  }));
});

           // Events 요청
           fetch(``, {
            method: 'GET',
            headers,
          })
          .then((response) => response.json())
          .then((data) => {
            console.log("Events Data:", data); 
            setDataForSelectedDate(prevData => ({
              ...prevData,
              events: data,
            }));
          });
  
      // Todos 요청
      fetch(`http://3.39.153.9:300/todo/read`, {
        method: 'GET',
        headers,
      })
      .then((response) => response.json())
      .then((data) => {
        setDataForSelectedDate(prevData => ({
          ...prevData,
          todos: data,
        }));
      });
    }
  }, [selectedDate]);

  const contextValue = {
    selectedDate,
    setSelectedDate,
    dataForSelectedDate,
    setDataForSelectedDate,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      <div className={styles.mainWrapper}>
        <div className={styles.mainContainer}>
          <div className={styles.mainweeklyCalendar}>
            <WeeklyCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} setGoals={setGoals} />
          </div>
          <div className={styles.mainThumbnails}>
            <CalendarThumbnail />
          </div>
          <div className={styles.scheduleTodoRow}>
            <Category dataForSelectedDate={dataForSelectedDate} />
          </div>
          <div>
            <Navbar className={styles.NavBarContainer} />
          </div>
        </div>
      </div>
    </CalendarContext.Provider>
  );
};

export default MainPage;
