import React, { useState } from "react";
import styles from "../css/Category.module.css";
import Timeline from "./Timeline";
import TodoList from "./TodoList";

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className={styles.centeredContainer}>
      <nav className={styles.leftContainer}>
        <ul>
          <li
            onClick={() => handleCategoryChange("일정")}
            className={styles.selectedCategory === "일정" ? "active" : ""}
          >
            일정 &nbsp;&nbsp;&nbsp;&nbsp;
          </li>
          <li
            onClick={() => handleCategoryChange("다음 할일")}
            className={
              styles.ReactselectedCategory === "다음 할일" ? "active" : ""
            }
          >
            할일
          </li>
          {/* Add more categories here */}
        </ul>
      </nav>
      <div className={styles.content}>
        {selectedCategory === "일정" && <Timeline />}
        {selectedCategory === "다음 할일" && <TodoList />}
      </div>
    </div>
  );
};

export default Category;
