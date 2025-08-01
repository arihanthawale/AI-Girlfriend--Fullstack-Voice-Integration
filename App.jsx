import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AvatarSelectPage from "./pages/AvatarSelectPage";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/select-avatar" element={<AvatarSelectPage />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}
