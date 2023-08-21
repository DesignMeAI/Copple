import styled from "styled-components";
import omg from "../omg.jpg"

const Img = styled.img`
width:auto;
height:147px;
border-radius: 5px;
border: none;
`
const GoalContainer = styled.div`

flex-grow:1;
display:flex;
flex-direction: column;
margin:12px 0px;
padding:10px;
span.title{
    font-weight:600;
    font-size:16px
}
span.period{
    font-weight: 600;
    font-size:14px;
    color:#7E7E7E;
}
`


function Goalitem() {
    return <GoalContainer>
        <Img src={omg} alt="goal"></Img>
        <span className="title">GoalTitle</span>
        <span className="period">Period</span>
    </GoalContainer>
}

export default Goalitem;