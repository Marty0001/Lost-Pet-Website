import Navbar from "./nav_bar"
import CreatePost from "./pages/create_post"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register";
import Profile from "./pages/profile";
import EditProfile from "./pages/edit_profile";
import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create_post" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit_profile" element={<EditProfile />} />
        </Routes>
      </div>
    </>
  )
}

export default App


