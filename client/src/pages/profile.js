import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth_context';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user, isLoggedIn, logout } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [showEditOptions, setShowEditOptions] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_user_posts.php?username=${user.username}`);
                if (response.data && response.data.posts) {
                    setPosts(response.data.posts);
                }
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user, navigate]);

    const handleLike = async (post) => {
        try {
            const response = await axios.post('http://localhost:8080/lost-pet-website/server/posts/like_post.php', {
                username: user.username,
                post_id: post.post_id
            });
            if (response.data.success) {
                setPosts(posts.map(p => p.post_id === post.post_id ? { ...p, likes: response.data.likes, user_liked: !post.user_liked } : p));
            }
        } catch (error) {
            console.error('Error liking the post:', error);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
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


    // Deletes all users likes, posts, commments, images, everything associated with them
    const handleDeleteProfile = async () => {
        try {
            const response = await axios.post('http://localhost:8080/lost-pet-website/server/users/delete_user.php', {
                username: user.username,
                password: password
            });
            if (response.data.status === 'success') {
                logout();
                navigate('/'); // Redirect to home after successful deletion
            } else {
                setDeleteError(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setDeleteError('Failed to delete profile. Please try again later.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!isLoggedIn) {
        navigate('/login');
        return;
    }

    return (
        <>
            <h1>{user.username}'s Posts</h1>
            <div className="posts-container">
                {posts.length < 1 ? (<p>No posts yet...</p>) : <></>}
                {posts.map(post => (
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
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="profile-actions">
                <button className="delete-profile-button" onClick={() => setShowModal(true)}>Delete Profile</button>
            </div>
            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <p>Are you sure you want to delete this post?</p>
                        <button className='cancel' onClick={() => setShowDeleteModal(false)}>No</button>
                        <button className='confirm' onClick={handleDelete}>Yes</button>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delete Profile</h2>
                        <p>To delete your profile, please enter your password:</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="modal-input"
                        />
                        {deleteError && <p className="modal-error">{deleteError}</p>}
                        <button onClick={handleDeleteProfile} className="modal-confirm-button">Delete Profile</button>
                        <button onClick={() => setShowModal(false)} className="modal-cancel-button">Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
}
