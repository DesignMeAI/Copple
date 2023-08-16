import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import omg from "../omg.jpg"
const Img = styled.img`
width:170px;
height:auto;
margin:15px 20px;`
const Background = styled.div`
width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color:#FCE8A6 ;
  flex-direction: column;
  gap: 15px;
  border-radius: 5px;
  margin:20px auto;
`;
const Container = styled.form`
box-shadow: 1px 2px #E4E3DF;
padding: 30px 0px;
  display: flex;
  width : 350px;
  background-color:white ;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 15px;
  margin:25px 0px;
`;
const Input = styled.input`
    width: 250px;
    padding-left: 10px;
	height: 37px;
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
	}
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
width: 350px;
	height: 65px;
    padding: 15px;
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
`
const Find = styled.span`
text-align:center;
color:#696969 ;
display:block;
margin-bottom:30px;
a {
    color:#696969;
    text-decoration:none;
}
`
function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("id") !== null) {
      console.log(localStorage.getItem("id"))
      navigate('/main');
    } else {
      navigate('/')
    }
  }, [navigate])
  const onClick = (event) => {
    event.preventDefault();
    navigate('/main');
  }

  return <Background>
    <Container>
      <Img src={omg} alt="adorable"></Img>
      <Title>Copple</Title>
      <Input placeholder="ID"></Input>
      <Input placeholder="Password"></Input>
      <Button onClick={onClick}>login</Button>
    </Container>
    <ButtonBig ><Link to='/signup'>
      Sign up</Link>
    </ButtonBig>
    <Find><Link to='/find'>Forgot your id/password?</Link></Find>
  </Background>
}

export default Home;