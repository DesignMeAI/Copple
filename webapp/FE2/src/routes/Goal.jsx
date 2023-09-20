import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { infoState,  savedGoalsState } from "../atoms.js";
import styles from "../styles/Goal.module.css";

function Goal() {
  const [info, setInfo] = useRecoilState(infoState);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState } = useForm();
  const imageFile = watch("image");
  

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    if (imageFile) {
      formData.append("image", imageFile[0]);
    }
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJpbiIsImlhdCI6MTY5NTA4MjAyNSwiZXhwIjoxNjk1MTE4MDI1fQ.grUxNuNcq0o7lzX__L_j1jq_mPRHNhJcc4tMrMlkIWM";

    try {
      const response = await fetch("http://3.39.153.9:3000/goal/create", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.event_id) {
          setInfo({...info, goalId: result.event_id});
          navigate("/main");
        } else {
          console.error("Failed to create the goal: ", result);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch: ", response.statusText, errorData);
      }
    } catch (error) {
      console.error("An error occurred while submitting the form:", error);
    }
  };

  return (
    <div className={styles.Container}>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.Navbar}>
          <button className={styles.selected}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/todo">할일</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/plan">일정</Link>
          </button>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </div>
        <div className={styles.Tag}>제목</div>
        <input
          maxLength={20}
          className={styles.Input}
          {...register("title", { required: "Please write a title" })}
          placeholder={
            formState.errors.title && formState.errors.title.message
          }
        />

        <div className={styles.Tag}>시작일</div>
        <input
          type="date"
          className={styles.Input}
          {...register("startDatetime", { required: "Please write a period" })}
          placeholder={
            formState.errors.startDatetime && formState.errors.startDatetime.message
          }
      />
      <input
          type="date"
          className={styles.Input}
          {...register("endDatetime", { required: "Please write a period" })}
          placeholder={
            formState.errors.endDatetime && formState.errors.endDatetime.message
          }
      />
      <input className={styles.Input} {...register("location")} />
        <div className={styles.Tag}>내용</div>
        <input
          className={styles.Input}
          {...register("content", { required: "Please write a content" })}
          placeholder={
            formState.errors.content && formState.errors.content.message
          }
        />
        <div className={styles.Tag}>완료</div>
        <input
          className={styles.Check}
          type="checkbox"
          {...register("isDone")}
        />
        <div className={styles.Tag}>사진</div>
        <input type="file" {...register("image")} />
    </form>
  </div>
);
}

export default Goal;
