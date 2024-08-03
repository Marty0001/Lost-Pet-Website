import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth_context';

export default function PostComments() {
    const { isLoggedIn, user } = useAuth(); // login and user status
    const { postId } = useParams(); // PostId from the url params 
    const [post, setPost] = useState(null); // Holds the post details
    const [comments, setComments] = useState([]); // Holds the list of comments
    const [loading, setLoading] = useState(true); // Indicates loading state
    const [error, setError] = useState(null); // Holds any error messages
    const [newComment, setNewComment] = useState(''); // Holds the new comment text
    const [commentError, setCommentError] = useState(''); // Holds comment-related error messages
    const [toggledComment, setToggledComment] = useState(null); // Tracks the index of the delete comment button visibility
    const [selectedImage, setSelectedImage] = useState(null); // State to manage selected image for modal
    const [showEditOptions, setShowEditOptions] = useState({}); // State to display the edit and delete post buttons
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Sate to display the delete confirmation popup
    const [postToDelete, setPostToDelete] = useState(null); // Selected post to delete
    const navigate = useNavigate(); // Hook for navigation

    const fetchPostDetails = useCallback(async () => {
        try {
            // Fetch the post details from the server
            const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_single_post.php?post_id=${postId}&username=${isLoggedIn ? user.username : ''}`);
            if (response.data && response.data.post) {
                setPost(response.data.post); // Set the post details
            }
        } catch (error) {
            setError(error.message);
        }
    }, [postId, isLoggedIn, user]); // Dependencies: refetch when postId, isLoggedIn, or user changes

    const fetchComments = useCallback(async () => {
        try {
            // Fetch comments for the post from the server
            const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_comments.php?post_id=${postId}`);
            if (response.data && response.data.comments) {
                setComments(response.data.comments); // Set the comments
            }
            setLoading(false); // Set loading to false after fetching comments
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }, [postId]); // Dependency: refetch when postId changes

    useEffect(() => {
        fetchPostDetails(); // Fetch post details
        fetchComments(); // Fetch comments
    }, [fetchPostDetails, fetchComments]); // Dependencies: run effect when fetchPostDetails or fetchComments change

    // Handler for submitting a new comment
    const handleCommentSubmit = async () => {
        if (!isLoggedIn) {
            setCommentError('Must be logged in to comment!'); // Set error if user is not logged in
            return;
        }

        if (newComment.length < 1) {
            setCommentError('Comment too short!'); // Set error if comment is too short
            return;
        }

        try {
            // Send a POST request to add a new comment
            const response = await axios.post('http://localhost:8080/lost-pet-website/server/posts/create_comment.php', {
                username: user.username,
                post_id: postId,
                comment: newComment
            });

            if (response.data.success) {
                await fetchComments(); // Refresh comments list after adding the new comment
                setNewComment(''); // Clear the new comment input field
                setPost(prevPost => ({ ...prevPost, comments: response.data.comment_count })); // Update the comment count in the post details
            }
        } catch (error) {
            console.error('Error adding comment:', error); // Log error in console
            alert('An error occurred while adding the comment.'); // Display alert in case of error
        }
    };

    // Handler for deleting a comment
    const handleCommentDelete = async (comment_id, index) => {
        try {
            const response = await axios.delete(`http://localhost:8080/lost-pet-website/server/posts/delete_comment.php?comment_id=${comment_id}`);

            if (response.data.success) {
                toggleDropdown(index); // Hide the dropdown after comment is deleted
                setComments(comments.filter(comment => comment.comment_id !== comment_id)); // Remove deleted comment
                setPost(prevPost => ({ ...prevPost, comments: response.data.comment_count })); // Update comment count
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting the comment:', error);
            alert('An error occurred while deleting the comment.');
        }
    };

    // Handler for liking a post
    const handleLike = async (post) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/lost-pet-website/server/posts/like_post.php', {
                username: user.username,
                post_id: post.post_id
            });

            if (response.data.success) {
                // Update post like status and count
                setPost({ ...post, likes: response.data.likes, user_liked: !post.user_liked });
            }
        } catch (error) {
            console.error('Error liking the post:', error);
            alert('An error occurred while liking the post.');
        }
    };

    // Function to format the date string
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

            setShowDeleteModal(false);
            setPostToDelete(null);
            navigate('/');
        } catch (error) {
            console.error('Error deleting the post:', error);
        }
    };

    // Function to toggle the visibility of delete comment button
    const toggleDropdown = (index) => {
        setToggledComment(toggledComment === index ? null : index);
    };

    // Function to handle image click
    const handleImageClick = (image) => {
        setSelectedImage(image); // Set the selected image
    };

    // Function to close the modal
    const closeModal = () => {
        setSelectedImage(null); // Clear the selected image
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="post-details-container">
            {!post ? (
                <p>Post not found</p>
            ) : (
                <>
                    <div className="post-card">
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
                                <button className="comment-button" onClick={() => navigate(`/post/${post.post_id}`, { state: { post } })}>
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
                    <div className="comments-section">
                        <div className="add-comment">
                            {commentError ? (<span>{commentError}</span>) : <></>}
                            <textarea
                                placeholder="Add a comment..."
                                maxLength={300}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                            <button onClick={handleCommentSubmit}>Add Comment</button>
                        </div>

                        {comments.map((comment, index) => (
                            <div key={index} className="comment">
                                <span className="comment-header">{comment.username}<span className="comment-date">{formatDate(comment.created_at)}</span></span>
                                <p>{comment.comment}</p>
                                {toggledComment === index && <button className='delete-comment-button' onClick={() => handleCommentDelete(comment.comment_id, index)}>Delete Comment</button>}
                                {/* Toggles the visibility of the delete comment button */}
                                {comment.username === user.username && (<button className='delete-comment-toggle' onClick={() => toggleDropdown(index)}>...</button>)}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showDeleteModal && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <p>Are you sure you want to delete this post?</p>
                        <button className='cancel' onClick={() => setShowDeleteModal(false)}>No</button>
                        <button className='confirm' onClick={handleDelete}>Yes</button>
                    </div>
                </div>
            )}

            {/* Modal for enlarged image */}
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <img className="modal-content" src={selectedImage} alt="Enlarged Pet" />
                </div>
            )}
        </div>
    );
}
