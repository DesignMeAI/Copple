import styled from "styled-components";
import { useForm } from "react-hook-form";
import {useEffect} from "react";
import { Link } from "react-router-dom";
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
const Picture = styled.input`
display: inline-block;
    height: 40px;
    padding: 0 10px;
    vertical-align: middle;
    border: 1px solid #dddddd;
    width: 63%;
    color: #999999; 
`
const PCon = styled.div`
width:375px;
padding: 0px;
margin:0px;`
const None = styled.input`
 position: absolute;
    width: 0;
    height: 0;
    padding: 0;
    overflow: hidden;
    border: 0;`
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
const Label = styled.label`
display: inline-block;
    padding: 10px 20px;
    color: #fff;
    vertical-align: middle;
    background-color: #999999;
    cursor: pointer;
    height: 22px;
    margin-left: 10px;`
function Goal() {
    // const command = new GetCommand({
    //     TableName: "Account",
    //     Key: {
    //         UserId: "차아린천재",
    //         UserName: "만재"
    //     }
    // })
    async function getData() {
        const command = new PutCommand({
            TableName: "Account",
            Item: {
                UserId: "은재",
                UserName: "최은재"
            },
        });
        const response = await docClient.send(command);
        console.log(response)  }
    
    useEffect(() => {
        getData();},[])
    
    const { register, handleSubmit, setValue } = useForm();
    // const handleValid = 
    return (<Container>
        <Form onSubmit={handleSubmit()}>
            <Navbar><Btn className="selected"><Link to='/goal'>목표</Link></Btn>
                <Btn><Link to='/todo'>할일</Link></Btn>
                <Btn><Link to='/plan'>일정</Link></Btn>
                <div></div>
                <Btn type="submit">저장</Btn>
            </Navbar>
            <Tag>제목</Tag>
            <Input {...register("title",{required: "Please write a title"})} placeholder="제목을 써 주세요"/>
            <Tag>기간</Tag>
            <Input {...register("period", { required: "Please write a period" })}/>
            <Tag>장소</Tag>
            <Input {...register("address")}/>
            <Tag>내용</Tag>
            <Input {...register("content", { required: "Please write a content" })}/>
            <Tag>사진</Tag>
            <PCon>
                <Picture className="upload-name" placeholder="첨부파일" />
                <Label htmlFor="file">파일찾기</Label>
                <None type="file" id="file" /></PCon>
        </Form>
    </Container>
    )
}

export default Goal;
