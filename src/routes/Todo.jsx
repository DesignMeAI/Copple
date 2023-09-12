import { Link } from "react-router-dom";
import Selectop from "../components/Select";
import { useForm } from "react-hook-form";
import styles from "../css/Todo.module.css";
import { v4 } from "uuid";
import { useRecoilValue, useRecoilState } from "recoil";
import { goalState, infoState } from "../atoms";
import docClient from "../components/client";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

function Todo() {
  const [info, setInfo] = useRecoilState(infoState);
  const goal = useRecoilValue(goalState);
  const user_uuid2 = v4();
  async function SendTodo(data) {
    const command = new PutCommand({
      TableName: "Records",
      Item: {
        UserId: info.uuid,
        EventId: `Todo${user_uuid2}`,
        UserName: info.id,
        Name: info.name,
        Goal: goal,
        Title: data.title,
        Content: data.content,
        isDone: data.isDone,
      },
    });
    const response = await docClient.send(command);
    console.log(response);
  }

  const { register, handleSubmit, formState } = useForm();
  const onSubmit = (data) => {
    SendTodo(data);
  };
  return (
    <div className={styles.Container}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <input
          maxLength={20}
          className={styles.Input}
          {...register("title", { required: "Please write title" })}
          placeholder={formState.errors.title && formState.errors.title.message}
        ></input>
        <span></span>
        <div className={styles.Tag}>목표</div>
        <Selectop />
        <div className={styles.Tag}>내용</div>
        <input
          className={styles.Input}
          {...register("content", { required: "Please write contents" })}
          placeholder={
            formState.errors.content && formState.errors.content.message
          }
        ></input>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>완료</div>
          <input
            className={styles.check}
            type="checkbox"
            {...register("isDone")}
          />
        </div>
      </form>
    </div>
  );
}

export default Todo;
