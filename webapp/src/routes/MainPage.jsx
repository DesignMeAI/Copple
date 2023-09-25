import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import WeeklyCalendar from "../components/WeeklyCalendar.jsx";
import CalendarThumbnail from "../components/CalendarThumbnail.jsx";
import styles from "../styles/MainPage.module.css";
import Category from "../components/Category.jsx";
import Navbar from "../components/Navbar.jsx";
import { infoState, nameState } from "../atoms";
import { useRecoilValue } from "recoil";

export const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);

const MainPage = () => {
  const name = useRecoilValue(nameState);
  const info = useRecoilValue(infoState);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState({});
  const [eventsProp, setEventsProp] = useState([]); 
  const [dataForSelectedDate, setDataForSelectedDate] = useState({
    events: [],
    todos: [],
    goals: [],
  });

  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      fetchEventsForSelectedDate();
    }
  }, [selectedDate]);

  const fetchEventsForSelectedDate = async () => {
    try {
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
      const selectedDateString = selectedDate.toISOString().split("T")[0];
      const response = await axios.get(`http://3.39.153.9:3000/event/read/${selectedDateString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEventsForSelectedDate(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const contextValue = {
    selectedDate,
    setSelectedDate,
    dataForSelectedDate,
    setDataForSelectedDate,
    eventsForSelectedDate,
    fetchEventsForSelectedDate,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      <div className={styles.mainWrapper}>
        <div className={styles.mainContainer}>
          <div className={styles.mainweeklyCalendar}>
            <WeeklyCalendar
              events={eventsProp}
              setEvents={setEventsProp} 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setGoals={setGoals}
            />
          </div>
          <div className={styles.mainThumbnails}>
            <CalendarThumbnail goals={goals} />
          </div>
          <div className={styles.scheduleTodoRow}>
            <Category
              dataForSelectedDate={dataForSelectedDate}
              eventsProp={eventsProp}
            />
          </div>
          <div>
            <Navbar className={styles.NavbarContainer} />
          </div>
        </div>
      </div>
    </CalendarContext.Provider>
  );
};

export default MainPage;
