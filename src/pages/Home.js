import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import './Home.css';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

function Home() {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [modalVisible, setModalVisible] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [query, setQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3317/posts/public')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error(err));
  }, []);

  const toggleComments = postId =>
    setExpandedComments(ec => ({ ...ec, [postId]: !ec[postId] }));

  const handleLikeToggle = async postId => {
    try {
      const res = await fetch(`http://localhost:3317/likes/${postId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const { message } = await res.json();
        return alert(message || 'Errore like');
      }
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.includes(user._id)
                  ? p.likes.filter(id => id !== user._id)
                  : [...p.likes, user._id]
              }
            : p
        )
      );
    } catch (e) { console.error(e); }
  };

  const handleShare = async postId => {
    try {
      const res = await fetch(`http://localhost:3317/posts/${postId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const { message } = await res.json();
        return alert(message || 'Errore share');
      }
      const { link } = await res.json();
      setSharedLink(link);
      setModalVisible(true);
    } catch (e) { console.error(e); }
  };

  const handleSearch = useCallback(value => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = value.trim()
          ? `http://localhost:3317/posts/search?query=${encodeURIComponent(value)}`
          : 'http://localhost:3317/posts/public';
        const res = await fetch(url);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch {
        setPosts([]);
      }
    }, 400);
    setQuery(value);
  }, []);

  const deleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(
        `http://localhost:3317/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = await res.json();
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, comments: updated } : p))
      );
    } catch (e) { console.error(e); }
  };

  const highlightMatch = (text) => {
    if (!query) return text;
    return text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
  };

  return (
    <>
      <input
        type="text"
        placeholder="🔍  Search..."
        className="search-input sticky-search"
        value={query}
        onChange={e => handleSearch(e.target.value)}
      />

      <div className="home-container">
        <h1 className="home-title">Discover all the projects</h1>
        {posts.length === 0 ? (
          <p>Nessun post pubblicato ancora!</p>
        ) : (
          <div className="post-list">
            {posts.map((post, index) => {
              const hasLiked = post.likes.includes(user?._id);
              return (
                <div
                  key={post._id}
                  className="post-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="post-header">
                    <h2
                      className="post-title"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(post.title)
                      }}
                    />
                    <p className="post-content">{post.content}</p>
                  </div>

                  {post.imageUrl && (
                    post.imageUrl.endsWith('.mp4') ? (
                      <video controls className="post-video">
                        <source src={post.imageUrl} type="video/mp4" />
                      </video>
                    ) : post.imageUrl.includes('/posts/pdfs/') ? (
                      <a
                        href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.imageUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="post-pdf"
                      >
                        📄 Visualizza PDF
                      </a>
                    ) : (
                      <img src={post.imageUrl} alt="Post" className="post-image" />
                    )
                  )}

                  {post.author && (
                    <div className="post-author">
                      <Link to={`/profile/${post.author._id}`} className="author-username">
                        {post.author.username}
                      </Link>
                    </div>
                  )}

                  <div className="like-row">
                    <button
                      onClick={() => handleLikeToggle(post._id)}
                      className={`like-button ${hasLiked ? 'liked' : ''}`}
                    >
                      {hasLiked ? '❤️' : '🤍'}
                    </button>
                    <span>{post.likes.length} like{post.likes.length !== 1 && 's'}</span>
                    {user && (
                      <button
                        onClick={() => handleShare(post._id)}
                        className="share-button"
                      >
                        🔄 Share
                      </button>
                    )}
                  </div>

                  <div className="comment-section">
                    {post.comments?.length > 0 && (
                      <>
                        <div className="comment-preview">
                          <strong>{post.comments[0].user?.username || 'Anonimo'}:</strong>
                          <span> {post.comments[0].text}</span>

                          {/* DELETE ON PREVIEW */}
                          {post.comments[0].user?._id === user?._id && (
                            <button
                              onClick={() =>
                                deleteComment(post._id, post.comments[0]._id)
                              }
                              className="delete-comment-button"
                              title="Elimina commento"
                              style={{ position: 'absolute', top: '0.5rem', right: '1rem' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>

                        {post.comments.length > 1 && (
                          <button
                            className="show-all-comments-btn"
                            onClick={() => toggleComments(post._id)}
                          >
                            {expandedComments[post._id]
                              ? 'Hide comments'
                              : `Show all ${post.comments.length} comments`}
                          </button>
                        )}

                        {expandedComments[post._id] && (
                          <ul className="comment-list expanded">
                            {post.comments.map(c => (
                              <li key={c._id} className="comment">
                                <strong>{c.user?.username || 'Anonimo'}:</strong> {c.text}
                                <div className="comment-date">
                                  🕒 {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: it })}
                                </div>
                                {c.user?._id === user?._id && (
                                  <button
                                    onClick={() => deleteComment(post._id, c._id)}
                                    className="delete-comment-button"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    {user && (
                      <form
                        onSubmit={async e => {
                          e.preventDefault();
                          const text = e.target.comment.value.trim();
                          if (!text) return;
                          const res = await fetch(`http://localhost:3317/posts/${post._id}/comments`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ text })
                          });
                          const updated = await res.json();
                          setPosts(p =>
                            p.map(item =>
                              item._id === post._id ? { ...item, comments: updated } : item
                            )
                          );
                          e.target.reset();
                        }}
                        className="comment-form"
                      >
                        <input
                          type="text"
                          name="comment"
                          placeholder="Add a comment..."
                          className="comment-input"
                        />
                        <button type="submit" className="comment-button">
                          Send
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🎉 Post condiviso!</h3>
            <p>Puoi copiare questo link e inviarlo:</p>
            <input type="text" value={sharedLink} readOnly className="modal-input" />
            <button onClick={() => { navigator.clipboard.writeText(sharedLink); alert('Link copiato! 📋'); }}>
              📋 Copia Link
            </button>
            <button onClick={() => setModalVisible(false)}>Chiudi</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
