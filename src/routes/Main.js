import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import shortid from "shortid";
import styled from "styled-components";
import omg from "../omg.jpg"
import Goalitem from "../components/Goalitem";
import { useEffect, useState } from "react";
import { useRecoilState } from 'recoil';
import { infoState, GoalState } from '../atoms.js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const Img = styled.img`
width:100px;
height:auto;
margin:20px 5px;
border-radius: 50px;
border: solid 3px white;
`;
const Slider = styled.div`
    position:absolute;
    top: 60px;
    width:100%;

`;
const Row = styled(motion.div)`
    display:grid;
    padding-right:15px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    position: absolute;
    width: 100%;
`;
const rowVariants = {
    hidden: {
        x:  500,
    },
    visible: {
        x: 0
    },
    exit: {
        x: - 500
    },
};
const BoxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        scale: 1.3,
        y: -50,
        transition: {
            delay: 0.3,
            type: "tween",
        }
    }
};
const Background = styled.div`
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
width: 375px;
height: 95vh;
  display: flex;
  align-items: stretch;
  justify-content: default;
  background-color:#FCE8A6 ;
  flex-direction: column;
  border-radius: 10px;
  margin:0px auto;
`;
const Container = styled.div`
  border-radius: 10px;
  position: relative;
  overflow: hidden;
    padding: 20px 5px;
    height:72vh;
    display: flex;
    width : auto;
    background-color:white ;
    flex-direction: column;
    &.first {
        padding: 20px 20px;
        margin-bottom:0px;
    height:28vh;
    background: rgb(248,245,167);
background: linear-gradient(42deg, rgba(248,245,167,1) 0%, rgba(253,187,45,1) 100%);
}
`;
const Pbutton = styled.button`
background-color: transparent;
border: none;
cursor: pointer;

`;
const SmallContainer = styled.div`
text-align: right;
background: none;
a {
    color: #7E7E7E;
    text-decoration: none;
  }
`;
const RCon = styled.div`
height : auto;
display: flex;
flex-direction: row;
background-color: none;
border-radius: 0px;
padding-right:10px;
div{
    padding:0px;
    margin:0px;
    flex-grow:3.5;
}
&:last-child{
    position:fixed;
    bottom:50px;
    width:375px;
    justify-content: center;
    align-items: space-between;

}
`;
const Profile = styled.span`
display:block;
padding:50px 30px;
`;
const ProfileMsg = styled.span`
    padding-left:15px;
`;
const SBtn = styled.button`
font-weight:600;
font-size: 17px;
background-color: white;
margin:0px 10px;
border: none;
&:hover{ 
     cursor: pointer;
}
&.black {
    margin:0px;
    font-weight: 350;
    background-color: black;
    color:white;
    padding: 5px 10px;
    border-radius: 30px;
}
a {
    display:block;
    color: #CCCBC7;
    text-decoration: none;
  }
`;
const Svg = styled.svg`
width:30px;
height:30px;
`;
const GCon = styled.div`
height : auto;
display: grid;
grid-template-columns: repeat(2, 1fr);
background-color: none;
border-radius: 0px;
`;
const client = new DynamoDBClient({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});

const docClient = DynamoDBDocumentClient.from(client);

function Main() {
    const [info, setInfo] = useRecoilState(infoState);
    const [goals, setGoals] = useRecoilState(GoalState);
    const [leaving, setLeaving] = useState(false);
    const [index, setIndex] = useState(0);
    const toggleLeaving = () => setLeaving(prev => !prev);
    const gotoArin = () => {
        axios({
            method: 'post',
            url: 'http://3.34.209.20:8000/account/profile',
            data: info,
            // withCredentials: true,
            // headers: {
            //     "Access-Control-Allow-Origin": "http://3.34.209.20:3000"
            // }
        },
        ).then(function (response) {
            console.log(response);
        })
    }
    async function getData() {
        const command = new QueryCommand({
            TableName: "Records",
            KeyConditionExpression:
                "UserId = :UserId AND begins_with (EventId, :event)",
            ExpressionAttributeValues: {
                ":UserId": info['uuid'],
                ":event": "Goal",
            },
            "ProjectionExpression": "Title, Period, Content",
            ConsistentRead: true,
        });
        const response = await docClient.send(command);
        const list = response.Items.map((data) => [data.Title, data.Period, data.Content]);
        console.log(list, 'list');

        return list
    };
    useEffect(() => {
        getData().then(value => {
            setGoals(value);
            console.log('goals', goals);
        }).catch(error => console.log(error))
    }, []);
    const offset = 4;
    const increaseIndex = () => {
        if (goals) {
            toggleLeaving();
            const totlaGoals = goals.length - 1;
            const maxIndex = Math.floor(totlaGoals / offset) - 1;
            setIndex((prev) => prev === maxIndex ? 0 : prev + 1);
        }
    };

    return (
        <Background>
            <Container className="first">
                <SmallContainer><Link to='http://43.201.223.238:3000/profile'>프로필 편집 ⚙️</Link></SmallContainer>
                <RCon><span><Img src={omg} alt="adorable" onClick={increaseIndex}></Img></span>
                    <Profile><strong>{info['name']}</strong><br />@ {info['id']}</Profile></RCon>
                <ProfileMsg>일단 해보자</ProfileMsg>
            </Container>
            <Container>
                <RCon>
                    <SBtn>지금 진행중</SBtn><SBtn className="last">완료</SBtn><div> </div><SBtn className="black"><Link to={'/goal'}>➕ 추가</Link></SBtn>
                </RCon>
                <Slider>
                    <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                        <Row
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "tween", duration: 0.5 }}
                            key={index}
                        >
                            {goals
                                .slice(offset * index, offset * index + offset)
                                .map((goal) => (
                                    <Goalitem
                                        key={shortid.generate()}
                                        variants={BoxVariants}
                                        goaltitle={goal[0]}
                                        goalperiod={goal[1]}
                                        whileHover="hover"
                                        initial="normal"
                                        transition={{ type: "tween" }}
                                        >                                    
                                    </Goalitem>))}
                        </Row>
                    </AnimatePresence>
                </Slider>
                {/* <GCon>
                    {goals.map(one => <Goalitem key={} goaltitle={one[0]} goalperiod={one[1]} />)}
                </GCon> */}
                <RCon >
                    <SBtn><Svg style={{ fill: "#ffd952" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M160 368c26.5 0 48 21.5 48 48v16l72.5-54.4c8.3-6.2 18.4-9.6 28.8-9.6H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16V352c0 8.8 7.2 16 16 16h96zm48 124l-.2 .2-5.1 3.8-17.1 12.8c-4.8 3.6-11.3 4.2-16.8 1.5s-8.8-8.2-8.8-14.3V474.7v-6.4V468v-4V416H112 64c-35.3 0-64-28.7-64-64V64C0 28.7 28.7 0 64 0H448c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H309.3L208 492z" /></Svg></SBtn><div></div>
                    <SBtn><Svg style={{ fill: "#ffd952" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M224 112c-8.8 0-16-7.2-16-16V80c0-44.2 35.8-80 80-80h16c8.8 0 16 7.2 16 16V32c0 44.2-35.8 80-80 80H224zM0 288c0-76.3 35.7-160 112-160c27.3 0 59.7 10.3 82.7 19.3c18.8 7.3 39.9 7.3 58.7 0c22.9-8.9 55.4-19.3 82.7-19.3c76.3 0 112 83.7 112 160c0 128-80 224-160 224c-16.5 0-38.1-6.6-51.5-11.3c-8.1-2.8-16.9-2.8-25 0c-13.4 4.7-35 11.3-51.5 11.3C80 512 0 416 0 288z" /></Svg></SBtn><div></div>
                    <SBtn><Svg style={{ fill: "#ffd952" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M528 160V416c0 8.8-7.2 16-16 16H320c0-44.2-35.8-80-80-80H176c-44.2 0-80 35.8-80 80H64c-8.8 0-16-7.2-16-16V160H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM272 256a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm104-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24H376zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24H376z" /></Svg></SBtn>
                </RCon>
            </Container>
        </Background>
    )
}

export default Main;