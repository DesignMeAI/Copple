import { RecoilRoot } from "recoil";
import Router from "./Router";
import "./css/App.css";
import { ProfileProvider } from "./context/ProfileContext";
function App() {
  return (
    <>
      <ProfileProvider>
        <RecoilRoot>
          <Router />
        </RecoilRoot>
      </ProfileProvider>
    </>
  );
}

export default App;
