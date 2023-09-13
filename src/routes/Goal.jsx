import { useForm } from "react-hook-form";
import styles from "../css/Goal.module.css";
import { v4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { infoState } from "../atoms.js";
import docClient from "../components/client";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

function Goal() {
  const changeHandler = (e) => {
    console.log(e);
  };
  const [info, setInfo] = useRecoilState(infoState);
  const navigate = useNavigate();
  const user_uuid2 = v4();
  async function SendGoal(data) {
    const command = new PutCommand({
      TableName: "Records",
      Item: {
        UserId: info.uuid,
        EventId: `Goal${user_uuid2}`,
        UserName: info.id,
        Name: info.name,
        Title: data.title,
        StartDate: data.startDate,
        EndDate: data.endDate,
        Address: data.address,
        Content: data.content,
        isDone: data.isDone,

        // Picture: data.picture
      },
    });
    const response = await docClient.send(command);
    console.log(command);
  }
  const { register, handleSubmit, formState } = useForm();
  const onSubmit = (data) => {
    SendGoal(data).then(navigate("/main"));
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
        <input
          maxLength={20}
          className={styles.Input}
          {...register("title", { required: "Please write a title" })}
          placeholder={formState.errors.title && formState.errors.title.message}
        />

        <div className={styles.Tag}>시작일</div>
        <input
          type="date"
          className={styles.Input}
          {...register("startDate", { required: "Please write a period" })}
          placeholder={
            formState.errors.period && formState.errors.startDate.message
          }
        />
        <div className={styles.Tag}>종료일</div>
        <input
          type="date"
          className={styles.Input}
          {...register("endDate", { required: "Please write a period" })}
          placeholder={
            formState.errors.period && formState.errors.endDate.message
          }
        />
        <div className={styles.Tag}>장소</div>
        <input className={styles.Input} {...register("address")} />
        <div className={styles.Tag}>내용</div>
        <input
          className={styles.Input}
          {...register("content", { required: "Please write a content" })}
          placeholder={
            formState.errors.content && formState.errors.content.message
          }
        />
        <div className={styles.Tag}>완료</div>
        <div style={{ width: "100%" }}>
          <input
            onClick={changeHandler}
            className={styles.check}
            type="checkbox"
            {...register("isDone")}
          />
        </div>
      </form>
    </div>
  );
}

export default Goal;
