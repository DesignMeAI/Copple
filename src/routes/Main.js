import { Link } from "react-router-dom";
import styled from "styled-components";
import omg from "../omg.jpg"
import Goalitem from "../components/Goalitem";

const Img = styled.img`
width:100px;
height:auto;
margin:20px 5px;
border-radius: 50px;
border: solid 3px white;
`
const Background = styled.div`
width: 375px;
height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: default;
  background-color:#FCE8A6 ;
  flex-direction: column;
  border-radius: 10px;
  margin:10px auto;
`;
const Container = styled.div`

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
const SmallContainer = styled.div`
text-align: right;
background: none;
a {
    color: #7E7E7E;
    text-decoration: none;
  }
`
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
    justify-content: center;
    align-items: space-between;

}
`
const Profile = styled.span`
display:block;
padding:50px 30px;
`
const ProfileMsg = styled.span`
    padding-left:15px;
`
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
`
const GCon = styled.div`
height : auto;
display: flex;
flex-direction: row;
background-color: none;
border-radius: 0px;
`
function Main() {
    return (
        <Background>
            <Container className="first">
                <SmallContainer><Link>프로필 편집 ⚙️</Link></SmallContainer>
                <RCon><span><Img src={omg} alt="adorable"></Img></span>
                    <Profile><strong>Username</strong><br />@UserId</Profile></RCon>
                <ProfileMsg>일단 해보자</ProfileMsg>
            </Container>
            <Container>
                <RCon>
                    <SBtn>지금 진행중</SBtn><SBtn className="last">완료</SBtn><div> </div><SBtn className="black">┼ 추가</SBtn>
                </RCon>
                <GCon><Goalitem /><Goalitem /></GCon>
                <RCon>
                    <SBtn>올해</SBtn>
                </RCon>
                <GCon><Goalitem /><Goalitem /></GCon>
                <RCon>
                    <SBtn>icon</SBtn><div></div><SBtn>icon2</SBtn><div></div><SBtn>icon3</SBtn>
                </RCon>
            </Container>
        </Background>
    )
}

export default Main;