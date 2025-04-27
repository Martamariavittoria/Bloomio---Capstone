import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css'; 
import logo from '../assets/logo.png';      

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
    <div className="logo">
    <div className="logo">
       <Link to="/">
         <img src={logo} alt="Bloomio logo" className="logo-img" />
         <span className="logo-text">Bloomio</span>
       </Link>
     </div>
    </div>
    <div className="nav-links">
      {user ? (
        <>
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profilo</Link>
          <span className="user-name"> {user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/auth?form=login">Login</Link>
      )}
    </div>
  </nav>
  
  );
}

export default Navbar;
