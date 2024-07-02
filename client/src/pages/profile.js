
import { Link } from "react-router-dom";
import { useAuth } from "../auth_context";

export default function Profile() {
    const { user } = useAuth();

    return (
        <>
            <h1>{user.username}</h1>
            <Link to="/edit_profile">Edit profile</Link>
        </>
    );
}