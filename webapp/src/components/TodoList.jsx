import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TodoList.module.css';
import PropTypes from 'prop-types';

function TodoList({ todos, selectedDate }) {
  const mockData = [
    { id: 1, task: '빨래하기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
    { id: 2, task: '코끼리타기', completed: true, hasGoal: true, goalTitle: '태국여행', date: '2023-09-19' },
    { id: 3, task: '코테준비하기', completed: false, hasGoal: true, goalTitle: 'Coding', date: '2023-09-19' },
    { id: 4, task: '책읽기', completed: true, hasGoal: true, goalTitle: 'Reading', date: '2023-09-19' },
    { id: 5, task: '책사기', completed: false, hasGoal: true, goalTitle: 'Reading', date: '2023-09-20' },
    { id: 6, task: '달리기', completed: false, hasGoal: true, goalTitle: 'Fitness', date: '2023-09-20' },
    { id: 7, task: '운동하기', completed: false, hasGoal: true, goalTitle: 'Fitness', date: '2023-09-19' },
    { id: 8, task: '밥먹기', completed: true, hasGoal: true, goalTitle: 'Cooking', date: '2023-09-19' },
    { id: 9, task: '쿠키만들기', completed: false, hasGoal: true, goalTitle: 'Cooking', date: '2023-09-20' },
    { id: 10, task: '쿠키만들기', completed: false, hasGoal: true, goalTitle: 'Cooking', date: '2023-09-20' },
    { id: 11, task: '쿠키만들기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
    { id: 12, task: '쿠키만들기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
    { id: 13, task: '쿠키만들기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
    { id: 14, task: '쿠키만들기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
    { id: 15, task: '쿠키만들기', completed: false, hasGoal: false, goalTitle: null, date: '2023-09-20' },
  ];

  const [tasks, setTasks] = useState(todos || mockData);

  const containerRef = useRef(null);
  useEffect(() => {
    fetch('https://3.39.153.9:3000/todos', {
      headers: {
        'Authorization': `Bearer ${ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJpbiIsImlhdCI6MTY5NTE1MzEzNiwiZXhwIjoxNjk1MTg5MTM2fQ.crjHNrB0mgbsLrbnEbmrBuFeAhhrIRBt4G1m2qHYHmc"}`  // YOUR_ACCESS_TOKEN을 실제 토큰 값으로 바꾸세요.
      }
    })
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(() => setTasks(mockData));
  }, []);

  useEffect(() => {
    if (todos && todos.length > 0) {
      setTasks(todos);
    } else {
      setTasks(mockData);
    }
  }, [todos]);

  useEffect(() => {
    if (selectedDate) {
      const filteredTasks = tasks.filter(task => task.date === selectedDate);
      setTasks(filteredTasks);
    }
  }, [selectedDate]);

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      console.log('End of scroll, load more data here if available');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task));
    setTasks(updatedTasks);
  };

  const goalGroups = tasks.reduce((acc, task) => {
    if (task.hasGoal) {
      if (!acc[task.goalTitle]) acc[task.goalTitle] = [];
      acc[task.goalTitle].push(task);
    }
    return acc;
  }, {});

  const [showOptions, setShowOptions] = useState(null);
  const toggleOptions = (id) => {
    if (showOptions === id) {
      setShowOptions(null);
    } else {
      setShowOptions(id);
    }
  };

  const [editing, setEditing] = useState(null);
  const [editingText, setEditingText] = useState('');

  const editTask = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, task: editingText } : task
    );
    setTasks(updatedTasks);
    setEditing(null);
    setEditingText('');
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  };

  const renderTask = (task) => (
    <div key={task.id} className={`${styles.task} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.checkboxContainer}>
        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
        <span className={styles.checkmark}>✔</span>
      </div>
      <span className={styles.taskText}>{task.task}</span>
      <button onClick={() => toggleOptions(task.id)}>...</button> 
      {showOptions === task.id && (
        <div>
          <button>Edit</button>
          <button>Delete</button> 
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.todoList} ref={containerRef} style={{ height: '400px', overflowY: 'auto' }}>
      <div className={styles.noGoalTasks}>
        {tasks.filter(task => !task.hasGoal).map(task => renderTask(task))}
      </div>
      <div className={styles.goalTasks}>
        {Object.keys(goalGroups).map(goalTitle => (
          <div key={goalTitle}>
            <div className={styles.goalTitle}>{` ${goalTitle}`}</div>
            {goalGroups[goalTitle].map(task => renderTask(task))}
          </div>
        ))}
      </div>
    </div>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      task: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      hasGoal: PropTypes.bool.isRequired,
      goalTitle: PropTypes.string,
    })
  ),
};

export default TodoList;
