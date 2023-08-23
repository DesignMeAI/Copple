import { Link } from "react-router-dom";
import Selectop from "../components/Select"
import { useForm } from "react-hook-form";
import styles from "./Todo.module.css"
import { useRecoilValue } from "recoil";
import { goalState } from "../components/atoms";

function Todo() {
    const goals = useRecoilValue(goalState);
    const { register, handleSubmit, formState } = useForm();
    const onSubmit = (data) => {
        console.log(data, goals)
    }
    console.log(goals)
    return (
        <div className={styles.Container}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.Navbar}>
                    <button className={styles.Btn}><Link to='/goal'>목표</Link></button>
                    <button className={styles.selected}><Link to='/todo'>할일</Link></button>
                    <button className={styles.Btn}><Link to='/plan'>일정</Link></button>
                    <div></div>
                    <button className={styles.Btn} type="submit">저장</button>
                </div>
                <div className={styles.Tag}>제목</div>
                <input className={styles.Input} {...register("title", { required: "Please write title" })} placeholder={formState.errors.title && formState.errors.title.message}></input>
                <span></span>
                <div className={styles.Tag}>목표</div>
                <Selectop />
                <div className={styles.Tag}>장소</div>
                <input className={styles.Input}{...register("address",)}></input>
                <div className={styles.Tag}>내용</div>
                <input className={styles.Input} {...register("content", { required: "Please write contents" })} placeholder={formState.errors.content && formState.errors.content.message}></input>
            </form>
        </div>
    )
}

export default Todo;




