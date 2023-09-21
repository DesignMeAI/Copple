import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from "./Select.module.css";
import { useRecoilState } from "recoil";
import { goalState } from "../atoms";
import axios from "axios";

const Selectop = (props) => {
  const [goal, setGoal] = useRecoilState(goalState);
  const [selectValue, setSelectValue] = useState("");
  const selectInputRef = useRef(null);
  const [options, setOptions] = useState([]);
  const onClearSelect = () => {
    if (selectInputRef.current) {
      selectInputRef.current.clearValue();
    }
  };
  async function getData() {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "GET",
      url: "http://3.39.153.9:3000/goal/read",
      withCredentials: false, // 쿠키를 사용하므로 true로 설정
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      setGoal(response.data);
      console.log(goal);
    });
  }
  async function setData() {
    if (goal.length > 1) {
      const lists = goal.map((data) => data["title"]);
      const list = lists.map((data) => ({ value: data, label: data }));
      setOptions(list);
    }
  }
  useEffect(() => {
    getData();
    setData();
  }, []);
  return (
    <div className={styles.SelectDiv}>
      <div className={styles.Container}>
        <Select
          style={{ padding: "0" }}
          ref={selectInputRef}
          onChange={(e) => {
            if (e) {
              setSelectValue(e.value);
              setGoal(e.value);
            } else {
              setSelectValue("");
            }
          }}
          options={options}
          placeholder="목표를 선택하세요."
        />
        <button className={styles.Btn} onClick={() => onClearSelect()}>
          없음
        </button>
      </div>
    </div>
  );
};

export default Selectop;
