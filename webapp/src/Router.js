import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./routes/Signup";
import Todo from "./routes/Todo";
import LoginPage from "./routes/LoginPage"
import Home from "./routes/Home"
import Plan from "./routes/Plan"
import Goal from "./routes/Goal"
import ProfilePhotoEdit from './routes/ProfilePhotoEdit.jsx';
import MainPage from './routes/MainPage.jsx';
import PlanListPage from './routes/PlanListPage.jsx';

function Router() {
  return (
    <BrowserRouter>
      <Routes >
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/goal" element={<Goal />} />
        <Route path="/profile" element={<ProfilePhotoEdit />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/planlist/:eventId" element={<PlanListPage />} />
        <Route path="/planlist" element={<PlanListPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
