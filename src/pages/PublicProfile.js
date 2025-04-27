// PublicProfile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PublicProfile.css';

function PublicProfile() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [publicPalette, setPublicPalette] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`http://localhost:3317/profile/${userId}`);
        const data = await res.json();
        setUsername(data.username || '(unknown user)');
        setProfileImage(data.profileImage || 'https://via.placeholder.com/120');
        setBio(data.bio || 'No bio available.');
      } catch (error) {
        console.error('Error fetching public profile:', error);
      }
    };
    fetchUserData();
  }, [userId]);


useEffect(() => {
  const fetchUserPosts = async () => {
    try {
      let res = await fetch(`http://localhost:3317/posts/user/${userId}`);
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        // fallback: prendi tutti i post pubblici e filtra in client
        res = await fetch('http://localhost:3317/posts/public');
        data = await res.json();
        data = data.filter(p => {
          // author può essere stringa o oggetto {_id}
          const authorId = typeof p.author === 'string'
            ? p.author
            : (p.author && (p.author._id || p.author.id));
          return String(authorId) === String(userId);
        });
      }
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };
  fetchUserPosts();
}, [userId]);


  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3317/moodboard/palette/${userId}`)
      .then(res => res.json())
      .then(data => setPublicPalette(data.globalPalette || []))
      .catch(err => console.error('Error fetching public palette:', err));
  }, [userId]);

  return (
    <div className="public-profile-container">
      <h1>👤 {username}’s Profile</h1>

      <div className="public-profile-header">
        <img
          src={profileImage}
          alt="Profile"
          className="public-profile-image"
        />
        <p className="public-profile-bio">{bio}</p>
      </div>

      <div className="palette-section">
        <h4> {username}’s Visual Palette</h4>
        {publicPalette.length > 0 ? (
          <div className="palette-colors">
            {publicPalette.map((rgb, idx) => (
              <div
                key={idx}
                className="palette-circle"
                style={{ backgroundColor: `rgb(${rgb.join(',')})` }}
                title={`rgb(${rgb.join(',')})`}
              />
            ))}
          </div>
        ) : (
          <p className="no-palette-msg">
            No palette generated yet. This user hasn’t saved any images to their moodboard.
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <p>No projects posted yet.</p>
      ) : (
        <div className="public-post-list">
          {posts.map(post => (
            <div key={post._id} className="public-post-card">
              <h3>{post.title}</h3>
              <p className="post-content">{post.content}</p>

              {/* PDF Link moved below title & description */}
              {post.imageUrl && post.imageUrl.includes('/posts/pdfs/') && (
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.imageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-link"
                >
                  📄 View PDF
                </a>
              )}

              {post.imageUrl && !post.imageUrl.includes('/posts/pdfs/') && (
                post.imageUrl.toLowerCase().endsWith('.mp4') ? (
                  <video
                    width="100%"
                    controls
                    className="public-post-video"
                  >
                    <source src={post.imageUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="public-post-image"
                  />
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicProfile;
