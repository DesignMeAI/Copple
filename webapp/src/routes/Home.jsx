import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import shortid from "shortid";
import styled from "styled-components";
import Goalitem from "../components/Goalitem";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { infoState, goalState, modeState } from "../atoms.js";
import NavBar from "../components/Navbar";

export default function Home() {
  const [imageURL, setImageURL] = useState(null);
  const info = useRecoilValue(infoState);
  const [goals, setGoals] = useRecoilState(goalState);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const toggleLeaving = () => setLeaving((prev) => !prev);
  const getName = async (id) => {
    await axios({
      method: "post",
      url: "http://3.39.153.9:3000/account/find/id",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      data: {
        user_id: id,
      },
      withCredentials: false,
    }).then((response) => setName(response.data.user_names[0]));
  };

  const doneHandler = (e) => {
    e.target.textContent === "지금 진행중" ? setDone(true) : setDone(false);
    console.log(done);
  };

  async function getData() {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "GET",
      url: "http://3.39.153.9:3000/goal/read",
      withCredentials: false, // 쿠키를 사용하므로 true로 설정
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      setGoals(response.data);
      console.log(response);
    });
  }

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const tokenstring = document.cookie;
        const token = tokenstring.split("=")[1];
        const response = await fetch("http://3.39.153.9:3000/account/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBio(data.information);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching user information:",
          error
        );
      }
    }
    fetchUserProfile();
    getData();
    getName(info[0]);
  }, []);

  const offset = 4;
  // 파일 선택창 열기
  const increaseIndex = () => {
    if (goals) {
      toggleLeaving();
      const totlaGoals = goals.length;
      const maxIndex = Math.ceil(totlaGoals / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  return (
    <Background>
      <Container className="first">
        <SmallContainer>
          <Link to={"/profile"}>프로필 편집 ⚙️</Link>
        </SmallContainer>
        <Index1>
          <ProfileImageSection>
            <ImageCircle
              style={imageURL ? { backgroundImage: `url(${imageURL})` } : {}}
            >
              {!imageURL && <span>+</span>}
            </ImageCircle>
          </ProfileImageSection>
          <Profile>
            <strong>{name}</strong>
            <br />@ {info[0]}
          </Profile>
        </Index1>
        <ProfileMsg>{bio}</ProfileMsg>
      </Container>
      <Container>
        <Index2>
          <SBtn style={{ paddingLeft: "13px" }} onClick={doneHandler}>
            지금 진행중
          </SBtn>
          <SBtn onClick={doneHandler} className="last">
            완료
          </SBtn>
          <div> </div>
          <SBtn className="black">
            <Link to={"/goal"}>➕ 추가</Link>
          </SBtn>
        </Index2>
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
              {done === false &&
                goals.lenght > 1 &&
                goals
                  .slice(offset * index, offset * index + offset)
                  .map((goal) => (
                    <Goalitem
                      key={shortid.generate()}
                      variants={BoxVariants}
                      goaltitle={goal["title"]}
                      goalperiod={goal["content"]}
                      event_id={goal["event_id"]}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                    ></Goalitem>
                  ))}
            </Row>
          </AnimatePresence>
          <StyledButton onClick={increaseIndex}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 384 512"
              style={{ fill: "#ffd952" }}
            >
              <path d="M3.4 81.7c-7.9 15.8-1.5 35 14.3 42.9L280.5 256 17.7 387.4C1.9 395.3-4.5 414.5 3.4 430.3s27.1 22.2 42.9 14.3l320-160c10.8-5.4 17.7-16.5 17.7-28.6s-6.8-23.2-17.7-28.6l-320-160c-15.8-7.9-35-1.5-42.9 14.3z" />
            </svg>
          </StyledButton>
        </Slider>
        <NavBar />
      </Container>
    </Background>
  );
}

const StyledButton = styled.button`
  display: inline;
  position: absolute;
  bottom: 315px;
  right: 10px;
  background-color: transparent;
  border: none;
  &:hover {
    cursor: pointer;
  }
`;
const Img = styled.img`
  width: 100px;
  height: auto;
  margin: 20px 5px;
  border-radius: 50px;
  border: solid 3px white;
`;
const Slider = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 17px;
  width: 90%;
`;
const Row = styled(motion.div)`
  display: grid;
  padding-bottom: 0px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  position: absolute;
  width: 93%;
  height: 200px;
`;
const rowVariants = {
  hidden: {
    x: 500,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -500,
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
    },
  },
};
const Background = styled.div`
  width: 375px;
  margin: 0px auto;
  height: 100vh;
  padding: 0px;
  display: flex;
  /* align-items: stretch; */

  justify-content: center;
  background-color: #fce8a6;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  position: relative;
  padding: 10px 0px;
  height: 600px;
  display: flex;
  margin-top: 0px;
  width: auto;
  background-color: white;
  flex-direction: column;
  &.first {
    padding: 20px 20px;
    margin-bottom: 0px;
    height: 250px;
    background: rgb(248, 245, 167);
    background: linear-gradient(
      42deg,
      rgba(248, 245, 167, 1) 0%,
      rgba(253, 187, 45, 1) 100%
    );
  }
`;
const SmallContainer = styled.div`
  text-align: right;
  background: none;
  a {
    color: #7e7e7e;
    text-decoration: none;
  }
`;
const Index1 = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
  background-color: none;
  border-radius: 0px;
  padding-right: 10px;
  div {
    padding: 0px;
    margin: 0px;
    flex-grow: 0;
  }
  &:last-child {
    position: fixed;
    bottom: 30px;
    width: 375px;
    justify-content: center;
    align-items: space-between;
  }
`;
const Index2 = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
  background-color: none;
  border-radius: 0px;
  padding-right: 10px;
  div {
    padding: 0px;
    margin: 0px;
    flex-grow: 0.9;
  }
  &:last-child {
    position: fixed;
    bottom: 30px;
    width: 375px;
    justify-content: center;
    align-items: space-between;
  }
`;
const IconNav = styled.div`
  height: auto;
  display: flex;
  background-color: transparent;
  border-radius: 0px;
  padding-right: 10px;
  position: fixed;
  bottom: 15px;
  width: 375px;
  justify-content: space-between;
  align-items: center;
`;
const Profile = styled.span`
  display: block;
  padding: 50px 30px;
`;
const ProfileMsg = styled.span`
  padding-left: 15px;
`;
const SBtn = styled.button`
  font-weight: 600;
  font-size: 17px;
  background-color: white;
  margin: 0px 10px;
  border: none;
  &:hover {
    cursor: pointer;
  }
  &.black {
    margin: 0px;
    font-weight: 350;
    background-color: black;
    color: white;
    padding: 5px 10px;
    border-radius: 30px;
  }
  a {
    display: block;
    color: #cccbc7;
    text-decoration: none;
  }
`;
const Icon = styled.button`
  font-size: 17px;
  background-color: transparent;
  margin: 0px;
  border: none;
  &:hover {
    margin: 0px;
    cursor: pointer;
    background-color: transparent;
  }
`;
const Svg = styled.svg`
  width: 30px;
  height: 30px;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 20px;
`;

const ImageCircle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid rgb(0, 175, 41);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  margin-right: 20px;
`;
