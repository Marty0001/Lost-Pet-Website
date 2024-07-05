import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/lost-pet-website/server/posts/get_post.php');
                if (response.data && response.data.posts) {
                    setPosts(response.data.posts);
                } else {
                    throw new Error('Invalid response structure');
                }
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    const Carousel = ({ images }) => {
        const [currentIndex, setCurrentIndex] = useState(0);

        const nextImage = () => {
            setCurrentIndex((currentIndex + 1) % images.length);
        };

        const prevImage = () => {
            setCurrentIndex((currentIndex - 1 + images.length) % images.length);
        };

        return (
            <div className="carousel-container">
               
                <img src={`http://localhost:8080/lost-pet-website/server${images[currentIndex]}`} alt="Pet" className="carousel-image" />
                <button className="carousel-arrow left" onClick={prevImage}>❮</button>
                <button className="carousel-arrow right" onClick={nextImage}>❯</button>
                <div className="carousel-dots">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="home-container">
            <div className="posts-container">
                {posts.map(post => (
                    <div key={post.post_id} className="post-card">
                        <div className="post-top">
                            <div className="post-details">
                                <span>{post.username} - Contact: {post.contact}</span>
                                <span>Reward: ${post.reward}</span>
                            </div>
                            < br/>
                            <div className="post-details">
                                <div>
                                    <button className="like-button"><span>❤</span>{post.likes}</button>
                                    <button className="comment-button"><span>💬</span>{post.comments}</button>
                                </div>
                                <span className="status">Status: <span>{post.status}</span></span>
                            </div>
                        </div>
                        <div className="post-middle">
                            <h2 className="post-title">{post.pet_name}</h2>
                            <div className="post-subheader">
                                <span>{post.species} - {post.last_seen_location} - {formatDate(post.last_seen_date)}</span>
                            </div>
                            <br />
                            <div className="post-images">
                                <Carousel images={post.images} />
                            </div>
                        </div>
                        <div className="post-bottom">
                            <p className="post-description">{post.description}</p>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
