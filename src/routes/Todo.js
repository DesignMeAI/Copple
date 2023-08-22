import { Link } from "react-router-dom";
import Selectop from "../components/Select"
import styled from "styled-components";
import { useForm } from "react-hook-form";

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
function Todo() {
    const { register, handleSubmit, setValue } = useForm();
    return (<Container><Form>
        <Navbar><Btn><Link to='/goal'>목표</Link></Btn>
            <Btn className="selected"><Link to='/todo'>할일</Link></Btn>
            <Btn><Link to='/plan'>일정</Link></Btn>
            <div></div>
            <Btn type="submit">저장</Btn></Navbar>
        <Tag>제목</Tag>
        <Input required></Input>
        <Tag>목표</Tag>
        <Selectop/>
        <Tag>장소</Tag>
        <Input></Input>
        <Tag>내용</Tag>
        <Input required></Input>


    </Form></Container>
    )
}

export default Todo;


                        

