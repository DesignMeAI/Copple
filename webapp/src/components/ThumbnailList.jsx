import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CalendarThumbnail.module.css";
import { useCalendar } from "../routes/MainPage";
import axios from "axios";
import { infoState, nameState } from "../atoms";
import { useRecoilValue } from "recoil";

function ThumbnailList({ goals: initialGoals }) {
  const { selectedDate, dataForSelectedDate } = useCalendar();
  const name = useRecoilValue(nameState);
  const info = useRecoilValue(infoState);
  const navigate = useNavigate();
  const [goals, setGoals] = useState(initialGoals || []);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const tokenString = document.cookie;
        const token = tokenString.split("=")[1];

        const response = await axios.get("http://3.39.153.9:3000/goal/read", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setGoals(response.data);
        } else {
          console.error("Received data is not an array");
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    }

    fetchGoals();
  }, []);

  const goToPlanList = () => {
    navigate("/planlist");
  };

  return (
    <div className={styles.CalendarThumbnailContainer}>
      {Array.isArray(goals)
        ? goals.map((goal, index) => (
            <div
              key={index}
              className={styles.CalendarThumbnailbigBox}
              onClick={goToPlanList}
            >
              <div className={styles.CalendarThumbnailthumbnailBox}>
                <img
                  src={goal.photoUrl}
                  alt={`Goal ${goal.title}`}
                  className={styles.CalendarThumbnailthumbnail}
                />
              </div>
              <div className={styles.CalendarThumbnailgoalInfo}>
                <span className={styles.CalendarThumbnailgoalTitle}>
                  {goal.title}
                </span>
                <span
                  className={styles.CalendarThumbnailgoalPeriod}
                >{`${goal.startDatetime} - ${goal.endDatetime}`}</span>
              </div>
            </div>
          ))
        : null}
      <button
        className={styles.CalendarThumbnailloadMore}
        onClick={() => navigate("/goal")}
      >
        +
      </button>
    </div>
  );
}

export default ThumbnailList;
