import { RecoilRoot } from "recoil";
import Router from "./Router";
import "./css/App.css";
function App() {
  return (
    <>
      <RecoilRoot>
        <Router />
      </RecoilRoot>
    </>
  );
}

export default App;
