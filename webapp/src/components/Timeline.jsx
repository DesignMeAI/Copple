import React, { useState, useEffect } from "react";
import styles from "../styles/Timeline.module.css";

const Timeline = ({ eventsProp = [] }) => {
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState(
    Array.isArray(eventsProp) ? eventsProp : []
  );

  const [showOptionsIndex, setShowOptionsIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const addEvent = () => {
    if (title.trim()) {
      const newEvent = {
        event_id: new Date().toISOString(),
        startDatetime: `2023-09-19T${hour}:${minute}:00`,
        title,
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setTitle("");
      setHour("00");
      setMinute("00");
    }
  };

  const deleteEvent = (index) => {
    if (window.confirm("이 이벤트를 정말로 삭제하시겠습니까?")) {
      const newEvents = [...events];
      newEvents.splice(index, 1);
      setEvents(newEvents);
      setShowOptionsIndex(null);
    }
  };

  const updateEvent = (index, newTitle) => {
    const newEvents = [...events];
    newEvents[index].title = newTitle;
    setEvents(newEvents);
  };

  const finishEditing = (index, newTitle) => {
    if (newTitle.trim() && newTitle !== events[index].title) {
      updateEvent(index, newTitle);
    }
    setEditIndex(null);
  };

  useEffect(() => {
    if (Array.isArray(eventsProp)) setEvents(eventsProp);
  }, [eventsProp]);

  const currentTime = new Date().toISOString();
  const sortedEvents = [...events]
    .filter((e) => e.startDatetime && e.startDatetime >= currentTime)
    .sort((a, b) => a.startDatetime.localeCompare(b.startDatetime));

  return (
    <div className={styles.app}>
      <ul className={styles["event-list"]}>
        {sortedEvents.map((event, index) => (
          <li
            key={event.event_id}
            className={styles["event-item"]}
            style={{ backgroundColor: `hsl(${(index * 50) % 360}, 100%, 85%)` }}
          >
            <span className={styles["event-time"]}>
              {event.startDatetime.split("T")[1]?.slice(0, 5)}
            </span>
            {editIndex === index ? (
              <input
                className={styles["edit-input"]}
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
                className={styles["event-title"]}
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
              {editIndex === index ? (
                <button
                  className={styles["finish-button"]}
                  onClick={() => finishEditing(index, event.title)}
                >
                  완료
                </button>
              ) : (
                "..."
              )}
              {showOptionsIndex === index && editIndex !== index && (
                <div className={styles["dropdown-options"]}>
                  <button
                    className={styles["edit-btn"]}
                    onClick={() => setEditIndex(index)}
                  >
                    수정
                  </button>
                  <button
                    className={styles["delete-btn"]}
                    onClick={() => deleteEvent(index)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;
