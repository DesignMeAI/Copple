import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./routes/Signup";
import Finding from "./routes/Finding";
import Todo from "./routes/Todo";
import Home from "./routes/Home"
import Main from "./routes/Main"

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/find" element={<Finding />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
