import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 15px;
`;
const Title = styled.h1`
  font-size: 36px;
  text-align: center;
  font-weight: 500;
  display: block;
  margin: 10px 0;
`;

const Button = styled.button`
  background-color: aqua;
  border-radius: 15px;
  border: none;
  font-size: 12px;
  font-weight: 400px;
  margin: 15px;
  color: white;
  padding: 7px 7px;
  &:hover {
    cursor: pointer;
    background-color: blue;
  }
  a {
    color: white;
    text-decoration: none;
  }
`;


function Signin() {
  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");

  const onChange = (event) => {
    const className = event.target.className;
    if (className === "email") {
      setEmail(event.target.value);
    } else if (className === "password") {
      setPasswd(event.target.value);
    }
  };

  const onClick = function (event) {
    event.preventDefault();
    axios({
      method: 'post',
      url: 'https://www.pre-onboarding-selection-task.shop/auth/signin',
      data: {
        email: email,
        password: passwd
      }
    })
      .then(function (response) {
        const data = response.data;
        const access_key = Object.values(data);
        console.log(access_key[0])
        localStorage.setItem("access_key", access_key[0])
        navigate('/todo')
      })
      .catch(error => { console.log('error : ', error.response) });
  };
  useEffect(() => {
    if (localStorage.getItem("access_key") !== null) {
      navigate('/main');
    } else {
      navigate('/signin')
    }
  }, [])
  // const savedToDos = localStorage.getItem(TODOS_KEY);
  return (
    <Container>
      <Title>Sign In</Title>
      <form action={'/todo'}>
        <Container>
          <span>Email</span>
          <input
            value={email}
            className="email"
            onChange={onChange}
            data-testid="email-input"
          />
          <span>Password</span>
          <input
            value={passwd}
            onChange={onChange}
            className="password"
            type="password"
            data-testid="password-input"
          />
          <Button
            onClick={onClick}
            data-testid="signin-button"
            disabled={
              email.indexOf("@") !== -1 && passwd.length >= 8 ? false : true
            }
          >
            로그인
          </Button>
        </Container>
      </form>
    </Container>
  );
}

export default Signin;
