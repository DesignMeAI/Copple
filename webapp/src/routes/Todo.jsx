import { Link } from "react-router-dom";
import Selectop from "../components/Select";
import { useForm } from "react-hook-form";
import styles from "../css/Todo.module.css";
import { useRecoilValue, useRecoilState } from "recoil";
import { goalState, infoState } from "../atoms";

function Todo() {
  const [info, setInfo] = useRecoilState(infoState);
  const goal = useRecoilValue(goalState);

  const { register, handleSubmit, formState } = useForm();
  const onSubmit = (data) => {};
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
        <div className={styles.Tag}>
          <input
            maxLength={20}
            className={styles.Input}
            {...register("title", { required: "Please write title" })}
            placeholder={
              formState.errors.title && formState.errors.title.message
            }
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
            className={styles.Input}
            {...register("content", { required: "Please write contents" })}
            placeholder={
              formState.errors.content && formState.errors.content.message
            }
          ></input>
        </div>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>완료</div>
          <div className={styles.Tag}>
            <input
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

export default Todo;
