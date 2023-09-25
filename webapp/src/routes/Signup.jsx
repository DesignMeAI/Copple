import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  // Users table에 아이디, 이름 존재 확인 후 가입 진행
  const onSubmit = (data) => {
    axios({
      method: "post",
      url: "http://3.39.153.9:3000/account/signup",
      data: {
        user_id: data.UserId,
        password: data.Password,
        user_name: data.UserName,
        passwordcheck: data.PasswordCheck,
      },
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then(function (response) {
        if ((response.data.message = "사용자 등록 완료")) {
          alert("Welcome to Copple!");
          navigate("/");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <Background>
      <Container onSubmit={handleSubmit(onSubmit)}>
        <Tag style={{ marginBottom: "20px" }}>
          <Title>회원가입</Title>
        </Tag>
        <Tag>이름</Tag>
        <Tag>
          <input
            className="username"
            placeholder="Name"
            {...register("UserName", { required: "Please write your name" })}
          />
        </Tag>
        <Tag>아이디</Tag>
        <Tag>
          <input
            className="userid"
            placeholder="ID"
            {...register("UserId", { required: "Please write your id" })}
          />
        </Tag>
        <Tag>비밀번호</Tag>
        <Tag>
          <input
            className="password"
            type="password"
            placeholder="Password"
            autoComplete="off"
            {...register("Password", { required: "Please write password" })}
          />
        </Tag>
        <Tag>비밀번호 확인</Tag>
        <Tag>
          <input
            className="password"
            type="password"
            placeholder="PasswordCheck"
            autoComplete="off"
            {...register("PasswordCheck", {
              required: "Please write password",
            })}
          />
        </Tag>
        <Button type="submit">회원가입</Button>
        <Button style={{ marginTop: "40px" }}>
          <Link to="/">Home</Link>
        </Button>
      </Container>

      {/* <Find>
        <Link to="/find">Forgot your id/password?</Link>
      </Find> */}
    </Background>
  );
}

export default Signup;

const Background = styled.div`
  width: 375px;
  height: 100vh;
  display: flex;
  align-items: center;
  text-align: left;
  background-color: white;
  flex-direction: column;
  margin: 0px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
`;
const Tag = styled.div`
  font-style: bold;
  width: 98%;
  text-align: start;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 7px;
  text-align: left;
  input {
    width: 100%;
    height: 45px;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.596);
    border: 1.2px solid #9d9d9d;
    border-radius: 4px;
    padding: 8px 10px;
    margin-bottom: 13px;
    caret-color: #9d9d9d;
    font-size: 15px;
    &:focus {
      outline: none;
    }
  }
`;
const Container = styled.form`
  width: 375px;
  height: 100vh;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  
  }
`;
const Title = styled.h3`
  color: black;
  font-size: 20px;
  text-align: left;
  font-weight: 600px;
  display: block;
  margin-top: 0px;
  padding: 0px;
`;
const Button = styled.button`
  width: 95%;
  height: 45px;
  background-color: #7ef0ff;
  border-radius: 4px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: 80px;
  color: black;
  padding: 12px 7px;

  &:hover {
    cursor: pointer;
    border: none;
    background-color: #00a6ed;
    color: white;
  }
  a {
    color: black;
    text-decoration: none;
    &:hover {
      color: white;
    }
  }
`;
const ButtonBig = styled.button`
  box-shadow: 1px 2px #e4e3df;
  letter-spacing: 1px;
  width: 320px;
  height: 55px;
  padding: 15px;
  background-color: white;
  border-radius: 15px;
  border: none;
  font-size: 18px;
  font-weight: 300px;
  color: #cccbc7;
  &:hover {
    cursor: pointer;
    color: white;
    border: none;
    background-color: #f9e092;
  }
  a {
    display: block;
    color: #cccbc7;
    text-decoration: none;
  }
`;
const Find = styled.span`
  text-align: center;
  color: #696969;
  display: block;
  margin-bottom: 20px;
  a {
    color: #696969;
    text-decoration: none;
  }
`;
