// Profile.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MoodboardSearch from '../components/MoodboardSearch';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3317/profile/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setProfileData(data))
      .catch(err => console.error('Errore profilo utente loggato:', err));
  }, []);

  const [view, setView] = useState('myposts');
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedImages, setSavedImages] = useState([]);
  const [globalPalette, setGlobalPalette] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);


  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:3317/moodboard/palette/global', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setGlobalPalette(data.globalPalette || []))
      .catch(err => console.error('Errore palette globale:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3317/posts/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setMyPosts(data))
      .catch(err => console.error('Errore fetch miei post:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3317/likes/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setLikedPosts(data))
      .catch(err => console.error('Errore fetch like:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3317/notifications/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        const unread = data.filter(note => !note.read).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error('Errore fetch notifiche:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3317/moodboard/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setSavedImages(data))
      .catch(err => console.error('Errore fetch immagini moodboard:', err));
  }, [user]);

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === 'notifications') {
      setUnreadCount(0);

      // 🔄 Segna tutte le notifiche come lette nel backend
      notifications.forEach(note => {
        if (!note.read) {
          fetch(`http://localhost:3317/notifications/${note._id}/read`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          }).catch(err => console.error('Errore aggiornamento notifica:', err));
        }
      });
    }
  };

  const handleSaveProfile = () => {
    fetch('http://localhost:3317/profile/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        bio: profileData.bio,
        profileImage: profileData.profileImage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Profilo aggiornato', data);
        alert('Profilo aggiornato con successo!');
      })
      .catch((err) => {
        console.error('❌ Errore aggiornamento profilo:', err);
        alert('Errore durante il salvataggio');
      });
  };
  

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user-profiles'); 
    formData.append('folder', 'users/profiles');
  
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dah6kgv2c/image/upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      console.log('✅ Upload riuscito:', data.secure_url);
  
      setProfileData(prev => ({ ...prev, profileImage: data.secure_url }));
    } catch (error) {
      console.error('❌ Errore upload Cloudinary:', error);
    }
  };
  


  return (
    <div className="profile-container">



{profileData && (
  <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '1rem', position: 'relative' }}>
  {profileData.profileImage && profileData.profileImage.trim() !== '' ? (
  <img
    src={profileData.profileImage}
    alt="Immagine profilo"
    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
  />
) : (
  <img
    src="https://via.placeholder.com/120"
    alt="Immagine profilo di default"
    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
  />
)}

    <div>
      <h2 style={{ marginBottom: '5px' }}>{profileData.username}</h2>
      <p style={{ fontStyle: 'italic', color: '#aaa' }}>
        {profileData.bio || 'Nessuna bio disponibile'}
      </p>
    </div>

    {/* ✏️ Icona modifica */}
    <button
      onClick={() => setIsEditing(true)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.5rem',
        position: 'absolute',
        top: '0',
        right: '0',
      }}
      title="Modifica profilo"
    >
      ✏️
    </button>
  </div>
)}

{isEditing && (
  <div
    className={`modal-overlay ${isClosing ? 'fade-out' : ''}`}
    onClick={(e) => {
      if (e.target.classList.contains('modal-overlay')) {
        setIsClosing(true);
        setTimeout(() => {
          setIsEditing(false);
          setIsClosing(false);
        }, 300); // deve essere uguale al tempo dell'animazione
      }
    }}
  >
    <div className="modal-content">
      <h2>✏️ Modifica Bio e Immagine</h2>

      <input
        type="text"
        placeholder="Scrivi la tua nuova bio..."
        value={profileData.bio}
        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
        style={{ marginBottom: '10px' }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ marginBottom: '10px' }}
      />

      <input
        type="text"
        placeholder="oppure incolla un URL immagine profilo"
        value={profileData.profileImage}
        onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
        style={{ marginBottom: '10px' }}
      />

      {profileData.profileImage && (
        <img
          src={profileData.profileImage}
          alt="Preview"
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
        />
      )}

      <div>
       <button className='save-btn'
  onClick={() => {
    handleSaveProfile();            
    setIsClosing(true);
    setTimeout(() => {
      setIsEditing(false);
      setIsClosing(false);
    }, 300);
  }}
>
  Salva
</button>

        <button className='cancel-btn'
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setIsEditing(false);
              setIsClosing(false);
            }, 300);
          }}
        >
          Annulla
        </button>
      </div>
    </div>
  </div>
)}



      <div
        className="custom-toggle"
        style={{ '--active-index': ['myposts', 'likes', 'notifications', 'moodboard'].indexOf(view) }}
      >
        <button className={view === 'myposts' ? 'active' : ''} onClick={() => handleViewChange('myposts')}>My posts</button>
        <button className={view === 'likes' ? 'active' : ''} onClick={() => handleViewChange('likes')}>Liked</button>
        <button className={view === 'notifications' ? 'active' : ''} onClick={() => handleViewChange('notifications')}>
          Notifications {unreadCount > 0 && <span className="notification-dot">🔴</span>}
        </button>
        <button className={view === 'moodboard' ? 'active' : ''} onClick={() => handleViewChange('moodboard')}>Moodboard</button>
      </div>


      
      {view==='myposts' && (
        <ul className="profile-section-posts">
          {myPosts.map(post => (
            <li key={post._id}>
              <strong>{post.title}</strong> — {post.content}<br />

              {post.imageUrl && (
                post.imageUrl.includes('/posts/pdfs/') ? (
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.imageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >📄 View PDF

                  </a>
                ) : post.imageUrl.toLowerCase().endsWith('.mp4') ? (
                  <video controls width="300"><source src={post.imageUrl} type="video/mp4"/></video>
                ) : (
                  <img src={post.imageUrl} alt="Post" width="200" style={{borderRadius:'10px',marginTop:'10px'}} />
                )
              )}
            </li>
          ))}
        </ul>
      )}


{view==='likes' && (
        <ul className="profile-section-likes">
          {likedPosts.map(post => (
            <li key={post._id}>
              <strong>{post.title}</strong> — {post.content}<br />
              {post.imageUrl && (
                post.imageUrl.includes('/posts/pdfs/') ? (
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.imageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  > 📄 View PDF

                  </a>
                ) : post.imageUrl.toLowerCase().endsWith('.mp4') ? (
                  <video controls width="300"><source src={post.imageUrl} type="video/mp4"/></video>
                ) : (
                  <img src={post.imageUrl} alt="Post" width="200" />
                )
              )}
            </li>
          ))}
        </ul>
      )}

      {view === 'notifications' && (
        <ul className="profile-section-notifications">
          {notifications.map((note, index) => (
            <li key={index} style={{ fontWeight: note.read ? 'normal' : 'bold' }}>
              {note.read ? '🔔' : '🆕'} {note.message}
            </li>
          ))}
        </ul>
      )}

      {view === 'moodboard' && (
        <div>
          <h2> Moodboard</h2>
          <div style={{ marginTop: '2rem' }}>
            <h3> Dominant palette</h3>
            {globalPalette.length > 0 ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {globalPalette.map((rgb, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: `rgb(${rgb.join(',')})`,
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #ccc'
                    }}
                    title={`rgb(${rgb.join(',')})`}
                  />
                ))}
              </div>
            ) : (
              <p>Non hai ancora abbastanza immagini per una palette globale.</p>
            )}
          </div>
          <MoodboardSearch onSaveComplete={() => {
            fetch('http://localhost:3317/moodboard/me', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
              .then((res) => res.json())
              .then((data) => setSavedImages(data))
              .catch((err) => console.error('Errore fetch immagini moodboard:', err));

            fetch('http://localhost:3317/moodboard/palette/global', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
              .then((res) => res.json())
              .then((data) => setGlobalPalette(data.globalPalette || []))
              .catch((err) => console.error('Errore palette globale:', err));
          }} />

          <div className="moodboard-gallery">
            <div className="moodboard-grid">
              {savedImages.length === 0 ? (
                <p>Non hai ancora salvato immagini nella moodboard.</p>
              ) : (
                savedImages.map((img) => (
                  <div key={img._id} className="moodboard-card">
                    <img src={img.imageUrl} alt={img.tags} />
                    <p>{img.tags}</p>
                    {img.palette && img.palette.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        {img.palette.map((rgb, idx) => (
                          <div key={idx} style={{
                            backgroundColor: `rgb(${rgb.join(',')})`,
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: '1px solid #ccc'
                          }} title={`rgb(${rgb.join(',')})`} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

