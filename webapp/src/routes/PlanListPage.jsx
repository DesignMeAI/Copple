// PlanListPage.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import styles from "../styles/PlanList.module.css";
import GoalPhoto from "../components/GoalPhoto";
import GoalSchedule from "../components/GoalSchedule";
import { useLocation, useParams } from 'react-router-dom';

function PlanListPage() {
  const { state } = useLocation();
  const { event_id } = useParams();
  const [data, setData] = useState({ goalPhoto: '', goalTitle: '', schedules: [], tasks: [] });

  useEffect(() => {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];

    if (event_id) {
      const url = `http://3.39.153.9:3000/event/read/${event_id}`;

      axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });
    }
  }, [event_id]);

  return (
    <div className={styles.PlanListWrapper}>
      <div className={styles.PlanListContainer}>
        <div className={styles.goalPhoto}>
          <GoalPhoto eventId={state.event_id} />
        </div>
        <div className={styles.goalTitle}>
          <h2>{data.goalTitle}</h2>
        </div>
        <div className={styles.goalSchedule}>
    
        <GoalSchedule eventId={state.event_id} />   

        </div>
      </div>
    </div>
  );
}

export default PlanListPage;
