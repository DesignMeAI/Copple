import React, { useState } from "react";
import styles from "../styles/NavBar.module.css";
import calendaricon from "../assets/calendaricon.svg";
import homeicon from "../assets/homeicon.svg";
import chatboticon from "../assets/chatboticon.svg";
import closeIcon from "../assets/close-icon.svg";
import profileIcon from "../assets/profileIcon.svg";
import { Link } from "react-router-dom";

function NavBar() {
  const [showChat, setShowChat] = useState(false);

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className={styles.NavBarContainer}>
      <div className={styles.NavBarContainerWrap}>
        <Link to="/home" className={styles.homeicon}>
          <img src={homeicon} alt="홈" />
        </Link>
        <Link to="/main" className={styles.calendaricon}>
          <img src={calendaricon} alt="캘린더" />
        </Link>
        <Link
          to="/profile"
          className={styles.profileIcon}
          onClick={handleProfileClick}
        >
          <img src={profileIcon} alt="Profile" />
        </Link>
        <div className={styles.chatbotBackground} onClick={toggleChat}>
          <img src={chatboticon} alt="Chatbot" className={styles.chatboticon} />
        </div>
        {showChat && (
          <div className={styles.chatWindow}>
            <button className={styles.closeButton} onClick={toggleChat}>
              <img src={closeIcon} alt="Close" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
