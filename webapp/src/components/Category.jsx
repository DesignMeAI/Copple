import React, { useState, useEffect } from "react";
import styles from "../styles/Category.module.css";
import Timeline from "./Timeline";
import TodoList from "./TodoList";
import { useRecoilValue } from 'recoil';
import { eventsPropState } from '../atoms';

const Category = ({ dataForSelectedDate }) => {
  const [selectedCategory, setSelectedCategory] = useState("일정");

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const eventsProp = useRecoilValue(eventsPropState);

  return (
    <div className={styles.centeredContainer}>
      <nav className={styles.leftContainer}>
        <ul>
          <li
            onClick={() => handleCategoryChange("일정")}
            className={selectedCategory === "일정" ? styles.active : ""}
          >
            일정 &nbsp;&nbsp;&nbsp;&nbsp;
          </li>
          <li
            onClick={() => handleCategoryChange("할일")}
            className={selectedCategory === "할일" ? styles.active : ""}
          >
            할일
          </li>
        </ul>
      </nav>
      <div className={styles.content}>
        {selectedCategory === "일정" && <Timeline eventsProp={eventsProp} />} {/* 여기에서 props로 받은 events를 사용합니다. */}
        {selectedCategory === "할일" && <TodoList todos={(dataForSelectedDate && dataForSelectedDate.todos) || []} />}
      </div>
    </div>
  );
};

export default Category;
