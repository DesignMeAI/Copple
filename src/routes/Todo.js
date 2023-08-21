import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import Selectop from "../components/Select"


function Todo(props) {

    const [enteredTitle, setEnteredTitle] = useState('');
    const [enteredGoal, setEnteredGoal] = useState('');
    const [enteredAdress, setEnteredAdress] = useState('');
    const [enteredContent, setEnteredContent] = useState('');


    const titleChangeHandler = (event) => {
        setEnteredTitle(event.target.value);
    }

    const goalChangeHandler = (data) => {
        setEnteredGoal(data);
    }

    const adressChangeHandler = (event) => {
        setEnteredAdress(event.target.value);
    };
    const contentChangeHandler = (event) => {
        setEnteredContent(event.target.value);
    };
    const changeHandler = (data) => {
        setEnteredGoal(data);
    }




    const submitHandler = (event) => {
        event.preventDefault();

        const TodoData = {
            title: enteredTitle,
            goal: enteredGoal,
            adress: enteredAdress,
            content: enteredContent

        };

        props.onSaveTodoData(TodoData);
        setEnteredTitle('');
        setEnteredAdress('');
        setEnteredGoal('');
        setEnteredContent('');
    }

    return (
        <form onSubmit={submitHandler}>
            <div className={styles.container}>
                <div className={styles.flex}></div>
                <div className={styles.nav_container}>
                    <button className={styles.other_button}><Link to={`/goal`}>목표</Link></button>
                    <button className={styles.other_button}><Link to={`/plan`}>일정</Link></button>
                    <button className={styles.main_button}>할 일</button>
                    <button className={styles.save_button}>저장</button>
                </div>
                <div className={styles.input_container}>
                    <div className={styles.space}>
                        <label className={styles.label}>제목</label>
                        <input type="text" className={styles.input} value={enteredTitle} onChange={titleChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>목표</label>
                        <Selectop onSelectedData={goalChangeHandler} />
                    </div>

                    {/* <input type="text" className={styles.input} value={enteredGoal} onChange={goalChangeHandler}></input> */}

                    <div className={styles.space}>
                        <label className={styles.label}>장소</label>
                        <input type="text" className={styles.input} value={enteredAdress} onChange={adressChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>내용</label>
                        <input type="text" className={styles.input_large} value={enteredContent} onChange={contentChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                    </div>
                </div>

            </div></form>
    );
}
export default Todo;
