import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import shortid from "shortid";
import styles from "../styles/Home.module.css";
import styled from "styled-components";
import omg from "../omg.jpg";
import Goalitem from "../components/Goalitem";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { infoState, goalState } from "../atoms.js";
import NavBar from "../components/Navbar";

const Img = styled.img`
  width: 100px;
  height: auto;
  margin: 20px 5px;
  border-radius: 50px;
  border: solid 3px white;
`;
const Slider = styled.div`
  position: absolute;
  padding: 0px;
  top: 60px;
  width: 100%;
`;
const Row = styled(motion.div)`
  display: grid;
  padding-bottom: 0px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  position: absolute;
  width: 100%;
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
  height: 97vh;
  display: flex;
  align-items: stretch;
  padding: 0px;
  justify-content: default;
  background-color: #fce8a6;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  margin: 0px auto;
`;
const Container = styled.div`
  position: relative;
  overflow: hidden;
  padding: 10px 0px;
  height: 540px;
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
const Index = styled.div`
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

export default function Home() {
  const [imageURL, setImageURL] = useState(null);
  const [info, setInfo] = useRecoilState(infoState);
  const fileInput = useRef(null);
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
    console.log(tokenstring);
    await axios({
      method: "GET",
      url: "http://3.39.153.9:3000/goal/read",
      withCredentials: false, // 쿠키를 사용하므로 true로 설정
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => setGoals(response.data));
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
      const totlaGoals = goals.length - 1;
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
        <Index>
          <div className={styles.profileImageSection}>
            <div
              onClick={increaseIndex}
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
        </Index>
        <ProfileMsg>{new Date().toLocaleDateString()}</ProfileMsg>
      </Container>
      <Container>
        <Index>
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
        </Index>
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
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                    ></Goalitem>
                  ))}
            </Row>
          </AnimatePresence>
        </Slider>
      <NavBar />
      </Container>
    </Background>
  );
}