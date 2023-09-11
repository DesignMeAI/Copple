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
