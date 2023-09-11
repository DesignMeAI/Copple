import styles from "./Plan.module.css";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";
import Selectop from "../components/Select";
import { Link } from "react-router-dom";
import { infoState } from "../atoms.js";
import { useRecoilValue, useRecoilState } from "recoil";
import { goalState } from "../atoms";
import docClient from "../components/client";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
function Plan() {
  const [info, setInfo] = useRecoilState(infoState);
  const goal = useRecoilValue(goalState);
  const user_uuid2 = v4();
  async function SendPlan(data) {
    const command = new PutCommand({
      TableName: "Records",
      Item: {
        UserId: info.uuid,
        EventId: `Plan${user_uuid2}`,
        UserName: info.id,
        Name: info.name,
        Goal: goal,
        Title: data.title,
        StartDate: data.startDate,
        EndDate: data.endDate,
        Address: data.address,
      },
    });
    const response = await docClient.send(command);
    console.log(response);
  }
  const onSubmit = (data) => {
    SendPlan(data);
  };

  const { register, handleSubmit } = useForm();
  return (
    <div className={styles.Container}>
      <form className={styles.Form} onSubmit={handleSubmit(onSubmit)}>
        <nav className={styles.navbar}>
          <button className={styles.btn}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.btn}>
            <Link to="/todo">할일</Link>
          </button>
          <button className={styles.selected}>
            <Link to="/plan">일정</Link>
          </button>
          <div></div>
          <button className={styles.btn} type="submit">
            저장
          </button>
        </nav>
        <div>제목</div>
        <input
          maxLength={20}
          {...register("title", { required: "Please write title" })}
        ></input>
        <div>시작일</div>
        <input
          type="date"
          {...register("startDate", { required: "Please write period" })}
        ></input>
        <div>종료일</div>
        <input
          type="date"
          {...register("endDate", { required: "Please write period" })}
        ></input>
        <div>목표</div>
        <Selectop />
        <div>장소</div>
        <input
          {...register("address", { required: "Please write address" })}
        ></input>
      </form>
    </div>
  );
}

export default Plan;
