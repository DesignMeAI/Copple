import React from 'react';
import styles from'../styles/PlanList.module.css';

import GoalPhoto from '../components/GoalPhoto';
import GoalSchedule from '../components/GoalSchedule';

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
