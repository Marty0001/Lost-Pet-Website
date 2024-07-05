import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth_context";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from auth_context.js

    // Handle form submission for login
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/lost-pet-website/server/users/login_user.php", { username, password });
            if (response.data.status === "success") {
                login(response.data.user); // Login user
                navigate("/"); // Redirect to homepage
                window.location.reload();
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error logging in", error);
            setErrorMessage("Login failed. Please try again later.");
        }
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (

        <div className="login-container">
            <h1>Login</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username or email</label>
                    <br />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <br />
                    <input
                        type={showPassword ? "text" : "password"} // Toggle input type
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="toggle-password" onClick={togglePasswordVisibility}> 👁 </span>
                </div>
                <button type="submit">Login</button>
            </form>
            <span className="login-link">Don't have an account? <Link to="/register">Click here to register</Link></span>
        </div>
    );
}
