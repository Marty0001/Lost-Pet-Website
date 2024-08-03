import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../auth_context';

export default function Home() {
    const [selectedDate, setSelectedDate] = useState('newest'); // Default to 'newest'
    const [selectedSpecies, setSelectedSpecies] = useState(['all']); // Default to 'all'
    const [minReward, setMinReward] = useState(''); // State for minimum reward input
    const { isLoggedIn, user } = useAuth(); // Get user info to check for login status and username
    const [posts, setPosts] = useState([]); // State to store the posts
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage error state
    const [selectedImage, setSelectedImage] = useState(null); // State to manage selected image for modal
    const [isFilterBoxVisible, setIsFilterBoxVisible] = useState(false); // State to manage filter box visibility
    const [showEditOptions, setShowEditOptions] = useState({}); // State to display the edit and delete post buttons
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Sate to display the delete confirmation popup
    const [postToDelete, setPostToDelete] = useState(null); // Selected post to delete
    const navigate = useNavigate(); // Navigate to re-direct to other pages


    // useEffect hook to fetch posts when the component mounts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch posts from the server, passing the username if the user is logged in to get their liked posts for like button styling
                const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_posts.php?username=${isLoggedIn ? user.username : ''}`);
                if (response.data && response.data.posts) {
                    setPosts(response.data.posts); // Update posts state with the fetched posts
                }
                setLoading(false); // Set loading to false after fetching data
            } catch (error) {
                setError(error.message); // Set error state if there's an error
                setLoading(false); // Set loading to false even if there's an error
            }
        };

        fetchPosts();
    }, [isLoggedIn, user]); // Add user and isLoggedIn to the dependency array

    // Function to format the date into MM/DD/YY format
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    // Function to handle liking a post
    const handleLike = async (post) => {
        // Re-direct to login page if user likes when logged out
        if (!isLoggedIn) {
            navigate('/login')
            return;
        }

        try {
            // Send POST request to like the post
            const response = await axios.post('http://localhost:8080/lost-pet-website/server/posts/like_post.php', {
                username: user.username, // Send the username
                post_id: post.post_id // Send the post ID
            });

            if (response.data.success) {
                // Update the post's like count and liked status
                // p => p.post_id === post.post_id: iterates through all posts until the post id matching the liked post is found
                // ...p, likes: response.data.likes, user_liked: !post.user_liked: update this posts like count, and set the userliked property to toggle the liked heart styling
                setPosts(posts.map(p => p.post_id === post.post_id ? { ...p, likes: response.data.likes, user_liked: !post.user_liked } : p));
            }
        } catch (error) {
            console.error('Error liking the post:', error); // Log error if there's an error
        }
    };

    // Function to handle image click
    const handleImageClick = (image) => {
        setSelectedImage(image); // Set the selected image
    };

    // Toggle the edit and delete button visibility
    const toggleEditOptions = (postId) => {
        setShowEditOptions((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Navigate to edit post page for the chosen post
    const handleEdit = (postId) => {
        navigate(`/edit_post/${postId}`); // Redirect to the edit post page
    };

    // Display modal popup for delete confirmation
    const confirmDelete = (postId) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    // Delete post on confirmation
    const handleDelete = async () => {
        try {
            await axios.post('http://localhost:8080/lost-pet-website/server/posts/delete_post.php', {
                post_id: postToDelete,
                username: user.username
            });
            setPosts(posts.filter(post => post.post_id !== postToDelete));
            setShowDeleteModal(false);
            setPostToDelete(null);
        } catch (error) {
            console.error('Error deleting the post:', error);
        }
    };

    // Close the enlarged image modal
    const closeModal = () => {
        setSelectedImage(null); // Clear the selected image
    };

    // Function to handle checkbox change for multiple selections
    const handleCheckboxChange = (setState, state, value) => {
        setState(
            state.includes(value)
                ? state.filter(item => item !== value)
                : [...state, value]
        );
    };

    // Function to toggle filter box visibility
    const toggleFilterBox = () => {
        setIsFilterBoxVisible(!isFilterBoxVisible);
    };

    // Function to filter and sort posts
    const filterAndSortPosts = (posts) => {
        let filteredPosts = posts;

        // Filter by species
        if (!selectedSpecies.includes('all')) {
            filteredPosts = filteredPosts.filter(post => selectedSpecies.includes(post.species));
        }

        // Filter by minimum reward
        if (minReward !== '') {
            filteredPosts = filteredPosts.filter(post => Number(post.reward) >= minReward);
            console.log(minReward);
        }

        // Sort by date
        if (selectedDate === 'newest') {
            filteredPosts = filteredPosts.sort((a, b) => new Date(b.last_seen_date) - new Date(a.last_seen_date));
        } else if (selectedDate === 'oldest') {
            filteredPosts = filteredPosts.sort((a, b) => new Date(a.last_seen_date) - new Date(b.last_seen_date));
        }

        return filteredPosts;
    };

    // Filter and sort posts
    const filteredAndSortedPosts = filterAndSortPosts(posts);

    // If data is still loading, display a loading message
    if (loading) {
        return <p>Loading...</p>;
    }

    // If there's an error, display an error message
    if (error) {
        return <p>Error: {error}</p>;
    }

    // Posts HTML
    return (
        <div className="posts-container">
            <div className="toggle-filter-box">
                <button onClick={toggleFilterBox}>☰</button>
            </div>
            {isFilterBoxVisible && (
                <div className="filter-sort-box">
                    <h3>Filter & Sort</h3>
                    <div className="filter-option">
                        <label>Date:</label>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedDate === 'newest'}
                                    onChange={() => setSelectedDate('newest')}
                                />
                                Newest
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedDate === 'oldest'}
                                    onChange={() => setSelectedDate('oldest')}
                                />
                                Oldest
                            </label>
                        </div>
                    </div>
                    <div className="filter-option">
                        <label>Species:</label>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSpecies.includes('all')}
                                    onChange={() => handleCheckboxChange(setSelectedSpecies, selectedSpecies, 'all')}
                                />
                                All
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSpecies.includes('Dog')}
                                    onChange={() => handleCheckboxChange(setSelectedSpecies, selectedSpecies, 'Dog')}
                                />
                                Dog
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSpecies.includes('Cat')}
                                    onChange={() => handleCheckboxChange(setSelectedSpecies, selectedSpecies, 'Cat')}
                                />
                                Cat
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSpecies.includes('Bird')}
                                    onChange={() => handleCheckboxChange(setSelectedSpecies, selectedSpecies, 'Bird')}
                                />
                                Bird
                            </label>
                        </div>
                    </div>
                    <div className="filter-option">
                        <label>Minimum Reward:</label>
                        <div>
                            <input
                                type="number"
                                value={minReward}
                                onChange={(e) => setMinReward(e.target.value)}
                                placeholder="$"
                            />
                        </div>
                    </div>
                </div>
            )}
            {filteredAndSortedPosts.map((post, index) => (
                <div key={post.post_id} className="post-card">

                    <div className='post-details'>
                         {post.username === user.username && (
                            <div className="post-edit-options">
                                <button className="three-dot-button" onClick={() => toggleEditOptions(post.post_id)}>...</button>
                                {showEditOptions[post.post_id] && (
                                    <div className="edit-options-popup">
                                        <button onClick={() => handleEdit(post.post_id)}>Edit</button>
                                        <button onClick={() => confirmDelete(post.post_id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                        <span className='post-username'>{post.username} - {post.contact}</span>
                        <span className='post-pet-name'>{post.pet_name}
                            <span className={`status ${post.status === 'Lost' ? 'status-lost' : 'status-found'}`}> : <span>{post.status}</span></span>
                        </span>
                        <span className='post-info'>{post.species} - {post.last_seen_location} - {formatDate(post.last_seen_date)} - Reward: ${post.reward} </span>
                        <p className="post-description">{post.description}</p>
                        <div className="likes-and-comments">
                            <button className={`like-button ${post.user_liked ? 'liked' : ''}`} onClick={() => handleLike(post)}>
                                <span className="heart-icon">❤</span>{new Intl.NumberFormat().format(post.likes)}
                            </button>
                            <button className="comment-button" onClick={() => navigate(`/post/${post.post_id}`)}>
                                <span>💬</span>{post.comments}
                            </button>
                        </div>
                    </div>
                    <br />
                    <div className="post-images">
                        {post.images.map((image, index) => (
                            <img
                                key={index}
                                src={`http://localhost:8080/lost-pet-website/server${image}`}
                                alt="Pet"
                                className="post-image"
                                onClick={() => handleImageClick(`http://localhost:8080/lost-pet-website/server${image}`)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Modal for enlarged image */}
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <img className="modal-content" src={selectedImage} alt="Enlarged Pet" />
                </div>
            )}
            {/* Modal for delete post confirmation*/}
            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <p>Are you sure you want to delete this post?</p>
                        <button className='cancel' onClick={() => setShowDeleteModal(false)}>No</button>
                        <button  className='confirm' onClick={handleDelete}>Yes</button>
                    </div>
                </div>
            )}
        </div>
    );
}
