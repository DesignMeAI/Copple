import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { goalState } from "./atoms";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const SelectDiv = styled.div`
width:375px;
margin-bottom:30px;
`

const client = new DynamoDBClient({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});
const docClient = DynamoDBDocumentClient.from(client);

const Selectop = (props) => {
    const [goal, setGoal] = useRecoilState(goalState);
    const [selectValue, setSelectValue] = useState('')
    const selectInputRef = useRef(null);
    const [options, setOptions] = useState([]);
    const command = new ScanCommand({
        ProjectionExpression: "#UserId, UserName",
        ExpressionAttributeNames: { "#UserId": "UserId" },
        TableName: "Account",
    })
    async function getData() {
        const response = await docClient.send(command);
        const Items = response.Items
        const lists = Items.map(data => data['UserId'])
        const list = lists.map(data => ({ "value": data, "label": data }))
        setOptions(list)
    }
    useEffect(() => {
        getData();
    }, [])

    return (
        <SelectDiv>
            <Select
                ref={selectInputRef}
                onChange={(e) => {
                    if (e) {
                        setSelectValue(e.value);
                        setGoal(e.value)
                    } else {
                        setSelectValue("");
                    }
                }}
                options={options}

                placeholder="목표를 선택하세요."
            />
            {/* <button onClick={() => onClearSelect()}>
                초기화
            </button> */}
        </SelectDiv>
    )
}

export default Selectop;