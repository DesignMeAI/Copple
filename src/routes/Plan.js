import styled from "styled-components";
import { useForm } from "react-hook-form";
import Selectop from "../components/Select"
import { Link } from "react-router-dom";
import { userNameState , userIdState} from "../atoms.js";
import { useRecoilValue } from "recoil";
import { goalState } from "../components/atoms";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});
const docClient = DynamoDBDocumentClient.from(client);

const Container = styled.div`
    display: flex;
    width: 375px;
    height: 100vh;
    flex-direction: column;
    margin:10px auto;
`
const Form = styled.form`
 display: flex;
 align-items: center;
 flex-direction: column;
`
const Tag = styled.div`
    font-style: bold;
    width: 375px;
    font-size: 20px;
    font-weight:600;
    margin-bottom:15px;
    text-align: left;

`
const Input = styled.input`
    width: 345px;
    height: 55px;
    color: rgba(0, 0, 0, 0.596);
    border: 2px solid #55555550;
    border-radius: 11px;
    margin-bottom:30px;
    padding: 5px 15px;
    caret-color: transparent;
    font-size: 17px;
    &:focus {
    outline: none;
}
`
const Navbar = styled.div`
display: flex;
width:375px;
justify-content: space-around;
margin: 20px 0px;
flex-direction: row;
div {
    flex-grow:2;
}`

const Btn = styled.button`

font-size: 25px;
letter-spacing: 1px;
    font-style: bold;
    border-radius: 30px;
    background-color: white;
    color: none;
    border: none;
    padding: 7px 0px;
    margin-right: 35px;
        &.selected{
        a{
            color:black;
        }
    }
    &:hover {
        cursor: pointer;
    }
a {
    font-size: 25px;
    font-weight: 600;
    color: #d3d3d3;
    text-decoration: none;}
    &:last-child {
        background-color: rgba(0, 255, 255, 0.527);
    color: white;
    font-size: 20px;
    border: none;
    border-radius: 30px;
    padding: 0px 12px;
    margin-left:30x;
    margin-right:0px;
    &:hover {
        cursor: pointer;
    }
    }
`
function Plan() {
    const username = useRecoilValue(userNameState);
    const userId = useRecoilValue(userIdState);
    async function SendPlan(data) {
        const command = new PutCommand({
            TableName: "Record",
            Item: {
                Index: Date().toString(),
                UserId: userId,
                UserName: username,
                Title: data.title,
                Event:"Plan",
                Goal: goals,
                Address: data.address,
                Period: data.period
            },
        });
        const response = await docClient.send(command);
        console.log(response)
    }
    const onSubmit = (data) => {
        SendPlan(data)
    }
    const goals = useRecoilValue(goalState);
    const { register, handleSubmit } = useForm();
    return (
        <Container>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Navbar>
                    <Btn><Link to='/goal'>목표</Link></Btn>
                    <Btn><Link to='/todo'>할일</Link></Btn>
                    <Btn className="selected"><Link to='/plan'>일정</Link></Btn>
                    <div></div>
                    <Btn type="submit">저장</Btn>
                </Navbar>
                <Tag >제목</Tag>
                <Input {...register("title", { required: "Please write title" })}></Input>
                <Tag>기간</Tag>
                <Input {...register("period", { required: "Please write period" })}></Input>
                <Tag>목표</Tag>
                <Selectop />
                <Tag>장소</Tag>
                <Input {...register("address", { required: "Please write address" })}></Input>
            </Form>
        </Container>
    )
}

export default Plan;
