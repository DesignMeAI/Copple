import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { infoState } from "../atoms";
import omg from "../omg.jpg"
import axios from 'axios';

const Img = styled.img`
width:170px;
height:auto;
margin:15px 20px;
`;
const Background = styled.div`
width: 375px;
height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color:#FCE8A6 ;
  flex-direction: column;
  border-radius: 10px;
  margin:10px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
`;
const Container = styled.form`
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
padding: 30px 0px;
  display: flex;
  width : 320px;
  background-color:white ;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 15px;
  margin:10px 0px;
`;
const Input = styled.input`
    width: 220px;
    padding-left: 15px;
	height: 40px;
	border: 1.5px solid gray;
	border-radius: 10px;
    margin: 12px 0px;
	outline: none;
	font-family: 'Noto Sans KR';
	font-style: normal;
	font-weight: 500;
	font-size: 15px;
	color: #363636;

	&::placeholder{
		color: #D5D4D1;
	}

	&:hover{
		border: 1px solid black;
       
	}

	&:focus{
		color: #363636;
		border: 1px solid red};
	
`;
const Title = styled.h1`

  font-size: 22px;
  text-align: center;
  font-weight: 500;
  display: block;
  margin:0px;
  padding:0px;
`;
const Button = styled.button`
width: 150px;
	height: 48px;
  background-color: white;
  border-radius: 12px;
  border: 1.5px solid #D5D4D1;
  font-size: 18px;
  font-weight: 200px;
  margin: 15px;
  color: #CCCBC7;
  padding: 7px 7px;
  &:hover {
    cursor: pointer;
    border:none;
    background-color: #F9E092;
    color: white;
  }
  a {
    color: white;
    text-decoration: none;
  }
`;
const ButtonBig = styled.button`
box-shadow: 1px 2px #E4E3DF;
width: 320px;
	height: 65px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
margin-top:15px;
  background-color: white;
  border-radius: 15px;
  border: none;
  font-size: 18px;
  font-weight: 200px;
  color: #CCCBC7;
  &:hover {
    cursor: pointer;
    color: white;
    border:none;
    background-color: #F9E092;
  }
  a {
    color: #CCCBC7;
    text-decoration: none;
  }
`;
const Find = styled.span`
text-align:center;
color:#696969 ;
display:block;
margin-bottom:30px;
a {
    color:#696969;
    text-decoration:none;
}
`;

function Home() {
  const [info, setInfo] = useRecoilState(infoState);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  // if (userid !== null) {
  //   navigate('/main')
  //   console.log(userid)
  // }
  useEffect(() => {
    if (localStorage.getItem("id") !== null) {
      navigate('/main');
      console.log(localStorage.getItem("id"))
    } else {
      navigate('/')
    }
  }, [navigate])

  const onSubmit = (data) => {
    console.log(data.UserId)
    axios({
      method: 'post',
      url: 'http://3.34.209.20:8000/account/login',
      data: {
        user_id: data.UserId,
        password: data.Password
      },
      withCredentials: true,
      headers: {
        "Access-Control-Allow-Origin": "http://3.34.209.20:3000"
      }
    },
    ).then(function (response) {
      console.log(response)
      if (response.data['message'] === "로그인 성공") {
        const info = response.data['data']
        setInfo(info);
        const setCookieHeader = response.headers['Set-Cookie'];
        navigate('/main')
        console.log(response.data['data'])
        document.cookie = setCookieHeader;
      } else if (
        response['data'] === "failed"
      ) {
        alert("올바르지 않은 회원정보입니다.")
      }
    })
      .catch(function (error) {
        console.log(error);
      });
  }

  return <Background>
    <Container onSubmit={handleSubmit(onSubmit)}>
      <Img src={omg} alt="adorable"></Img>
      <Title>Copple</Title>
      <Input placeholder="ID" {...register("UserId", { required: "Please write ID" })}></Input>
      <Input type="password" placeholder="Password" {...register("Password", { required: "Please write password" })}></Input>
      <Button type="submit">login</Button>
    </Container>
    <ButtonBig >
      <Link to='/signup'>Sign up</Link>
    </ButtonBig>
    <Find><Link to='/find'>Forgot your id/password?</Link></Find>
  </Background>
}

export default Home;