import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth_context";

export default function EditPost() {
    const { user, isLoggedIn } = useAuth();
    const [petName, setPetName] = useState("");
    const [species, setSpecies] = useState("");
    const [customSpecies, setCustomSpecies] = useState("");
    const [location, setLocation] = useState("");
    const [lastSeenDate, setLastSeenDate] = useState("");
    const [description, setDescription] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [reward, setReward] = useState("");
    const [status, setStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { postId } = useParams();
    const navigate = useNavigate();

    // Fetch post data and autofill form fields
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_single_post.php`, {
                    params: {
                        post_id: postId,
                        username: user.username
                    }
                });
                if (response.data && response.data.post) {
                    const post = response.data.post;

                    // make sure post owner is the logged in user
                    if (post.username !== user.username) {
                        navigate("/");
                        return;
                    }
                    setPetName(post.pet_name);
                    setSpecies(post.species);
                    setCustomSpecies(post.species === "Other" ? post.custom_species : "");
                    setLocation(post.last_seen_location);
                    const formattedDate = new Date(post.last_seen_date).toISOString().split('T')[0];
                    setLastSeenDate(formattedDate);
                    setDescription(post.description);
                    setContactInfo(post.contact);
                    setReward(post.reward);
                    setStatus(post.status);
                }
            } catch (error) {
                setErrorMessage("Failed to fetch post data. Please try again later.");
            }
        };

        if (isLoggedIn) {
            fetchPost();
        } else {
            navigate("/login");
        }
    }, [isLoggedIn, navigate, postId, user.username]);

    const handleSpeciesChange = (e) => {
        const value = e.target.value;
        setSpecies(value);
        if (value !== "Other") {
            setCustomSpecies("");
        }
    };

    const validateForm = () => {
        if (!petName || !species || (species === "Other" && !customSpecies) || !location || !lastSeenDate || !description || !contactInfo) {
            setErrorMessage("Please fill in all required fields.");
            return false;
        }
        return true;
    };

    // Update post data on submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isLoggedIn) {
            setErrorMessage("You need to be logged in to edit a post.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("username", user.username);
        formData.append("petName", petName);
        formData.append("species", species === "Other" ? customSpecies : species);
        formData.append("location", location);
        formData.append("lastSeenDate", lastSeenDate);
        formData.append("description", description);
        formData.append("contactInfo", contactInfo);
        formData.append("reward", reward);
        formData.append("status", status);

        try {
            const response = await axios.post(`http://localhost:8080/lost-pet-website/server/posts/edit_post.php?post_id=${postId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.status === "success") {
                navigate(`/post/${postId}`);
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error editing post", error);
            setErrorMessage("Failed to edit post. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        navigate('/login');
        return;
    }

    return (
        <div className="edit-post-container">
            <h1>Edit Post</h1>
            {errorMessage && <p className="edit-post-error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className="edit-post-form">
                <div className="edit-post-form-group">
                    <label>Pet Name<span className="required">*</span></label>
                    <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        required
                        className="edit-post-form-control"
                    />
                </div>
                <div className="edit-post-form-group">
                    <label>Species<span className="required">*</span></label>
                    <select
                        value={species}
                        onChange={handleSpeciesChange}
                        required
                        className="edit-post-form-control"
                    >
                        <option value="">Select Species</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                    </select>
                    {species === "Other" && (
                        <input
                            type="text"
                            value={customSpecies}
                            onChange={(e) => setCustomSpecies(e.target.value)}
                            placeholder="Enter species"
                            required
                            className="edit-post-form-control"
                        />
                    )}
                </div>
                <div className="edit-post-form-group">
                    <label>Last Seen Location<span className="required">*</span></label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder="City, State"
                        className="edit-post-form-control"
                    />
                </div>
                <div className="edit-post-form-group">
                    <label>Last Seen Date<span className="required">*</span></label>
                    <input
                        type="date"
                        value={lastSeenDate}
                        onChange={(e) => setLastSeenDate(e.target.value)}
                        required
                        className="edit-post-form-control"
                    />
                </div>
                <div className="edit-post-form-group">
                    <label>Contact Info (Email or phone)<span className="required">*</span></label>
                    <input
                        type="tel"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                        className="edit-post-form-control"
                    />
                </div>
                <div className="edit-post-form-group">
                    <label>Reward ($ USD)</label>
                    <input
                        type="number"
                        min={0}
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                        className="edit-post-form-control"
                    />
                </div>
                <div className="edit-post-form-group">
                    <label>Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="edit-post-form-control"
                    >
                        <option value="Lost">Lost</option>
                        <option value="Found">Found</option>
                    </select>
                </div>
                <div className="edit-post-form-group description-group">
                    <label>Description<span className="required">*</span></label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        maxLength={500}
                        className="edit-post-form-control"
                    ></textarea>
                </div>
                <button type="button" onClick={() => navigate(`/post/${postId}`)} className="cancel-edit-post-button">Cancel</button>
                <button type="submit" disabled={loading} className="edit-post-btn-submit">
                    {loading ? "Submitting..." : "Update Post"}
                </button>

            </form>
        </div>
    );
}
