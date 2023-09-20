import styled from "styled-components";
import omg from "../omg.jpg";
import { motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { goalIdState, modeState } from "../atoms";
import { useNavigate } from "react-router-dom";

function Goalitem({ goaltitle, goalperiod, event_id }) {
  const navigate = useNavigate();
  const [goalId, setGoalId] = useRecoilState(goalIdState);
  const [mode, setMode] = useRecoilState(modeState);
  const goalUpdateHandler = () => {
    setMode("update");
    setGoalId(event_id);
    navigate("/goal");
  };
  return (
    <GoalContainer onClick={goalUpdateHandler}>
      <Img src={omg} alt="goal"></Img>
      <span className="title">{goaltitle}</span>
      <span className="period">{goalperiod}</span>
    </GoalContainer>
  );
}

export default Goalitem;

const Img = styled.img`
  width: auto;
  height: 146px;
  border-radius: 5px;
  background-color: transparent;
  border: none;
`;
const GoalContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  margin: 12px 0px;
  padding: 0px 15px;
  span.title {
    font-weight: 600;
    font-size: 16px;
  }
  span.period {
    padding: 0;
    margin: 0;
    font-weight: 600;
    font-size: 14px;
    color: #7e7e7e;
  }
  position: relative;
`;
