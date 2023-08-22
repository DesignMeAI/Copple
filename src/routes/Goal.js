import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import { goalState } from "../atoms";
import { useState } from "react";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import PinkCalendar from "../components/Date"
function Goal(props) {
    const [enteredTitle, setEnteredTitle] = useState('');
    const [enteredDate, setEnteredDate] = useState('');
    const [enteredAdress, setEnteredAdress] = useState('');
    const [enteredContent, setEnteredContent] = useState('');
    const [enteredImage, setEnteredImage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null);

    const onUpload = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
            reader.onload = () => {
                setEnteredImage(reader.result || null); // 파일의 컨텐츠
                resolve();
            };
        });
    }


    const titleChangeHandler = (event) => {
        setEnteredTitle(event.target.value);
    }

    const dateChangeHandler = (event) => {
        setEnteredDate(event.target.value);
    }

    const adressChangeHandler = (event) => {
        setEnteredAdress(event.target.value);
    };
    const contentChangeHandler = (event) => {
        setEnteredContent(event.target.value);
    };

    const imageChangeHandler = (event) => {
        setEnteredImage(event.target.value)

    }
    const submitHandler = (event) => {
        event.preventDefault();

        const goalData = {
            title: enteredTitle,
            date: new Date(enteredDate),
            adress: enteredAdress,
            content: enteredContent,
            image: enteredImage
        };

        props.onSaveGoalData(goalData);
        setEnteredTitle('');
        setEnteredAdress('');
        setEnteredDate('');
        setEnteredContent('');
        setEnteredImage('');
    };


    return (
        <form onSubmit={submitHandler}>
            <div className={styles.container}>
                <div className={styles.flex}></div>
                <div className={styles.nav_container}>
                    <button className={styles.main_button}>목표</button>
                    <button className={styles.other_button}><Link to={`/plan`}>일정</Link></button>
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
                        <input type="text" className={styles.input} value={enteredDate} onChange={dateChangeHandler}></input>

                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>장소</label>
                        <input type="text" className={styles.input} value={enteredAdress} onChange={adressChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>내용</label>
                        <input type="text" className={styles.input_large} value={enteredContent} onChange={contentChangeHandler}></input>
                    </div>
                    <div className={styles.space}>
                        <label className={styles.label}>사진</label>

                        <div className={styles.space}>
                            <input className={styles.upload} value={selectedFile ? selectedFile.name : "첨부파일"} placeholder="첨부파일"></input>
                            {/* <label htmlFor="file">파일찾기</label> */}
                            <input accept="image/*" type="file" id="file" onChange={e => onUpload(e)} ></input>
                        </div>
                        <img
                            width={'100%'}
                            src={enteredImage}
                            onChange={imageChangeHandler}
                        /></div>
                </div></div>
        </form>
    )
}

export default Goal;
