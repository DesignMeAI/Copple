import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import shortid from "shortid";
import styled from "styled-components";
import Goalitem from "../components/Goalitem";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  infoState,
  modeState,
  nameState,
  goalListState,
  goalState,
} from "../atoms.js";
import NavBar from "../components/Navbar";

export default function Home() {
  const tokenstring = document.cookie;
  const token = tokenstring.split("=")[1];
  const [imageURL, setImageURL] = useState(null);
  const [goals, setGoals] = useRecoilState(goalState);
  const [goalList, setGoalList] = useRecoilState(goalListState);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const info = useRecoilValue(infoState);
  const [name, setName] = useRecoilState(nameState);
  const [bio, setBio] = useState("");
  const [mode, setMode] = useRecoilState(modeState);

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
    }).then((response) => {
      setName(response.data.user_names[0]);
      axios({
        method: "POST",
        url: "http://3.39.153.9:3000/account/profile",
        withCredentials: false, // 쿠키를 사용하므로 true로 설정
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        data: {
          user_id: info,
          user_name: name,
        },
      }).then((response) => {
        setBio(response.data.introduction || "");
        setImageURL(response.data.profileImageUrl || "");
      });
    });
  };

  const doneHandler = (e) => {
    e.target.textContent === "지금 진행중" ? setDone(true) : setDone(false);
    console.log(done);
  };

  async function getData() {
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
      setGoalList(response.data);
      console.log(response);
    });
  }
  // async function fetchUserProfile() {
  //   try {
  //     const tokenstring = document.cookie;
  //     const token = tokenstring.split("=")[1];
  //     await axios({
  //       method: "POST",
  //       url: "http://3.39.153.9:3000/account/profile",
  //       withCredentials: false, // 쿠키를 사용하므로 true로 설정
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       data: {
  //         user_id: info,
  //         user_name: name,
  //       },
  //     }).then(async (response) => {
  //       await setBio(response.data.introduction || "");
  //       await setImageURL(response.data.profileImageUrl || "");
  //     });
  //   } catch (error) {
  //     console.error(
  //       "An error occurred while fetching user information:",
  //       error
  //     );
  //   }
  // }
  useEffect(() => {
    getName(info);
    // fetchUserProfile();
    getData();
    setMode(null);
  }, []);

  const offset = 4;
  // 파일 선택창 열기
  const increaseIndex = () => {
    if (goalList) {
      toggleLeaving();
      const totlaGoals = goalList.length;
      const maxIndex = Math.ceil(totlaGoals / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  return (
    <Background>
      <Container className="first">
        <SmallContainer>
          <Link to={"/profile"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
              style={{ fill: "#6d6c69" }}
            >
              <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
            </svg>
          </Link>
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
            <br />@ {info}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 448 512"
              style={{ fill: "#fffce5", height: "20" }}
            >
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
            </svg>
            <Link to={"/goal"}> 추가</Link>
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
                goalList.length > 0 &&
                goalList
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
  right: 20px;
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
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0px;
    font-weight: 350;
    line-height: 10px;
    padding: 0px;
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
