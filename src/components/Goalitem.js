import styled from "styled-components";
import omg from "../omg.jpg"
import { GoalState } from "../atoms.js";
import { useRecoilState } from 'recoil';
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const Img = styled.img`
width:auto;
height:147px;
border-radius: 5px;
border: none;
`
const GoalContainer = styled.div`
flex-grow:1;
display:flex;
flex-direction: column;
margin:12px 0px;
padding:10px;
span.title{
    margin-top:5px;
    font-weight:600;
    font-size:16px
}
span.period{
    font-weight: 600;
    font-size:14px;
    color:#7E7E7E;
}
`
const client = new DynamoDBClient({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});
const command = new QueryCommand({
    "ExpressionAttributeValues": {
        ":v1": {
            "S": "Goal"
        }
    },
    "KeyConditionExpression": "Event = :v1",
    "ProjectionExpression": "Title, Content, Period",
    "TableName": "Record"
});
const docClient = DynamoDBDocumentClient.from(client);
function Goalitem({ goaltitle, goalperiod }) {
    return <GoalContainer>
        <Img src={omg} alt="goal"></Img>
        <span className="title">{goaltitle}</span>
        <span className="period">{goalperiod}</span>
    </GoalContainer>
}

export default Goalitem;