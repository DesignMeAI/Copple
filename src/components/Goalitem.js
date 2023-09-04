import styled from "styled-components";
import omg from "../omg.jpg"
import { motion } from "framer-motion"
import { GoalState } from "../atoms.js";


const Img = styled.img`
width:auto;
height:147px;
border-radius: 5px;
background-color: transparent;
border: none;
`
const GoalContainer = styled(motion.div)`
flex-grow:1;
display:flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
margin:12px 0px;
span.title{
    margin-top:5px;
    font-weight:600;
    font-size:16px
}
span.period{
    font-weight: 600;
    font-size:14px;
    color:#7E7E7E;
}
    position:relative;
`;
function Goalitem({ goaltitle, goalperiod }) {
    return <GoalContainer>
        <Img src={omg} alt="goal"></Img>
        <span className="title">{goaltitle}</span>
        <span className="period">{goalperiod}</span>
    </GoalContainer>
}

export default Goalitem;