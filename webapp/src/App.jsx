import { RecoilRoot } from "recoil";
import Router from "./Router";
import "./css/App.css";
import { ProfileProvider } from "./context/ProfileContext";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

function App() {
  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <ProfileProvider>
      <RecoilRoot>
        <Router />
      </RecoilRoot>
    </ProfileProvider>
    </LocalizationProvider>
    </>
  );
}

export default App;
