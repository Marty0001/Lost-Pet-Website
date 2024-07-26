import React, { useEffect, useRef, useState } from "react";
import { Link, useMatch, useResolvedPath, useLocation } from "react-router-dom";
import { useAuth } from "./auth_context";

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth(); // Get auth state and functions
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const profilePicPath = 'http://localhost:8080/Lost-Pet-Website/server/images/profile_pics/';

    // Close the dropdown menu when something is clicked outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Handle logout, close dropdown, navigate to home page, and reload
    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        window.location.reload();
    };

    const isProfileActive = location.pathname === '/profile' || location.pathname === '/edit_profile';

    return (
        <nav className="nav">
            <Link to="/" className="site-title">
                Lost Pet Search
            </Link>
            <ul>
                <CustomLink to="/" shouldSetActive={true}>Home</CustomLink>
                <CustomLink to={isLoggedIn ? "/create_post" : "/login"} shouldSetActive={isLoggedIn}>Create Post</CustomLink> {/* Re-direct to login page if not logged in */}
                <li className="dropdown" ref={dropdownRef}>
                    <button className={`dropdown-toggle ${isProfileActive ? 'active' : ''}`} onClick={toggleDropdown}>
                        {/*Check if logged in. If logged in, user their profile pic or default if its null. Use default it not logged in */}
                        <img
                            src={`${profilePicPath}default.jpg`}
                            alt="Profile"
                            className="profile-pic"
                        />
                    </button>
                    {showDropdown && (
                        <ul className="dropdown-menu">
                            {isLoggedIn ? (
                                <>
                                    <li>
                                        <Link to="/profile" onClick={toggleDropdown}>{user.username}</Link>
                                        <span>{user.email}</span>
                                    </li>
                                    <li>
                                        <Link to="/profile" onClick={toggleDropdown}>My Posts</Link>
                                    </li>
                                    <li>
                                        <Link to="/" onClick={handleLogout}>Logout</Link>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <Link to="/login" onClick={toggleDropdown}>Login</Link>
                                </li>
                            )}
                        </ul>
                    )}
                </li>
            </ul>
        </nav>
    );
}

// CustomLink component to navigate between pages and set them to active
function CustomLink({ to, children, shouldSetActive, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={isActive && shouldSetActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    );
}
