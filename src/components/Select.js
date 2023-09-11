import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { goalState } from "./atoms";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const SelectDiv = styled.div`
width:95%;
margin-bottom:30px;
`;
const Container = styled.div`
width:100%;
display:flex;
justify-content: space-between;
align-items: start;

:first-child{
flex-grow: 6;
};
`;
const Btn = styled.button`
font-weight: 700;
font-size: 17px;
color:rgba(0, 255, 255, 0.527);
padding-left:20px;
background-color: white;
border: none;
&:hover{ 
     cursor: pointer;
};
`;
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
        const Items = response.Items
        const lists = Items.map(data => data['Title'])
        const list = lists.map(data => ({ "value": data, "label": data }))
        setOptions(list)
    };
    useEffect(() => {
        getData();
    }, []);

    return (
        <SelectDiv>
            <Container>
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
                <Btn onClick={() => onClearSelect()}>
                    없음
                </Btn>
            </Container>
        </SelectDiv>
    )
}

export default Selectop;