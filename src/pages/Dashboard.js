import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:3317/posts/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setPosts(data);
        } else if (data.message === 'Token non valido') {
          alert('⚠️ Session expired. Please log in again.');
          logout();
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchUserPosts();
  }, [logout]);

  const handleChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Missing token!');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      if (imageFile) formData.append('image', imageFile);

      const response = await fetch('http://localhost:3317/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (response.ok) {
        setPosts((prev) => [...prev, data.post]);
        setNewPost({ title: '', content: '' });
        setImageFile(null);
        document.querySelector('input[name="image"]').value = null;
      } else {
        alert(data.message || 'Error creating post');
        if (data.message === 'Token non valido') logout();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this project?')) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Missing token!');

    try {
      const response = await fetch(`http://localhost:3317/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      console.error('DELETE error:', err);
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditData({ title: post.title, content: post.content });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Missing token!');

    try {
      const response = await fetch(`http://localhost:3317/posts/${editingPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const data = await response.json();
      if (response.ok) {
        setPosts((prev) => prev.map((p) => (p._id === editingPostId ? data.post : p)));
        setEditingPostId(null);
      }
    } catch (err) {
      console.error('UPDATE error:', err);
    }
  };

  if (!user) return <Navigate to="/" />;

  return (
    <div className="dashboard-container">
      <h1> Hello, {user.username}!</h1>
      <p>Welcome to your personal area. Here you can manage your projects.</p>

      <form onSubmit={handleSubmit} className="new-project-form" encType="multipart/form-data">
        <h2>➕ Add a New Project</h2>
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={newPost.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Description"
          value={newPost.content}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          accept="image/*,video/*,.pdf"
          name="image"
          onChange={handleImageChange}
        />
        {imageFile && (
          <div style={{ marginTop: '10px' }}>
            {imageFile.type.startsWith('video') ? (
              <video width="300" controls>
                <source src={URL.createObjectURL(imageFile)} type={imageFile.type} />
                Your browser does not support video.
              </video>
            ) : imageFile.name.toLowerCase().endsWith('.pdf') ? (
              <p>📄 PDF selected: {imageFile.name}</p>
            ) : (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                width="200"
                style={{ borderRadius: '10px' }}
              />
            )}
          </div>
        )}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? '⏳ Uploading...' : '📤 Publish Project'}
        </button>
      </form>

      <div className="dashboard-preview">
        <h2>📂 Your Projects</h2>
        {posts.length === 0 ? (
          <p>You have no projects yet. Start now!</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post._id} className="project-item">
                {editingPostId === post._id ? (
                  <form onSubmit={handleUpdate} className="edit-form">
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      required
                    />
                    <textarea
                      name="content"
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      required
                    />
                    <div className="form-buttons">
                      <button className="save-btn" type="submit">📂 Save</button>
                      <button className="cancel-btn" type="button" onClick={() => setEditingPostId(null)}>❌ Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <strong>{post.title}</strong><br />
                    <em>{post.content}</em><br />
                    {post.imageUrl && (
                      post.imageUrl.toLowerCase().endsWith('.mp4') ? (
                        <video controls width="300">
                          <source src={post.imageUrl} type="video/mp4" />
                          Your browser does not support video.
                        </video>
                      ) : post.imageUrl.includes('/posts/pdfs/') ? (
                        <a
                          href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.imageUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 View PDF
                        </a>
                      ) : (
                        <img src={post.imageUrl} alt="Post" width="200" />
                      )
                    )}
                    <br />
                    <button className="edit-btn" onClick={() => startEditing(post)}>✏️ Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(post._id)}>🗑️ Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
