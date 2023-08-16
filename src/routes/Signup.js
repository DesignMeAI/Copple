import styled from "styled-components";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DynamoDBClient, DynamoDB, GetItemCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";


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
`;
const Title = styled.h1`
  color:#AEAA96;
  font-size: 30px;
  text-align: center;
  font-weight: 530px;
  display: block;
  margin-top:0px;
  margin-bottom:25px;
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
  margin-top: 30px;
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
letter-spacing: 1px;
width: 350px;
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
const Find = styled.span`
text-align:center;
color: #696969;
;
display:block;
margin-bottom:70px;
a {
    color:#696969;
    text-decoration:none;
}

`
// const dynamo = new DynamoDBClient({
//   region: 'ap-northeast-2',
//   config: {
//     region: process.env.REACT_APP_AWS_REGION,
//     accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
//   }
// }
// )
const dynamo = new DynamoDBClient({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  })

export const main = async () => {
  const command = new GetItemCommand({
    TableName: "Accunt",
    Key: {
      UserId: "차아린바보"
    }
  });
}
const data = await dynamo.send(command);
function getData() {
  const dynamo = new DynamoDBClient({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
  }
  )

  console.log("Success", data);
}
getData();



// async function fetchDataFromDynamoDB() {
//   const command = new GetItemCommand(input);
//   const result = await dynamo.send(command);
//   console.log("Result data:", result); // Access the result data here
// }

function Signup() {
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (localStorage.getItem("access_key") !== null) {
  //     console.log(localStorage.getItem("access_key"))
  //     navigate('/main');
  //   } else {
  //     navigate('/signup')
  //   }
  // }, [])

  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const onChange = (event) => {
    const className = event.target.className;
    if (className === "username") {
      setUsername(event.target.value);
    } else if (className === "userid") {
      setUserid(event.target.value);
    } else if (className === "password") {
      setPassword(event.target.value);
    };
  }

  // const onClick = function (e) {
  //   axios({
  //     method: 'post',
  //     url: 'https://www.pre-onboarding-selection-task.shop/auth/signup',
  //     data: {
  //       email: email,
  //       password: passwd
  //     }
  //   }).then(function (response) { console.log(response); }).catch(error => { console.log('error : ', error.response) });
  // };
  // const gotoHome = function () {
  //   navigate('/')
  // }

  return (
    <Background>
      <Container>
        <Title>Sign Up</Title>
        <Input className="username" placeholder="Name" value={username} onChange={onChange}></Input>
        <Input className="userid" placeholder="ID" value={userid} onChange={onChange}></Input>
        <Input className="password" type="password" placeholder="Password" value={password} onChange={onChange} minLength={4} maxLength={12}></Input>
        <Button onClick={'s'}>Sign up</Button>
      </Container>
      <ButtonBig>
        Home
      </ButtonBig>

      <Find><Link to='/find'>Forgot your id/password?</Link></Find>

    </Background>
  );

}

export default Signup;
