import styled from "styled-components";
import { Link } from "react-router-dom";
import { useState } from "react";

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
`;
const Container = styled.form`
box-shadow: 1px 2px #E4E3DF;
padding: 50px 0px;
  display: flex;
  width : 320px;
  background-color:white ;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 15px;
  margin:25px 0px;
  input {
    width: 220px;
    padding-left: 20px;
	height: 45px;
	border: 1.5px solid #AEAA96 ;
	border-radius: 10px;
    margin: 17px 0px;
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
		border: 1px solid #F4C905 };
	}
    span {
        margin: 0px 0px;

    }

  
`;
const ContainerB = styled.div`
padding:0px 35px;
color:#696969;
input{
    width: 260px;
    margin-top: 10px;
};
`
const Title = styled.h1`
  color:#AEAA96;
  font-size: 30px;
  text-align: center;
  font-weight: 530px;
  display: block;
  margin-top:0px;
  margin-bottom:35px;
  padding:0px;

`;

const Button = styled.button`
width: 155px;
	height: 50px;
  background-color: white;
  border-radius: 12px;
  border: 1.5px solid #D5D4D1;
  font-size: 15px;
  font-weight: 400px;
  margin:30px 0;
  color: #CCCBC7;
  padding: 7px 7px;

  &:hover {
    cursor: pointer;
    border:none;
    background-color: #F9E092;
    color: white;
  }

  a {
    color: #CCCBC7;
    text-decoration: none;
  }

  a:hover {
    color:white;
  }
`;
const ButtonBig = styled.button`
box-shadow: 1px 2px #E4E3DF;
letter-spacing: 1px;
width: 320px;
	height: 65px;
    padding: 15px;
margin-top:15px;
  background-color: white;
  border-radius: 15px;
  border: none;
  font-size: 18px;
  font-weight: 300px;
  color: #CCCBC7;
  &:hover {
    cursor: pointer;
    color: white;
    border:none;
    background-color: #F9E092;
  }
  a {
    display:block;
    color: #CCCBC7;
    text-decoration: none;
  }
`
// const Find = styled.span`
// text-align:center;
// color: #696969;
// ;
// display:block;
// margin-bottom:70px;
// a {
//     color:#696969;
//     text-decoration:none;
// }

// `

function Finding() {
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [password, setPassword] = useState("");

  const onChange = (event) => {
    const className = event.target.className;
    if (className === "username") {
      setUsername(event.target.value);
    } else if (className === "userid") {
      setUseremail(event.target.value);
    } else if (className === "password") {
      setPassword(event.target.value);
    };
  }

  return (
    <Background>
      <Container>
        <Title>Sign Up</Title>
        <ContainerB>
          <span>이름을 입력하세요</span>
          <input className="username" value={username} onChange={onChange} />
        </ContainerB>
        <ContainerB>
          <span>이메일을 입력하세요</span>
          <input className="useremail" value={useremail} onChange={onChange} />
        </ContainerB>
        {/* <input className="password" type="password" placeholder="Password" value={password} onChange={onChange} autoComplete="off" /> */}
        <Button><Link to='/'>찾기</Link></Button>
      </Container>
      <ButtonBig >
        <Link to='/'>
          Home</Link>
      </ButtonBig>
    </Background>
  );

}

export default Finding;
