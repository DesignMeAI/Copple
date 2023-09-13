import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  setMonth,
  setYear,
  isToday,
} from "date-fns";
import styles from "../css/WeeklyCalendar.module.css";
import Timeline from "./Timeline";
import TodoList from "./TodoList";

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [todos, setTodos] = useState({});

  useEffect(() => {
    const newDate = setYear(setMonth(new Date(), selectedMonth), selectedYear);
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
    setEvents({
      ...events,
      [format(day, "yyyy-MM-dd")]: [{ name: "Meeting" }, { name: "Workout" }],
    });
    setTodos({
      ...todos,
      [format(day, "yyyy-MM-dd")]: [
        { task: "Read a book" },
        { task: "Go jogging" },
      ],
    });
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
          <button
            className={styles.calendarbtn}
            onClick={() => setShowMonthlyModal(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className={styles.calendarNavigation}>
        <button className={styles.calendarbtn} onClick={goToPreviousWeek}>
          ◀
        </button>
        <div className={styles.calendarContainer}>
          {days.map((day, idx) => (
            <div
              key={idx}
              className={styles.calendarDay}
              onClick={() => handleDayClick(day)}
            >
              <div className={styles.calendarDayName}>{format(day, "E")}</div>
              <div
                className={`calendarDayNumber ${isToday(day) ? "today" : ""}`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <button className={styles.calendarbtn} onClick={goToNextWeek}>
          ▶
        </button>
      </div>

      {selectedDate && (
        <div className={styles.timelineWrapper}>
          <Timeline
            date={selectedDate}
            events={events[format(selectedDate, "yyyy-MM-dd")]}
          />
        </div>
      )}
    </div>
  );
}

export default WeeklyCalendar;
