import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from "./Select.module.css";
import { useRecoilState } from "recoil";
import { goalState } from "../atoms";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);
import { goalListState, goalState } from "../atoms";
import axios from "axios";

const Selectop = () => {
  const [goal, setGoal] = useRecoilState(goalState);
  const [goalList, setGoalList] = useRecoilState(goalListState);
  const [selectValue, setSelectValue] = useState("");
  const selectInputRef = useRef(null);
  const [options, setOptions] = useState([{ value: null, label: "선택 안함" }]);
  const onClearSelect = () => {
    if (selectInputRef.current) {
      selectInputRef.current.clearValue();
    }
  };
  const command = new ScanCommand({
    ProjectionExpression: "#Title, Content",
    ExpressionAttributeNames: { "#Title": "Title" },
    TableName: "Records",
  });
  async function getData() {
    const response = await docClient.send(command);
    const Items = response.Items;
    const lists = Items.map((data) => data["Title"]);
    const list = lists.map((data) => ({ value: data, label: data }));
    setOptions(list);
  }

  useEffect(() => {
    getData();
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
