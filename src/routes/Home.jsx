import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import shortid from "shortid";
import styles from "../css/Home.module.css";
import styled from "styled-components";
import omg from "../omg.jpg";
import Goalitem from "../components/Goalitem";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { infoState, goalState, modeState } from "../atoms.js";

export default function Home() {
  const [imageURL, setImageURL] = useState(null);
  const info = useRecoilValue(infoState);
  const [goals, setGoals] = useRecoilState(goalState);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");

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
          setImageURL(data.profileImageUrl || "");
        } else {
          console.error("Failed to fetch user information.");
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
          <div className={styles.profileImageSection}>
            <div
              className={styles.imageCircle}
              style={imageURL ? { backgroundImage: `url(${imageURL})` } : {}}
            >
              {!imageURL && <span>+</span>}
            </div>
          </div>
          <Profile>
            <strong>{name}</strong>
            <br />@ {info[0]}
          </Profile>
        </Index1>
        <ProfileMsg>{new Date().toLocaleDateString()}</ProfileMsg>
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

        <IconNav>
          <Icon>
            <Svg
              style={{ fill: "#ffd952" }}
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
            >
              <path d="M160 368c26.5 0 48 21.5 48 48v16l72.5-54.4c8.3-6.2 18.4-9.6 28.8-9.6H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16V352c0 8.8 7.2 16 16 16h96zm48 124l-.2 .2-5.1 3.8-17.1 12.8c-4.8 3.6-11.3 4.2-16.8 1.5s-8.8-8.2-8.8-14.3V474.7v-6.4V468v-4V416H112 64c-35.3 0-64-28.7-64-64V64C0 28.7 28.7 0 64 0H448c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H309.3L208 492z" />
            </Svg>
          </Icon>
          <Icon>
            <Svg
              style={{ fill: "#ffd952" }}
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 448 512"
            >
              <path d="M224 112c-8.8 0-16-7.2-16-16V80c0-44.2 35.8-80 80-80h16c8.8 0 16 7.2 16 16V32c0 44.2-35.8 80-80 80H224zM0 288c0-76.3 35.7-160 112-160c27.3 0 59.7 10.3 82.7 19.3c18.8 7.3 39.9 7.3 58.7 0c22.9-8.9 55.4-19.3 82.7-19.3c76.3 0 112 83.7 112 160c0 128-80 224-160 224c-16.5 0-38.1-6.6-51.5-11.3c-8.1-2.8-16.9-2.8-25 0c-13.4 4.7-35 11.3-51.5 11.3C80 512 0 416 0 288z" />
            </Svg>
          </Icon>
          <Icon>
            <Svg
              style={{ fill: "#ffd952" }}
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 576 512"
            >
              <path d="M528 160V416c0 8.8-7.2 16-16 16H320c0-44.2-35.8-80-80-80H176c-44.2 0-80 35.8-80 80H64c-8.8 0-16-7.2-16-16V160H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM272 256a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm104-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24H376zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24H376z" />
            </Svg>
          </Icon>
        </IconNav>
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
  width: 375px;
  height: 100vh;
  display: flex;
  align-items: stretch;
  padding: 0px;
  justify-content: default;
  background-color: #fce8a6;
  flex-direction: column;
  overflow: hidden;
  margin: 0px auto;
`;
const Container = styled.div`
  position: relative;
  overflow: hidden;
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
