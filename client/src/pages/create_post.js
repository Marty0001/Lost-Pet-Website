import React, { useState, useRef, useEffect } from "react";import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth_context";

export default function CreatePost() {
    const { user } = useAuth();
    const [petName, setPetName] = useState("");
    const [species, setSpecies] = useState("");
    const [customSpecies, setCustomSpecies] = useState("");
    const [location, setLocation] = useState("");
    const [lastSeenDate, setLastSeenDate] = useState(""); // State for Last Seen Date
    const [description, setDescription] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [reward, setReward] = useState("");
    const [images, setImages] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const fileInputRef = useRef(null);

     // Initialize lastSeenDate to today's date
     useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setLastSeenDate(today);
    }, []);

    const handleSpeciesChange = (e) => {
        const value = e.target.value;
        setSpecies(value);
        if (value !== "Other") {
            setCustomSpecies("");
        }
    };

     // Handle changes to the file input for image uploads
     const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files); // Convert File list to Array
        const limitedFiles = selectedFiles.slice(0, 3); // Limit the number of files to 3
        setImages(limitedFiles); // Update state with selected images
        if (selectedFiles.length > 3) {
            setErrorMessage("You can upload up to 3 images only.");
        } else {
            setErrorMessage("");
        }
    };

    // Remove an image from the list of selected images
    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index); // Create new image list but dont include the removed image
        setImages(newImages);

        // Update the input files to reflect the new images array
        const dataTransfer = new DataTransfer();
        newImages.forEach(file => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
    };

    // Validate the form inputs
    const validateForm = () => {
        // Check for empty fields and custom species if "Other" is selected
        if (!petName || !species || (species === "Other" && !customSpecies) || !location || !lastSeenDate || !description || !contactInfo) {
            setErrorMessage("Please fill in all required fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isLoggedIn) {
            setErrorMessage("You need to be logged in to create a post.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("username", user.username)
        formData.append("petName", petName);
        formData.append("species", species === "Other" ? customSpecies : species); // If other option was selected in dropdown, use the custom species input
        formData.append("location", location);
        formData.append("lastSeenDate", lastSeenDate);
        formData.append("description", description);
        formData.append("contactInfo", contactInfo);
        formData.append("reward", reward);
        images.forEach((image, index) => {
            formData.append(`image${index + 1}`, image);
        });

        try {
            const response = await axios.post("http://localhost:8080/lost-pet-website/server/posts/create_post.php", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.status === "success") {
                navigate("/"); // Redirect to homepage after successful post creation
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error creating post", error);
            setErrorMessage("Failed to create post. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
            <h1>Create Post</h1>
            {errorMessage && <p className="create-post-error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="create-post-form-group">
                    <label>Pet Name<span className="required">*</span></label>
                    <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        required
                        className="create-post-form-control"
                    />
                </div>
                <div className="create-post-form-group">
                    <label>Species<span className="required">*</span></label>
                    <select
                        value={species}
                        onChange={handleSpeciesChange}
                        required
                        className="create-post-form-control"
                    >
                        <option value="">Select Species</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                    </select>
                    {/* If other option is selected, allow user input */}
                    {species === "Other" && (
                        <input
                            type="text"
                            value={customSpecies}
                            onChange={(e) => setCustomSpecies(e.target.value)}
                            placeholder="Enter species"
                            required
                            className="create-post-form-control"
                        />
                    )}
                </div>
                <div className="create-post-form-group">
                    <label>Last Seen Location<span className="required">*</span></label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder="City, State"
                        className="create-post-form-control"
                    />
                </div>
                <div className="create-post-form-group">
                    <label>Last Seen Date<span className="required">*</span></label>
                    <input
                        type="date"
                        value={lastSeenDate}
                        onChange={(e) => setLastSeenDate(e.target.value)}
                        required
                        className="create-post-form-control"
                    />
                </div>
                <div className="create-post-form-group">
                    <label>Contact Info (Email or phone)<span className="required">*</span></label>
                    <input
                        type="tel" // 'tel' for phone number input
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                        className="create-post-form-control"
                    />
                </div>
                <div className="create-post-form-group">
                    <label>Reward ($ USD)</label>
                    <input
                        type="number"
                        min={0}
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                        className="create-post-form-control"
                    />
                </div>
                <div className="create-post-form-group description-group">
                    <label>Description<span className="required">*</span></label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        maxLength={300}
                        className="create-post-form-control"
                    ></textarea>
                </div>
        
                <div className="create-post-form-group">
                    <label>Upload Images (up to 3)<span className="required">*</span></label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        required
                        multiple
                        accept="image/*"
                        className="create-post-form-control"
                        ref={fileInputRef}
                    />
                    <div className="create-post-image-preview">
                        {images.map((image, index) => (
                            <div key={index} className="create-post-image-thumbnail">
                                <img src={URL.createObjectURL(image)} alt={`Upload ${index + 1}`} />
                                <button type="button" onClick={() => handleRemoveImage(index)}>X</button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={loading} className="create-post-btn-submit">
                    {loading ? "Submitting..." : "Find My Pet"}
                </button>
            </form>
        </div>
    );
}
