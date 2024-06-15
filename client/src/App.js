import Navbar from "./nav_bar"
import CreatePost from "./pages/create_post"
import Home from "./pages/home"
import Login from "./pages/login"
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
        </Routes>
      </div>
    </>
  )
}

export default App


