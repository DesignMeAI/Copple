import styles from "../css/FormStyle.module.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import { goalIdState, modeState } from "../atoms";

function Goal() {
  const [imageurl, setImageurl] = useState();
  const [imagename, setImagename] = useState();
  const [imageFile, setImageFile] = useState();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        console.log("File Reader Result: ", result);
        setImageurl(result);
        setImagename(file.name);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      // setImageFile(file);
    }
  };

  const SendGoal = async (goal, event, method, goalId) => {
    console.log(goal);
    setMode(null);
    const formData = new FormData();
    formData.append("title", goal.title);
    formData.append("startDatetime", goal.startDatetime);
    formData.append("endDatetime", "none");
    formData.append("location", goal.location);
    formData.append("content", goal.content);
    console.log(imageFile);
    if (imageFile) {
      formData.append("image", imageFile, imageFile.name);
    }
    try {
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
      const url = goalId
        ? `http://3.39.153.9:3000/goal/${event}/${goalId}`
        : `http://3.39.153.9:3000/goal/${event}`;
      await axios({
        method: method,
        url: url,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        data: formData,
        withCredentials: false,
      }).then((response) => {
        if (response.status === 200) {
          alert("성공");
        }
      });
    } catch (error) {
      console.error("An error occurred while updating profile:", error);
    }
  };
  const goalState = {
    title: "",
    startDatetime: "",
    location: "",
    content: "",
    isCompleted: false,
    photoUrl: "",
    photoUrlname: "",
  };
  const [history, setHistory] = useState({});
  const navigate = useNavigate();
  const [mode, setMode] = useRecoilState(modeState);
  const [goalId, setGoalId] = useRecoilState(goalIdState);
  const [goalinfo, setGoalinfo] = useState(goalState);
  const {
    title,
    startDatetime,
    location,
    content,
    photoUrl,
    photoUrlname,
    isCompleted,
  } = goalinfo;

  const getGoalData = async (event_id) => {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "get",
      url: `http://3.39.153.9:3000/goal/read/${event_id}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }).then((response) => {
      console.log(response);
      if (mode === "update") {
        setGoalinfo(response.data);
        setImageFile(null);
        // sestGoalinfo(history);
      }
    });
  };
  const TitleHandler = (e) => {
    setGoalinfo({ ...goalinfo, title: e.target.value });
  };
  const PeriodHandler = (e) => {
    setGoalinfo({ ...goalinfo, startDatetime: e.target.value });
  };
  const LocationHandler = (e) => {
    setGoalinfo({ ...goalinfo, location: e.target.value });
  };
  const CompleteHandler = (e) => {
    setGoalinfo({ ...goalinfo, isCompleted: e.target.checked });
  };
  const ContentHandler = (e) => {
    setGoalinfo({ ...goalinfo, content: e.target.value });
  };

  useEffect(() => {
    if (mode === "update") {
      getGoalData(goalId);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === "update") {
      const method = "PUT";
      const event = "update";
      SendGoal(goalinfo, event, method, goalId)
        .then(alert("성공"))
        .then(navigate("/home"));
    } else {
      const method = "POST";
      const event = "create";
      console.log(goalinfo);
      SendGoal(goalinfo, event, method)
        .then(alert("성공"))
        .then(navigate("/home"));
    }
  };

  return (
    <div className={styles.Container}>
      <form onSubmit={onSubmit}>
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
        <div className={styles.Tag}>
          <input
            value={title}
            onChange={TitleHandler}
            maxLength={20}
            className={styles.Input}
          />
        </div>

        <div className={styles.Tag}>기간</div>
        <div className={styles.Tag}>
          <input
            value={startDatetime}
            onChange={PeriodHandler}
            type="text"
            className={styles.Input}
          />
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            value={location}
            onChange={LocationHandler}
            className={styles.Input}
          />
        </div>
        <div className={styles.Tag}>내용</div>
        <div className={styles.Tag}>
          <input
            style={{ height: "90px" }}
            value={content}
            onChange={ContentHandler}
            className={styles.Input}
          />{" "}
        </div>
        <div className={styles.Tag}>사진</div>
        <input type="file" onChange={handleImageChange} />
        <div className={styles.Tag}>완료</div>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>
            <input
              disabled={mode === "update" ? false : history.isCompleted}
              value={isCompleted}
              onChange={CompleteHandler}
              className={styles.check}
              type="checkbox"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default Goal;
