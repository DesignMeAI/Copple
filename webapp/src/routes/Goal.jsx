import { useForm } from "react-hook-form";
import styles from "../css/Goal.module.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import { goalIdState, modeState } from "../atoms";

const SendGoal = async (data) => {
  const tokenstring = document.cookie;
  const token = tokenstring.split("=")[1];
  await axios({
    method: "post",
    url: "http://3.39.153.9:3000/goal/create",
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
    data: {
      title: data.title,
      startDatetime: data.startDate,
      endDatetime: data.endDate,
      location: data.address,
      content: data.content,
    },
    withCredentials: false,
  }).then((response) => console.log(response));
};

function Goal() {
  const [history, setHistory] = useState({});
  const navigate = useNavigate();
  const [mode, setMode] = useRecoilState(modeState);
  const [goalId, setGoalId] = useRecoilState(goalIdState);
  const getGoalData = async (event_id) => {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "GET",
      url: `http://3.39.153.9:3000/goal/read/${event_id}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (mode === "update") {
        setHistory(response.data);
      }
    });
  };
  const changeHandler = (e) => {
    console.log(e);
  };
  useEffect(() => {
    getGoalData(goalId);
  }, []);
  const { register, handleSubmit, formState } = useForm();
  const onSubmit = (data) => {
    SendGoal(data).then(navigate("/home"));
  };
  return (
    <div className={styles.Container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.Navbar}>
          <button className={styles.selected}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.Btn}>
            <Link to={"/todo"}>할일</Link>
          </button>
          <button className={styles.Btn}>
            <Link to={"/plan"}>일정</Link>
          </button>
          <div></div>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </div>
        <div className={styles.Tag}>제목</div>
        <div className={styles.Tag}>
          <input
            value={history?.title || null}
            maxLength={20}
            className={styles.Input}
            {...register("title", { required: "Please write a title" })}
            placeholder={
              formState.errors.title && formState.errors.title.message
            }
          />
        </div>

        <div className={styles.Tag}>시작일</div>
        <div className={styles.Tag}>
          <input
            value={history?.startDatetime || null}
            type="text"
            className={styles.Input}
            {...register("startDate", { required: "Please write a period" })}
            placeholder={
              formState.errors.period && formState.errors.startDate.message
            }
          />
        </div>
        <div className={styles.Tag}>종료일</div>
        <div className={styles.Tag}>
          <input
            value={history?.endDatetime || null}
            type="text"
            className={styles.Input}
            {...register("endDate", { required: "Please write a period" })}
            placeholder={
              formState.errors.period && formState.errors.endDate.message
            }
          />
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            value={history?.location || null}
            className={styles.Input}
            {...register("address")}
          />
        </div>
        <div className={styles.Tag}>내용</div>
        <div className={styles.Tag}>
          <input
            value={history?.content || null}
            className={styles.Input}
            {...register("content", { required: "Please write a content" })}
            placeholder={
              formState.errors.content && formState.errors.content.message
            }
          />{" "}
        </div>
        <div className={styles.Tag}>사진</div>
        <input type="file" {...register("image")} />
        <div className={styles.Tag}>완료</div>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>
            <input
              disabled={mode === "update" ? false : history.isCompleted}
              onClick={changeHandler}
              className={styles.check}
              type="checkbox"
              {...register("isDone")}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default Goal;
