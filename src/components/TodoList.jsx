import React, { useState, useEffect } from "react";
import styles from "../css/TodoList.module.css";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [textAreaHeight, setTextAreaHeight] = useState("auto");

  useEffect(() => {
    const completedTasks = tasks.filter((task) => task.completed);
    const incompleteTasks = tasks.filter((task) => !task.completed);

    setTasks([...incompleteTasks, ...completedTasks]);
  }, [tasks]);

  const adjustTextAreaHeight = (event) => {
    const textArea = event.target;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
    setTextAreaHeight(`${textArea.scrollHeight}px`);
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const startEditing = (index) => {
    setEditingTask(index);
    setTimeout(() => {
      const textArea = document.querySelector(".task textarea");
      if (textArea) adjustTextAreaHeight({ target: textArea });
    }, 0);
  };

  const handleEdit = (e, index) => {
    const newTasks = [...tasks];
    newTasks[index].task = e.target.value;
    setTasks(newTasks);
  };

  const handleNewTaskChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleAddTask = (e) => {
    if (newTask.trim() && (e.key === "Enter" || e.type === "click")) {
      setTasks([...tasks, { task: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const deleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <div className={styles.todoList}>
      <div className={styles.addTask}>
        <input
          type="text"
          value={newTask}
          onChange={handleNewTaskChange}
          onKeyPress={handleAddTask}
          placeholder="할일을 입력하세요"
        />
        <button onClick={handleAddTask}>+</button>
      </div>
      {tasks.map((task, index) => (
        <div
          key={index}
          className={`task ${task.completed ? "completed" : ""}`}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(index)}
            />
            {editingTask === index ? (
              <textarea
                value={task.task}
                onChange={(e) => {
                  handleEdit(e, index);
                  adjustTextAreaHeight(e);
                }}
                onBlur={() => setEditingTask(null)}
                autoFocus
                style={{ height: textAreaHeight }}
              />
            ) : (
              <span onDoubleClick={() => startEditing(index)}>{task.task}</span>
            )}
          </div>
          <div>
            {editingTask === index ? (
              <button onClick={() => setEditingTask(null)}>완료</button>
            ) : (
              <>
                <button onClick={() => startEditing(index)}>수정</button>
                <button onClick={() => deleteTask(index)}>삭제</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TodoList;
