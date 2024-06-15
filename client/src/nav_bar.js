// Navigation bar at top of website for changing pages

/**
 * @todo 
 * If user is not logged in, create post routes to login page
 * If user is logged in, login link becomes profile link
 * If profile is hovered, have option to view profile or logout
 */


import { Link, useMatch, useResolvedPath } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="nav">
            <Link to="/" className="site-title">
                Lost Pet Webstite
            </Link>
            <ul>
                <CustomLink to="/">Home</CustomLink>
                <CustomLink to="/create_post">Create Post</CustomLink>
                <CustomLink to="/login">Login</CustomLink>
            </ul>
        </nav>
    )
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}


