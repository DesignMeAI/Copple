import { Link, useNavigate } from "react-router-dom";
import Selectop from "../components/Select";
import axios from "axios";
import styles from "../css/Todo.module.css";
import { useRecoilValue, useRecoilState } from "recoil";
import { goalState } from "../atoms";
import { useState } from "react";

function Todo() {
  const selectedgoal = useRecoilValue(goalState);
  const navigate = useNavigate();
  const todoState = {
    title: "",
    isCompleted: "",
    goal: selectedgoal,
    location: "",
    content: "",
  };
  const [todoinfo, setTodoinfo] = useState(todoState);
  const { title, location, goal, content, isCompleted } = todoinfo;

  const SendTodo = async (data) => {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "post",
      url: "http://3.39.153.9:3000/event/create",
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: data.title,
        isCompleted: data.isCompleted,
        goal: selectedgoal,
        location: data.location,
        content: data.content,
      },
      withCredentials: false,
    }).then((response) => console.log(response));
  };

  const TitleHandler = (e) => {
    setTodoinfo({ ...todoinfo, title: e.target.value });
  };
  const LocationHandler = (e) => {
    setTodoinfo({ ...todoinfo, location: e.target.value });
  };
  const ContentHandler = (e) => {
    setTodoinfo({ ...todoinfo, content: e.target.value });
  };
  const IsCompletedHandler = (e) => {
    setTodoinfo({ ...todoinfo, isCompleted: e.target.value });
  };

  const onSubmit = async () => {
    await setTodoinfo({ ...todoinfo, goal: selectedgoal });
    setTimeout(() => {
      console.log(selectedgoal);
      SendTodo(todoinfo);
    }, 1500);
    navigate("/home");
    console.log(selectedgoal);
  };
  return (
    <div className={styles.Container}>
      <form onSubmit={onSubmit}>
        <div className={styles.Navbar}>
          <button className={styles.Btn}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.selected}>
            <Link to="/todo">할일</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/plan">일정</Link>
          </button>
          <div></div>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </div>
        <div className={styles.Tag}>제목</div>
        <div className={styles.Tag}>
          <input
            maxLength={20}
            value={title}
            onChange={TitleHandler}
            className={styles.Input}
          ></input>
        </div>
        <span></span>
        <div className={styles.Tag}>목표</div>
        <div className={styles.Tag}>
          <Selectop />
        </div>
        <div className={styles.Tag}>내용</div>
        <div className={styles.Tag}>
          <input
            style={{ height: "90px" }}
            value={content}
            onChange={ContentHandler}
            className={styles.Input}
          ></input>
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            maxLength={20}
            value={location}
            onChange={LocationHandler}
            className={styles.Input}
          ></input>
        </div>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>완료</div>
          <div className={styles.Tag}>
            <input
              className={styles.check}
              value={isCompleted}
              onChange={IsCompletedHandler}
              type="checkbox"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default Todo;
