import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/Landingpage';
import Home from './pages/Home';
import PublicProfile from './pages/PublicProfile'; // ✅ IMPORTA IL COMPONENTE PROFILO PUBBLICO
import Profile from './pages/Profile'; // ✅ IMPORTA IL COMPONENTE PROFILO PRIVATO
import MoodboardSearch from './components/MoodboardSearch';
import SinglePost from './components/SinglePost';



import { AuthProvider } from './context/AuthContext';

function App() {
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
        <Route path="/" element={<LandingPage />} />
  <Route path="/home" element={<Home />} />
  <Route path="/auth" element={<Auth />} />

  <Route path="/posts/:postId" element={<SinglePost />} />

  <Route path="/dashboard" element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } />

  <Route path="/profile/:userId" element={<PublicProfile />} />

  <Route path="/profile" element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  } />

  <Route path="/moodboard/search" element={
    <PrivateRoute>
      <MoodboardSearch />
    </PrivateRoute>
  } />
</Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
