import styles from "../css/Plan.module.css";
import Selectop from "../components/Select";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { goalState } from "../atoms";
import axios from "axios";
import { useState } from "react";

function Plan() {
  const selectedgoal = useRecoilValue(goalState);
  const navigate = useNavigate();
  const planState = {
    title: "",
    startDatetime: "",
    endDatetime: "",
    goal: selectedgoal,
    location: "",
    content: "",
  };
  const [planinfo, setPlaninfo] = useState(planState);
  const { title, endDatetime, startDatetime, location, goal, content } =
    planinfo;

  const SendPlan = async (data) => {
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
        startDatetime: data.startDatetime,
        endDatetime: data.endDatetime,
        goal: data.goal,
        location: data.location,
        content: data.content,
      },
      withCredentials: false,
    }).then((response) => console.log(response));
  };
  const TitleHandler = (e) => {
    setPlaninfo({ ...planinfo, title: e.target.value });
  };
  const startDatetimeHandler = (e) => {
    setPlaninfo({ ...planinfo, startDatetime: e.target.value });
  };
  const endDatetimeHandler = (e) => {
    setPlaninfo({ ...planinfo, endDatetime: e.target.value });
  };
  const LocationHandler = (e) => {
    setPlaninfo({ ...planinfo, location: e.target.value });
  };
  const ContentHandler = (e) => {
    setPlaninfo({ ...planinfo, content: e.target.value });
  };
  //에러나는 함수(try catch가 없을 때)
  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   await setPlaninfo({ ...planinfo, goal: selectedgoal });
  //   await SendPlan(planinfo);
  //   navigate("/home");
  //   console.log(selectedgoal);
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    await setPlaninfo({ ...planinfo, goal: selectedgoal });

    try {
      await SendPlan(planinfo);
      navigate("/home");
      console.log(selectedgoal);
    } catch (error) {
      console.error("SendPlan 함수 호출 중 에러 발생:", error);
    }
  };

  return (
    <div className={styles.Container}>
      <form className={styles.Form} onSubmit={onSubmit}>
        <nav className={styles.Navbar}>
          <button className={styles.Btn}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/todo">할일</Link>
          </button>
          <button className={styles.Selected}>
            <Link to="/plan">일정</Link>
          </button>
          <div></div>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </nav>
        <div className={styles.Tag}>제목</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            value={title}
            onChange={TitleHandler}
            maxLength={20}
          ></input>
        </div>
        <div className={styles.Tag}>시작일</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            value={startDatetime}
            onChange={startDatetimeHandler}
            type="date"
          ></input>
        </div>
        <div className={styles.Tag}>종료일</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            value={endDatetime}
            onChange={endDatetimeHandler}
            type="date"
          ></input>
        </div>
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
            className={styles.Input}
            value={location}
            onChange={LocationHandler}
          ></input>
        </div>
      </form>
    </div>
  );
}

export default Plan;
