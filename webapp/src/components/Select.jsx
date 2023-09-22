import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from "./Select.module.css";
import { useRecoilState } from "recoil";
import { goalListState, goalState } from "../atoms";
import axios from "axios";

const Selectop = () => {
  const [goal, setGoal] = useRecoilState(goalState);
  const [goalList, setGoalList] = useRecoilState(goalListState);
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
    }).then(async (response) => {
      await setGoalList(response.data);
      console.log(goal);
    });
  }
  function setData() {
    if (goalList.length > 0) {
      const list = goalList.map((data) => ({
        value: data["event_id"],
        label: data["title"],
      }));
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
            console.log(e);
            setGoal(e.value);
            setSelectValue(e.value);
          }}
          options={options}
          placeholder="목표를 선택하세요."
        />
      </div>
    </div>
  );
};

export default Selectop;
