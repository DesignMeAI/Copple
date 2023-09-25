import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/TodoList.module.css";
import axios from "axios";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState({});
  const containerRef = useRef(null);
  const [showOptions, setShowOptions] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingMode, setEditingMode] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        fetchMoreTasks();
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const fetchTasksAndGoals = async () => {
      try {
        const tokenString = document.cookie;
        const token = tokenString.split("=")[1];

        const [tasksResponse, goalsResponse] = await Promise.all([
          axios.get("http://3.39.153.9:3000/todo/read", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("http://3.39.153.9:3000/goal/read", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (Array.isArray(tasksResponse.data)) setTasks(tasksResponse.data);
        if (Array.isArray(goalsResponse.data)) {
          const goalData = {};
          goalsResponse.data.forEach((goal) => {
            goalData[goal.event_id] = goal.title;
          });
          setGoals(goalData);
        }
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    };
    fetchTasksAndGoals();
  }, []);

  const goalGroups = tasks.reduce((acc, task) => {
    if (task.goal) {
      if (!acc[task.goal]) acc[task.goal] = [];
      acc[task.goal].push(task);
    } else {
      if (!acc.noGoal) acc.noGoal = [];
      acc.noGoal.push(task);
    }
    return acc;
  }, {});

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.event_id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
  };

  const toggleOptions = (id) => setShowOptions(showOptions === id ? null : id);

  const editTask = (id) => {
    const taskToEdit = tasks.find((task) => task.event_id === id);
    if (taskToEdit) {
      setEditingText(taskToEdit.title);
      setShowOptions(null);
      setEditingMode(id);
    }
  };

  const handleEditKeyUp = (event, id) => {
    if (event.key === "Enter") {
      saveEditedTask(id);
    }
  };

  const saveEditedTask = async (id) => {
    try {
      const tokenString = document.cookie;
      const token = tokenString.split("=")[1];
  
      const response = await axios.put(
        `http://3.39.153.9:3000/event/update/${id}`,
        {
          title: editingText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const updatedTasks = tasks.map((task) =>
        task.event_id === id ? { ...task, title: editingText } : task
      );
      setTasks(updatedTasks);
      console.log(updatedTasks);
  
      setEditingText("");
      setEditingMode(null);
      console.log(editingMode);
    } catch (error) {
      console.error("할일 업데이트 중 오류 발생:", error);
    }
  };
  

  const cancelEditing = () => {
    setEditingText("");
    setEditingMode(null);
    closeModal();
  };

  const deleteTask = async (id) => {
    if (window.confirm('이 이벤트를 정말로 삭제하시겠습니까?')){
    try {
      const tokenString = document.cookie;
      const token = tokenString.split("=")[1];
  
      const response = await axios.delete(`http://3.39.153.9:3000/todo/delete/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      setTasks(tasks.filter((task) => task.event_id !== id));
      closeModal();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }};

  const closeModal = () => {
    setShowOptions(null);
    setEditingMode(null);
  };




  const fetchMoreTasks = async () => {
    try {
         const tokenString = document.cookie;
  const token = tokenString.split("=")[1];
  const response = await axios.get(
    `http://3.39.153.9:3000/todo/read?page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (Array.isArray(response.data)) {
    setTasks((prevTasks) => [...prevTasks, ...response.data]);
    setPage((prevPage) => prevPage + 1); // 페이지 번호 증가
  }
} catch (error) {
  console.error("더 많은 작업을 가져오는 중 오류 발생:", error);
} finally {
  setIsLoading(false); // 데이터 로딩 상태 해제
}
  };

  const renderTask = (task) => (
    <div key={task.event_id} className={`${styles.task} ${task.isCompleted ? styles.completed : ""}`}>
      <div className={styles.checkboxContainer}>
        <input type="checkbox" checked={task.isCompleted} onChange={() => toggleTask(task.event_id)} />
      </div>
  
      {editingMode === task.event_id ? (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className={styles.editInput}
            onKeyUp={(e) => handleEditKeyUp(e, task.event_id)}
          />
          <button className={styles.todolistbutton2} onClick={() => saveEditedTask(task.event_id)}>완료</button>
          <button className={styles.todolistbutton2} onClick={cancelEditing}>취소</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
          <span className={styles.taskText}>{task.title}</span>
          <button className={styles.todolistbutton1} onClick={(e) => { e.stopPropagation(); toggleOptions(task.event_id); }}>...</button>
    
          {showOptions === task.event_id && (
            <div className={styles.optionButtons}>
              <button className={styles.todolistbutton} onClick={(e) => { e.stopPropagation(); editTask(task.event_id); }}>수정</button>
              <button className={styles.todolistbutton} onClick={(e) => { e.stopPropagation(); deleteTask(task.event_id); }}>삭제</button>  
            </div>
          )}
        </div>
      )}
    </div>
    
  );
  
  return (
    <div className={styles.todoList} ref={containerRef}>
      {goalGroups.noGoal && goalGroups.noGoal.length > 0 && (
        <div>
          <div className={styles.noGoalTitle}></div>
          {goalGroups.noGoal.map((task) => renderTask(task))}
        </div>
      )}
      {Object.keys(goalGroups).map((goal) => {
        if (goal === "noGoal") return null; 
        return (
          <div key={goal}>
            <div className={styles.goalTitle}>{goals[goal]}</div>
            {goalGroups[goal].map((task) => renderTask(task))}
          </div>
        );
      })}
    </div>
  );
}

export default TodoList;
