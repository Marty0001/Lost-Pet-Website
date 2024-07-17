import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// AuthProvider component to wrap around parts of the app that need access to auth state
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ username: '' }); // Empty username is not logged in

    useEffect(() => {
        // Check if the user is logged in when the component mounts
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Function to log in the user and save the user data to local storage
    const login = (userInfo) => {
        setIsLoggedIn(true);
        setUser(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
        console.log(userInfo);
    };

    // Function to log out the user and remove the user data from local storage
    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("user");
    };

    // Provide the authentication state and functions to the component tree
    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
