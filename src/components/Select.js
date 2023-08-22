import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styled from "styled-components";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

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
    const [selectValue, setSelectValue] = useState('')
    const selectInputRef = useRef(null);
    const [options, setOptions] = useState([]);
    const command = new GetCommand({
        TableName: "Account",
        Key: {
            UserId: "차아린천재",
            UserName: "만재"
        }
    })
    async function getData() {
        const response = await docClient.send(command);
    
        setOptions([{value: response.Item.UserId, label: response.Item.UserId}])
    }
    useEffect(()=>{getData();
        setOptions(options);
},[])
        console.log(options);
// const titles = items.map(item => ({
    //     value: item.UserId,
    //     label: item.UserName
    // }));
    // console.log(titles)
    // return titles;
 //     }
    //     const dataget = async function fetchDataAndProcess() {
    //         try {
    //             const titles = await getScannedGoals();
    //             // const data = JSON.stringify(titles);
    //             setOptions(titles);

    //             return titles
    //         } catch (error) {
    //             console.error('An error occurred:', error);
    //             throw error; // Re-throw the error to be handled at a higher level
    //         }
    //     }




    //     const onClearSelect = () => {
    //         if (selectInputRef.current) {
    //             selectInputRef.current.clearValue();
    //         }
    //     }
    // props.onSelectedData(selectValue)

    return (
        <SelectDiv>
            <Select
                ref={selectInputRef}
                onChange={(e) => {
                    if (e) {
                        setSelectValue(e.value);
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