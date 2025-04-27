import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import './SinglePost.css';

function SinglePost() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://localhost:3317/posts/${postId}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => console.error('Errore nel recupero del post:', err));
  }, [postId]);

  if (!post) return <div className="single-post">Loading...</div>;

  const hasLiked = user && post.likes.includes(user._id);
  const handleLikeToggle = async () => {
    try {
      const res = await fetch(`http://localhost:3317/likes/${post._id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPost(prev => ({
          ...prev,
          likes: hasLiked
            ? prev.likes.filter(id => id !== user._id)
            : [...prev.likes, user._id]
        }));
      }
    } catch (err) {
      console.error('Errore toggle like:', err);
    }
  };

  const renderMedia = () => {
    const url = post.imageUrl || '';
    const lower = url.toLowerCase();

    if (lower.endsWith('.mp4')) {
      return (
        <video controls className="single-post-video">
          <source src={url} type="video/mp4" />
        </video>
      );
    }

    // qui intercettiamo TUTTI i pdf (anche con querystring)
    if (url.includes('/posts/pdfs/') || lower.includes('.pdf')) {
      return (
        <a
          className="pdf-link"
          href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📄 View PDF
        </a>
      );
    }

    return <img src={url} alt="Post" className="single-post-image" />;
  };

  return (
    <div className="single-post">
      <h2>{post.title}</h2>
      <p className="single-post-content">{post.content}</p>

      {post.imageUrl && renderMedia()}

      <p className="single-post-author">
        👤 Author:{" "}
        <Link to={`/profile/${typeof post.author === 'string' ? post.author : post.author._id}`}>
          {typeof post.author === 'string' ? post.author : post.author.username}
        </Link>
      </p>

    </div>
  );
}

export default SinglePost;
