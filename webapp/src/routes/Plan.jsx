import styles from "../css/Plan.module.css";
import { useForm } from "react-hook-form";
import Selectop from "../components/Select";
import { Link } from "react-router-dom";
import { infoState } from "../atoms.js";
import { useRecoilValue, useRecoilState } from "recoil";
import { goalState } from "../atoms";
import axios from "axios";

function Plan() {
  const goal = useRecoilValue(goalState);
  const SendEvent = async (data) => {
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
        startDatetime: data.startDate,
        endDatetime: data.endDate,
        goal: goal,
        location: data.address,
        content: data.content,
      },
      withCredentials: false,
    }).then((response) => console.log(response));
  };

  const onSubmit = (data) => {
    SendEvent(data);
  };

  const { register, handleSubmit } = useForm();
  return (
    <div className={styles.Container}>
      <form className={styles.Form} onSubmit={handleSubmit(onSubmit)}>
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
            maxLength={20}
            {...register("title", { required: "Please write title" })}
          ></input>
        </div>
        <div className={styles.Tag}>시작일</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            type="date"
            {...register("startDate", { required: "Please write period" })}
          ></input>
        </div>
        <div className={styles.Tag}>종료일</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            type="date"
            {...register("endDate", { required: "Please write period" })}
          ></input>
        </div>
        <div className={styles.Tag}>목표</div>
        <div className={styles.Tag}>
          <Selectop />
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            {...register("address", { required: "Please write address" })}
          ></input>
        </div>
      </form>
    </div>
  );
}

export default Plan;
