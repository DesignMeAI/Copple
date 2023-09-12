import React, { useState, useRef } from "react";
import styles from "../css/Timeline.module.css";

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 40) + 180; // 하늘/파란 계열의 파스텔색을 위해 범위를 지정
  const saturation = 70;
  const lightness = 80;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const Timeline = () => {
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [showOptionsIndex, setShowOptionsIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const listRef = useRef(null);

  const addEvent = () => {
    if (title.trim()) {
      setEvents((prevEvents) => [
        ...prevEvents,
        { time: `${hour}:${minute}`, title, color: getRandomPastelColor() },
      ]);
      setTitle("");
      setHour("00");
      setMinute("00");
    }
  };

  const deleteEvent = (index) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
    setShowOptionsIndex(null);
  };

  const updateEvent = (index, newTitle) => {
    const newEvents = [...events];
    newEvents[index].title = newTitle;
    setEvents(newEvents);
  };

  const finishEditing = (index, newTitle) => {
    if (newTitle.trim()) {
      updateEvent(index, newTitle);
    }
    setEditIndex(null);
  };

  return (
    <div className={styles.app}>
      <div className={styles.inputArea}>
        <div className={styles.timeSelector}>
          <select onChange={(e) => setHour(e.target.value)} value={hour}>
            {[...Array(24).keys()].map((hour) => (
              <option key={hour} value={String(hour).padStart(2, "0")}>
                {String(hour).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span>시</span>
          <select onChange={(e) => setMinute(e.target.value)} value={minute}>
            {[...Array(60).keys()].map((minute) => (
              <option key={minute} value={String(minute).padStart(2, "0")}>
                {String(minute).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span>분</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목"
          onKeyUp={(e) => {
            if (e.key === "Enter") addEvent();
          }}
        />
        <button onClick={addEvent}>+</button>
      </div>
      <div className={styles.timelineContainer}>
        <ul className={styles.eventList} ref={listRef}>
          {events.map((event, index) => (
            <li
              key={index}
              style={{
                backgroundColor: event.color,
                borderRadius: "8px",
              }}
            >
              <span className={styles.eventTime}>{event.time}</span>
              {editIndex === index ? (
                <input
                  className={styles.editInput}
                  value={event.title}
                  onChange={(e) => updateEvent(index, e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") finishEditing(index, e.target.value);
                  }}
                  onBlur={() => finishEditing(index, event.title)}
                  autoFocus
                />
              ) : (
                <span
                  className={styles.eventTitle}
                  onDoubleClick={() => setEditIndex(index)}
                >
                  {event.title}
                </span>
              )}
              <span
                className={styles.options}
                onClick={() =>
                  setShowOptionsIndex(showOptionsIndex === index ? null : index)
                }
              >
                <div className={styles.optionsButtons}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setEditIndex(index)}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteEvent(index)}
                  >
                    삭제
                  </button>
                </div>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
