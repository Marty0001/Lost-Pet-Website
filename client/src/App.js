import Navbar from "./nav_bar"
import CreatePost from "./pages/create_post"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register";
import Profile from "./pages/profile";
import PostComments from "./pages/post_comments";
import EditPost from "./pages/edit_post";
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
          <Route path="/post/:postId" element={<PostComments />} /> 
          <Route path="/edit_post/:postId" element={<EditPost />} /> 
        </Routes>
      </div>
    </>
  )
}

export default App
