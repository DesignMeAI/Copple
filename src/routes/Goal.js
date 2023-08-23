import { useForm } from "react-hook-form";
import { useEffect } from "react";
import styles from "./Goal.module.css"
import { Link } from "react-router-dom";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});
const docClient = DynamoDBDocumentClient.from(client);

function Goal() {
    async function getData() {
        const command = new PutCommand({
            TableName: "Account",
            Item: {
                UserId: "은재",
                UserName: "최은재"
            },
        });
        const response = await docClient.send(command);
        console.log(response)
    };

    useEffect(() => {
        getData();
    }, []);

    const { register, handleSubmit, setValue, formState } = useForm();
    const onSubmit = (data) => { console.log(data) }
    return (
        <div className={styles.Container}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.Navbar}><button className={styles.selected}><Link to='/goal'>목표</Link></button>
                    <button className={styles.Btn}><Link to='/todo'>할일</Link></button>
                    <button className={styles.Btn}><Link to='/plan'>일정</Link></button>
                    <div></div>
                    <button className={styles.Btn} type="submit">저장</button>
                </div>
                <div className={styles.Tag}>제목</div>
                <input className={styles.Input} {...register("title", { required: "Please write a title" })} placeholder={formState.errors.title && formState.errors.title.message} />

                <div className={styles.Tag}>기간</div>
                <input className={styles.Input} {...register("period", { required: "Please write a period" })} placeholder={formState.errors.period && formState.errors.period.message} />
                <div className={styles.Tag}>장소</div>
                <input className={styles.Input} {...register("address")} />
                <div className={styles.Tag}>내용</div>
                <input className={styles.Input} {...register("content", { required: "Please write a content" })} placeholder={formState.errors.content && formState.errors.content.message} />
                <div className={styles.Tag}>사진</div>
                <div className={styles.PCon}>
                    <input className={styles.Picture} id="upload-name" placeholder="첨부파일" />
                    <label htmlFor="file">파일찾기</label>
                    <input className={styles.None} type="file" id="file" {...register("picture")} /></div>
            </form>
        </div>
    )
}

export default Goal;
