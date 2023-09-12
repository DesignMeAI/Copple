import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/CalendarThumbnail.module.css";

const exampleThumbnails = [
  {
    id: 1,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 2,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 3,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 4,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cEC_7c5ALeoFw8K3Q_ITqsEKgwGyTjHdZ-KI40qeHQ&s",
    title: "크리스마스 파티",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 5,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 6,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
  {
    id: 7,
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIESZemKqOkGscuPOQvCDfGp4ypaObjz3NLLGCSC3d4GqjvOuu0e-d0RVBA&s=8",
    title: "미국여행",
    period: "2023/12/20 - 12/15",
  },
];
function ThumbnailList() {
  const navigate = useNavigate();
  const goToGoalDetails = (goalId) => {
    navigate(`/goal-details/${goalId}`);
  };

  return (
    <div className={styles.ThumbnailContainer}>
      {exampleThumbnails.map((thumbnail, index) => (
        <div
          key={index}
          className={styles.bigBox}
          onClick={() => goToGoalDetails(thumbnail.id)}
        >
          <div className={styles.thumbnailBox}>
            <img
              src={thumbnail.imageURL}
              alt={`Thumbnail ${index + 1}`}
              className={styles.thumbnail}
            />
          </div>
          <div className={styles.goalInfo}>
            <span className={styles.goalTitle}>{thumbnail.title}</span>
            <span className={styles.goalPeriod}>{thumbnail.period}</span>
          </div>
        </div>
      ))}
      <button
        className={styles.loadMore}
        onClick={() => navigate("/create-goal")}
      >
        +
      </button>
    </div>
  );
}

export default ThumbnailList;
