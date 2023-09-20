import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ScanCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const Background = styled.div`
  width: 375px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: #fce8a6;
  flex-direction: column;
  border-radius: 10px;
  margin: 10px auto;
`;
const Container = styled.form`
  box-shadow: 1px 2px #e4e3df;
  padding: 30px 0px;
  display: flex;
  width: 320px;
  background-color: white;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 15px;
  margin: 25px 0px;
  input {
    width: 220px;
    padding-left: 20px;
    height: 45px;
    border: 1.5px solid #aeaa96;
    border-radius: 10px;
    margin: 17px 0px;
    outline: none;
   
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    color: #363636;

    &::placeholder {
      color: #d5d4d1;
    }

    &:hover {
      border: 1px solid black;
    }

    &:focus {
      color: #363636;
      border: 1px solid #f4c905;
    }
  }
`;
const Title = styled.h1`
  color: #aeaa96;
  font-size: 30px;
  text-align: center;
  font-weight: 530px;
  display: block;
  margin-top: 0px;
  margin-bottom: 25px;
  padding: 0px;
`;
const Button = styled.button`
  width: 155px;

  height: 50px;
  background-color: white;
  border-radius: 12px;
  border: 1.5px solid #d5d4d1;
  font-size: 15px;
  font-weight: 400px;
  margin: 30px 0;
  color: #cccbc7;
  padding: 7px 7px;
  &:hover {
    cursor: pointer;
    border: none;
    background-color: #f9e092;
    color: white;
  }
  a {
    color: #cccbc7;
    text-decoration: none;
  }
`;
const ButtonBig = styled.button`
  box-shadow: 1px 2px #e4e3df;
  letter-spacing: 1px;
  width: 320px;
  height: 65px;
  padding: 15px;
  margin-top: 15px;
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
  margin-bottom: 70px;
  a {
    color: #696969;
    text-decoration: none;
  }
`;

// scan command getting userinfo from Users table
const scancom = new ScanCommand({
  ProjectionExpression: "#UserName, #UserId",
  ExpressionAttributeNames: {
    "#UserName": "UserName",
    "#UserId": "UserId",
  },
  TableName: "Users",
});

// function to get userid, usernames from Users table
const getuserinfos = async () => {
  const usernames = [];
  const userids = [];
  const response = await docClient.send(scancom);
  response.Items.forEach((item) => {
    usernames.push(item.UserName.S);
    userids.push(item.UserId.S);
  });
  return { usernames: [...usernames], userids: [...userids] };
};

function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  // Users table에 아이디, 이름 존재 확인 후 가입 진행
  const onSubmit = (data) => {
    getuserinfos()
      .then((infos) => {
        console.log(infos);
        if (infos.userids.includes(data.UserId)) {
          alert("이미 존재하는 아이디입니다.");
          return false;
        } else if (infos.usernames.includes(data.UserName)) {
          alert("이미 존재하는 사용자입니다.");
          return false;
        } else {
          axios({
            method: "post",
            // url: 'http://54.180.206.223:8000/account/signup',
            url: "http://3.39.153.9:3000/account/signup",
            data: {
              user_id: data.UserId,
              password: data.Password,
              user_name: data.UserName,
            },
            withCredentials: false,
            headers: {
              "Access-Control-Allow-Origin": "http://3.39.153.9:3000",
            },
          })
            .then(function (response) {
              console.log(response);
              if (response["data"] === "회원가입 성공!") {
                navigate("/");
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log("실패:", error);
        alert("회원가입 실패");
      });
  };
  return (
    <Background>
      <Container onSubmit={handleSubmit(onSubmit)}>
        <Title>Sign Up</Title>
        <input
          className="username"
          placeholder="Name"
          {...register("UserName", { required: "Please write your name" })}
        />
        <input
          className="userid"
          placeholder="ID"
          {...register("UserId", { required: "Please write your id" })}
        />
        <input
          className="password"
          type="password"
          placeholder="Password"
          autoComplete="off"
          {...register("Password", { required: "Please write password" })}
        />
        <Button type="submit">Sign up</Button>
      </Container>
      <ButtonBig>
        <Link to="/">Home</Link>
      </ButtonBig>
      <Find>
        <Link to="/find">Forgot your id/password?</Link>
      </Find>
    </Background>
  );
}

export default Signup;