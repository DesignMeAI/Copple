import React, { useState, useEffect } from "react";
import axios from 'axios';
import styles from "../styles/GoalPhoto.module.css";
import defaultImage from '../assets/noimg.png';

function GoalPhoto({ eventId }) {
  console.log('event_id:', eventId);

  const [data, setData] = useState({
    goalPhoto: null,
    goalTitle: '',
    startDatetime: '',
    endDatetime: ''
  });

  const tokenstring = document.cookie;
  const token = tokenstring.split("=")[1];

  useEffect(() => {
    if (eventId) {
      const goalUrl = `http://3.39.153.9:3000/goal/read/${eventId}`;

      axios.get(goalUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then((goalResponse) => {
        console.log('Goal API Response:', goalResponse.data);
        const { photoUrl, title, startDatetime, endDatetime } = goalResponse.data;
        setData({
          goalPhoto: photoUrl || defaultImage,
          goalTitle: title,
          startDatetime,
          endDatetime
        });
      })
      .catch((error) => {
        console.error('Error fetching goal data:', error);
      });
    }
  }, [eventId, token]);

  console.log('Rendered Data:', data);

  return (
    <div className={styles.goalPhoto}>
      <img src={data.goalPhoto} alt="Goal Thumbnail" />
      <div className={styles.overlay}>
        {data.goalTitle && (
          <div className={styles.title}>{data.goalTitle}</div>
        )}
        {data.startDatetime && data.endDatetime && (
          <div className={styles.date}>
            {data.startDatetime} ~ {data.endDatetime}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalPhoto;
