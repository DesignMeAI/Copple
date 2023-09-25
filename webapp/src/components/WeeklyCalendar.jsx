import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  setMonth,
  setYear,
  isToday,
} from "date-fns";
import styles from "../styles/WeeklyCalendar.module.css";
import { isEqual } from "date-fns";
import { useRecoilState } from 'recoil';
import { eventsPropState, selectedDateState } from '../atoms'; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function WeeklyCalendar() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const yearModalRef = useRef(null);
  const monthModalRef = useRef(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const navigate = useNavigate(); 
  const [showAddModal, setShowAddModal] = useState(false);
  const addModalRef = useRef(null);
  const [eventsProp, setEventsProp] = useRecoilState(eventsPropState);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);

  useEffect(() => {
    setSelectedDate(startDate);
  }, [startDate, setSelectedDate]);

  useEffect(() => {
    async function fetchUserEvents() {
      try {
        const tokenstring = document.cookie;
        const token = tokenstring.split("=")[1];
        const formattedDay = selectedDate
          ? format(selectedDate, "yyyy-MM-dd HH:mm:ss")
          : null;
          console.log("여기 :", formattedDay)
        if (formattedDay) {
        // if (selectedDate) {
          const response = await axios({
            method: "GET",
            // url: `http://3.39.153.9:3000/event/readByDate/${selectedDate}`,
            url: `http://3.39.153.9:3000/event/readByDate/${formattedDay}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
          setEventsProp(response.data);
        }
      } catch (error) {
        console.error("An error occurred while fetching user events:", error);
      }
    }
    fetchUserEvents();
  }, [selectedDate]);

  useEffect(() => {
    const newDate = setYear(
      setMonth(new Date(), selectedMonth),
      selectedYear
    );
    setStartDate(startOfWeek(newDate, { weekStartsOn: 0 }));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        yearModalRef.current &&
        !yearModalRef.current.contains(event.target)
      ) {
        setShowYearModal(false);
      }
      if (
        monthModalRef.current &&
        !monthModalRef.current.contains(event.target)
      ) {
        setShowMonthModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const days = Array.from({ length: 7 }).map((_, idx) =>
    addDays(startDate, idx)
  );
  const goToPreviousWeek = () =>
    setStartDate((prevStartDate) => addDays(prevStartDate, -7));
  const goToNextWeek = () =>
    setStartDate((prevStartDate) => addDays(prevStartDate, 7));

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

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleAddOptionClick = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.dateSelector}>
        <div
          className={styles.selectorItem}
          style={{ cursor: "pointer" }}
          onClick={() => setShowYearModal(true)}
        >
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
        <div
          className={styles.selectorItem}
          style={{ cursor: "pointer" }}
          onClick={() => setShowMonthModal(true)}
        >
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
          <button onClick={() => setShowMonthlyModal(false)}>Close</button>
        </div>
      )}

      <div className={styles.addIconWrapper}>
        <div className={styles.addIcon} onClick={toggleAddModal}>
          +
        </div>
        {showAddModal && (
          <div ref={addModalRef} className={styles.addModal}>
            <button onClick={() => handleAddOptionClick("/goal")}>
            목표 추가
            </button>
            <br />
            <button onClick={() => handleAddOptionClick("/plan")}>
              일정 추가
            </button>
            <br />
            <button onClick={() => handleAddOptionClick("/todo")}>
              할일 추가
            </button>
          </div>
        )}
      </div>

      <div className={styles.calendarNavigation}>
        <button className={styles.calendarleftbutton} onClick={goToPreviousWeek}> ◀︎ </button>
        <div className={styles.calendarContainer}>
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`${styles.calendarDay} ${
                isEqual(selectedDate, day) ? styles.selectedDay : ""
              }`} 
              onClick={() => handleDayClick(day)}
            >
              <div className={styles.calendarDayName}>{format(day, "E")}</div>
              <div
                className={`${styles.calendarDayNumber} ${
                  isToday(day) ? styles.today : ""
                }`}
              >
                {format(day, "d")}          
              </div>
            </div>
          ))}
        </div>
        <button className={styles.calendarrightbutton} onClick={goToNextWeek}> ▶︎ </button>
      </div>
    </div>
  );
}

export default WeeklyCalendar;

