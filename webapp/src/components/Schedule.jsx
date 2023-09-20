import React, { useState } from "react";
import styles from "../css/Schedule.module.css";

function GoalSchedule() {
  const [selectedCategory, setSelectedCategory] = useState("일정");
  const schedules = [
    {
      day: 1,
      schedules: [
        { title: "인천 → 방콕", time: "02:00am - 08:32am" },
        { title: "왕궁, 왓포 사원 방문 ", time: "11:00am - 02:00pm" },
        { title: "저녁이야~~", time: "18:00" },
      ],
    },
    {
      day: 1,
      schedules: [
        { title: "인천 → 방콕", time: "02:00am - 08:32am" },
        { title: "왕궁, 왓포 사원 방문 ", time: "11:00am - 02:00pm" },
        { title: "저녁이야~~", time: "18:00" },
      ],
    },
    {
      day: 2,
      schedules: [
        { title: "2일차 일정", time: "11:00" },
        { title: "인천 → 방콕", time: "02:00am - 08:32am" },
        { title: "왕궁, 왓포 사원 방문 ", time: "11:00am - 02:00pm" },
        { title: "저녁이야~~", time: "18:00" },
      ],
    },
    {
      day: 3,
      schedules: [
        { title: "3일차 일정", time: "11:00" },
        { title: "인천 → 방콕", time: "02:00am - 08:32am" },
        { title: "왕궁, 왓포 사원 방문 ", time: "11:00am - 02:00pm" },
        { title: "저녁이야~~", time: "18:00" },
      ],
    },
  ];

  return (
    <div>
      <div className={styles.categoryRow}>
        <div>
          {" "}
          {/* 이 div를 추가하여 일정과 할일 버튼을 함께 묶기*/}
          <button
            className={selectedCategory === "일정" ? "active" : "nonactive"}
            onClick={() => setSelectedCategory("일정")}
          >
            일정
          </button>
          <button
            className={selectedCategory === "할일" ? "active" : "nonactive"}
            onClick={() => setSelectedCategory("할일")}
          >
            할일
          </button>
        </div>
        <button
          className={
            selectedCategory === "추가" ? "active blue-button" : "blue-button"
          }
          onClick={() => setSelectedCategory("추가")}
        >
          + 추가
        </button>
      </div>
      {selectedCategory === "일정" && (
        <div className={styles.scheduleContainer}>
          {schedules.map((daySchedule, index) => (
            <div key={index} className={styles.daySchedule}>
              <h3>{daySchedule.day}일 차</h3>
              {daySchedule.schedules.map((schedule, idx) => (
                <div key={idx} className={styles.scheduleBox}>
                  <div>{schedule.title}</div> {/* 일정 상세 내용 */}
                  <div>{schedule.time}</div> {/* 시간 */}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {/* '할일'과 '추가'에 해당하는 내용은 필요에 따라 추가 */}
    </div>
  );
}

export default GoalSchedule;
