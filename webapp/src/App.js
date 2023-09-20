import React from 'react';
import './App.css';
import Router from './Router';
import { RecoilRoot } from "recoil";
import { ProfileProvider } from './context/ProfileContext';

function App() { 
  return (
    <div className="App">
      <ProfileProvider>
        <RecoilRoot>
          <Router />
        </RecoilRoot>
      </ProfileProvider>
    </div>
  );
}

export default App;
