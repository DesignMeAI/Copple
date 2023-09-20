import React, { createContext, useState, useContext } from "react";

const ProfileContext = createContext();

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);

  const value = {
    profileImage,
    setProfileImage,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
