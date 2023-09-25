import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import styles from "../styles/Timeline.module.css";

const Timeline = ({ eventsProp = [] }) => {

  const [events, setEvents] = useState(Array.isArray(eventsProp) ? eventsProp : []);
  const [showOptionsIndex, setShowOptionsIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [editingTitles, setEditingTitles] = useState({}); 
  const [sortedEvents, setSortedEvents] = useState([]);
  const observer = useRef();

  const lastEventRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setPage((prevPage) => prevPage + 1);
      });
      if (node) observer.current.observe(node);
    },
    [],
  );
  


  const deleteEvent = async (index, eventId) => { 
    if (window.confirm('이 이벤트를 정말로 삭제하시겠습니까?')) {
      try {
        const tokenString = document.cookie;
        const token = tokenString.split("=")[1];

        const response = await axios.delete(`http://3.39.153.9:3000/event/delete/${eventId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        })


        const newEvents = [...events];
        console.log(newEvents);
        newEvents.splice(index, 1);
        setEvents(newEvents);
        setShowOptionsIndex(null); 
      } catch (error) {
        console.error("Could not delete event", error);
      }
    }
  };


  const updateEvent = async (index, newTitle) => {
    try {
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
  
      const eventToUpdate = events[index];
      
      const updatedEvent = { 
        ...eventToUpdate, 
        title: newTitle 
      };
  
      await axios.put(`http://3.39.153.9:3000/event/update/${updatedEvent.event_id}`, updatedEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setEvents(events.map((event, i) => (i === index ? updatedEvent : event)));
    } catch (error) {
      console.error("Could not update event", error);
    }
  };
  

  const finishEditing = async (eventId) => {
    const index = events.findIndex((e) => e.event_id === eventId);
    if (index === -1) return;
    
    try {
      const updatedTitle = editingTitles[eventId];
      if (updatedTitle.trim() && updatedTitle !== events[index].title) {
        await updateEvent(index, updatedTitle);
      }
      setEditingTitles((prev) => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      setEditIndex(null);
    } catch (error) {
      console.error("Could not finish editing", error);
    }
  };
  

  useEffect(() => {
    if (Array.isArray(eventsProp)) setEvents(eventsProp);
  }, [eventsProp]);

  useEffect(() => {
    const fetchMoreEvents = async () => {
      try {
        const res = await axios.get(`/events?page=${page}`);
        setEvents((prevEvents) => [...prevEvents, ...res.data]);
      } catch (error) {
        console.error("Error fetching more events", error);
      }
    };

    fetchMoreEvents();
  }, [page]);



  useEffect(() => {
    const currentTime = new Date().toISOString();
    const newSortedEvents = [...events].filter(e => e.startDatetime && e.startDatetime >= currentTime)
      .sort((a, b) => a.startDatetime.localeCompare(b.startDatetime));
    setSortedEvents(newSortedEvents);
  }, [events]);

    const dropdownRef = useRef();

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowOptionsIndex(null);
    }
  };

  document.addEventListener('mousedown', handleOutsideClick);

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, []);

return (
  <div className={styles.app}>
    <ul className={styles["event-list"]}>
      {sortedEvents.map((event, index, array) => (
        <li
          key={event.event_id}
          className={styles["event-item"]}
          ref={index === array.length - 1 ? lastEventRef : null}
          style={{ backgroundColor: `hsl(${180 + (index * 35) % 55}, 60%, 82%)` }}

        >
          <span className={styles["event-time"]}>
            {new Date(event.startDatetime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          {editIndex === event.event_id ? (
            <input
              className={styles["edit-input"]}
              value={editingTitles[event.event_id] || ""}
              onChange={(e) => setEditingTitles({ ...editingTitles, [event.event_id]: e.target.value })}
              onKeyUp={(e) => {
                if (e.key === "Enter") finishEditing(event.event_id);
              }}
              onBlur={() => finishEditing(event.event_id)}
              autoFocus
            />
          ) : (
            <span
              className={styles["event-title"]}
              onDoubleClick={() => { 
                setEditIndex(event.event_id); 
                setEditingTitles({ ...editingTitles, [event.event_id]: event.title }); 
              }}
            >
              {event.title}
            </span>
          )}
          <span className={styles.options} onClick={() => setShowOptionsIndex(showOptionsIndex === event.event_id ? null : event.event_id)}>
            {editIndex === event.event_id ? (
              <button className={styles["finish-button"]} onClick={() => finishEditing(event.event_id)}>
                완료
              </button>
            ) : (
              "..."
            )}
            {showOptionsIndex === event.event_id && editIndex !== event.event_id && (
              <div className={styles["dropdown-options"]} ref={dropdownRef}>
              <button 
              className={styles["edit-btn"]} 
              onClick={() => {
                setEditIndex(event.event_id);
                setEditingTitles({ ...editingTitles, [event.event_id]: event.title });
              }}
            >
              수정
            </button>
                <button className={styles["delete-btn"]} onClick={() => deleteEvent(index, event.event_id)}>
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