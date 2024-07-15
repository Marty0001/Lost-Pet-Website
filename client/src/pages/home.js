import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../auth_context';

export default function Home() {
    const { isLoggedIn, user } = useAuth(); // Get user info to check for login status and username
    const [posts, setPosts] = useState([]); // State to store the posts
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage error state
    const navigate = useNavigate(); // Navigate to re-direct to other pages

    // useEffect hook to fetch posts when the component mounts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch posts from the server, passing the username if the user is logged in to get their liked posts for like button styling
                const response = await axios.get(`http://localhost:8080/lost-pet-website/server/posts/get_post.php?username=${isLoggedIn ? user.username : ''}`);
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
            {posts.map(post => (
                <div key={post.post_id} className="post-card">
                    <div className='post-details'>
                        <span className='post-username'>{post.username} - {post.contact}</span>
                        <span className='post-pet-name'>{post.pet_name}
                            <span className="status"> : <span>{post.status}</span></span>
                        </span>
                        <span className='post-info'>{post.species} - {post.last_seen_location} - {formatDate(post.last_seen_date)} - Reward: ${post.reward} </span>
                        <p className="post-description">{post.description}</p>
                        <div className="likes-and-comments">
                            <button className={`like-button ${post.user_liked ? 'liked' : ''}`} onClick={() => handleLike(post)}>
                                <span className="heart-icon">❤</span>{post.likes}
                            </button>
                            <button className="comment-button"><span>💬</span>{post.comments.length}</button>
                        </div>
                    </div>
                    <br />
                    <div className="post-images">
                        {post.images.map((image, index) => (
                            <img key={index} src={`http://localhost:8080/lost-pet-website/server${image}`} alt="Pet" className="post-image" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
