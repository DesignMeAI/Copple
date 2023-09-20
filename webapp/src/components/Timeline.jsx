import React, { useState } from 'react';
import styles from '../styles/Timeline.module.css';

const Timeline = ({ apiEvents = [] }) => {
  const mockApiEvents = [
    {
      event_id: '1',
      startDatetime: '2023-09-19T12:00:00',
      title: 'Lunch',
    },
    {
      event_id: '2',
      startDatetime: '2023-09-19T14:00:00',
      title: 'Meeting',
    },
    {
      event_id: '3',
      startDatetime: '2023-09-20T16:00:00',
      title: 'Coffee Break',
    },
  ];

  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState(apiEvents.length ? apiEvents : mockApiEvents);

  const [showOptionsIndex, setShowOptionsIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  
  
 

  const addEvent = () => {
    if (title.trim()) {
      const newEvent = {
        event_id: new Date().toISOString(),
        startDatetime: `2023-09-19T${hour}:${minute}:00`,
        title,
      };
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setTitle('');
      setHour('00');
      setMinute('00');
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
     
      <ul className={styles['event-list']}>
        {events.sort((a, b) => a.startDatetime.localeCompare(b.startDatetime)).map((event, index) => (
          <li key={event.event_id} className={styles['event-item']} style={{ backgroundColor: `hsl(${(index * 50) % 360}, 100%, 85%)` }}>
            <span className={styles['event-time']}>{event.startDatetime.split('T')[1].slice(0, 5)}</span>
            {editIndex === index ? (
              <input
                className={styles['edit-input']}
                value={event.title}
                onChange={(e) => updateEvent(index, e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') finishEditing(index, e.target.value);
                }}
                onBlur={() => finishEditing(index, event.title)}
                autoFocus
              />
            ) : (
              <span className={styles['event-title']} onDoubleClick={() => setEditIndex(index)}>{event.title}</span>
            )}
            <span className={styles.options} onClick={() => setShowOptionsIndex(showOptionsIndex === index ? null : index)}>
              {editIndex === index ? (
                <button className={styles['finish-button']} onClick={() => finishEditing(index, event.title)}>완료</button>
              ) : '...'}
              {showOptionsIndex === index && editIndex !== index && (
                <div className={styles['dropdown-options']}>
                  <button className={styles['edit-btn']} onClick={() => setEditIndex(index)}>수정</button>
                  <button className={styles['delete-btn']} onClick={() => deleteEvent(index)}>삭제</button>
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
