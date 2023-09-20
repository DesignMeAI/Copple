import React, { useState } from "react";
import styles from "../styles/Category.module.css";
import Timeline from "./Timeline";
import TodoList from "./TodoList";
import { useCalendar } from "../routes/MainPage";

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("일정");
  const { dataForSelectedDate } = useCalendar();
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // dataForSelectedDate가 없을 수 있으므로 초기 값을 null로 설정
  const events = (dataForSelectedDate && dataForSelectedDate.events) || [];
  const todos = (dataForSelectedDate && dataForSelectedDate.todos) || [];

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
        {selectedCategory === "일정" && <Timeline events={events} />}
        {selectedCategory === "할일" && <TodoList todos={todos} />}
      </div>
    </div>
  );
};

export default Category;
