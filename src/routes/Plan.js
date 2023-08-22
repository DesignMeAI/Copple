import { useState } from "react";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";

function Plan(props) {

    const [enteredTitle, setEnteredTitle] = useState('');
    const [enteredDate, setEnteredDate] = useState('');
    const [enteredGoal, setEnteredGoal] = useState('');
    const [enteredAdress, setEnteredAdress] = useState('');
    const [enteredContent, setEnteredContent] = useState('');

    const titleChangeHandler = (event) => {
        setEnteredTitle(event.target.value);
    }

    const dateChangeHandler = (event) => {
        setEnteredDate(event.target.value);
    }

    const goalChangeHandler = (event) => {
        setEnteredGoal(event.target.value);
    }

    const adressChangeHandler = (event) => {
        setEnteredAdress(event.target.value);
    };
    const contentChangeHandler = (event) => {
        setEnteredContent(event.target.value);
    };

    const submitHandler = (event) => {
        event.preventDefault();

        const planData = {
            title: enteredTitle,
            goal: enteredGoal,
            date: new Date(enteredDate),
            adress: enteredAdress,
            content: enteredContent

        };

        props.onSavePlanData(planData);
        setEnteredTitle('');
        setEnteredGoal('')
        setEnteredAdress('');
        setEnteredDate('');
        setEnteredContent('');
    };

    return (
        <form onSubmit={submitHandler}>
            <div className={styles.container}>
                <div className={styles.flex}></div>
                <div className={styles.nav_container}>
                    <button className={styles.other_button}><Link to={`/goal`}>목표</Link></button>
                    <button className={styles.main_button}>일정</button>
                    <button className={styles.other_button}><Link to={`/todo`}>할 일</Link></button>
                    <button className={styles.save_button}>저장</button>
                </div>
                <div className={styles.input_container}>
                    <div className={styles.space}>
                        <label className={styles.label}>제목</label>
                        <input type="text" className={styles.input} value={enteredTitle} onChange={titleChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>기간</label>
                        <input type="text" className={styles.input} vlaue={enteredDate} onChange={dateChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>목표</label>
                        <input type="text" className={styles.input} value={enteredGoal} onChange={goalChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>장소</label>
                        <input type="text" className={styles.input} value={enteredAdress} onChange={adressChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>내용</label>
                        <input type="text" className={styles.input_large} value={enteredContent} onChange={contentChangeHandler}></input>
                    </div>


                </div></div></form>
    );
}
export default Plan;
