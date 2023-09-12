import React from "react";
import WeeklyCalendar from "../components/WeeklyCalendar.jsx";
import CalendarThumbnail from "../components/CalendarThumbnail.jsx";
import styles from "../css/MainPage.module.css";
import Category from "../components/Category.jsx";
const thumbnails = [
  { imageURL: "../assets/images/image1.jpg" },
  { imageURL: "../assets/images/image2.jpg" },
  { imageURL: "../assets/images/image1.jpg" },
  { imageURL: "../assets/images/image2.jpg" },
  { imageURL: "../assets/images/image1.jpg" },
  { imageURL: "../assets/images/image2.jpg" },
  { imageURL: "../assets/images/image1.jpg" },
  { imageURL: "../assets/images/image2.jpg" },
  { imageURL: "../assets/images/image1.jpg" },
  { imageURL: "../assets/images/image2.jpg" },
];

const MainPage = () => {
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.mainContainer}>
        <div className={styles.mainweeklyCalendar}>
          <WeeklyCalendar />
        </div>
        <div className={styles.mainThumbnails}>
          <CalendarThumbnail thumbnails={thumbnails} />
        </div>
        <div className={styles.scheduleTodoRow}>
          <Category />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
