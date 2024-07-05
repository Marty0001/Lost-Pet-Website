import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth_context";

export default function Register() {
    // State variables for form fields and loading/error states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Handle form submission for registration
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/lost-pet-website/server/users/register_user.php", {
                username,
                password,
                email,
            });

            if (response.data && response.data.status === "success") {
                 // Automatically log in the user after successful registration
                 const loginResponse = await axios.post("http://localhost:8080/lost-pet-website/server/users/login_user.php", {
                    username,
                    password,
                });

                if (loginResponse.data.status === "success") {
                    login(loginResponse.data.user); // Login user
                    navigate("/"); // Redirect to homepage 
                    window.location.reload();
                } else {
                    setErrorMessage(loginResponse.data.message); // Error message if login fails
                }
            } else {
                // Successful connect, error registering (Username already exists)
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            // Un-successful connect
            console.error("Error registering", error);
            setErrorMessage("Registration failed. Please try again later.");
        } finally {
            setLoading(false); // Set loading state to false after request completes
        }
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <h1>Register</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label> Username</label>
                    <span className="required">*</span>
                    <br/>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        maxLength={20} 
                        minLength={8}
                    />
                </div>

                <div className="form-group">
                    <label> Password</label>
                    <span className="required">*</span>
                    <br/>
                    <input
                        type={showPassword ? "text" : "password"} // Toggle input type
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        maxLength={20} 
                        minLength={8}
                    />
                    <span className="toggle-password" onClick={togglePasswordVisibility}> 👁 </span>
                </div>

                <div className="form-group">
                    <label> Email</label>
                    <span className="required">*</span>
                    <br/>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

            </form>
            <span className="login-link">Already have an account? <Link to="/login">Back to login</Link></span>
        </div>
    );
}
