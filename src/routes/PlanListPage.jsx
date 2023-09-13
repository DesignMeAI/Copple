import React from "react";
import styles from "../css/PlanList.module.css";
import GoalPhoto from "../components/GoalPhoto";
import GoalSchedule from "../components/Schedule";

function PlanListPage() {
  return (
    <div className={styles.PlanListWrapper}>
      <div className={styles.PlanListContainer}>
        <div className={styles.goalPhoto}>
          <GoalPhoto />
        </div>
        <div className={styles.goalSchedule}>
          <GoalSchedule />
        </div>
      </div>
    </div>
  );
}

export default PlanListPage;
