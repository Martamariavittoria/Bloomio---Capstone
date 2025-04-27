import express from 'express';
import User from '../models/users.js';
import UserProfile from '../models/userProfile.js';

const router = express.Router();

// 🔐 GET /profile/me → ritorna bio + immagine + username per l’utente loggato
router.get('/me', verifyToken, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user.id }).populate('user', 'username');

    
    if (!profile) {
      await UserProfile.create({
        user: req.user.id,
        bio: '',
        profileImage: ''
      });

      // Ricarico con populate
      profile = await UserProfile.findOne({ user: req.user.id }).populate('user', 'username');
    }

    res.status(200).json({
      username: profile.user.username,
      bio: profile.bio,
      profileImage: profile.profileImage,
    });
  } catch (error) {
    console.error('❌ Errore profilo privato:', error);
    res.status(500).json({ message: 'Errore nel recupero del profilo' });
  }
});



// 📄 GET /profile/:userId → ritorna bio + immagine + username
router.get('/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.params.userId }).populate('user', 'username');

    if (!profile) return res.status(404).json({ message: 'Profilo non trovato' });

    res.status(200).json({
      username: profile.user.username,
      bio: profile.bio,
      profileImage: profile.profileImage,
    });
  } catch (error) {
    console.error('❌ Errore profilo pubblico:', error);
    res.status(500).json({ message: 'Errore nel recupero del profilo' });
  }
});


import { verifyToken } from '../middleware/auth.js'; 


// ✏️ PATCH /profile/me → aggiorna bio e/o immagine
router.patch('/me', verifyToken, async (req, res) => {
  const { bio, profileImage } = req.body;

  try {
    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profilo non trovato' });

    if (bio !== undefined) profile.bio = bio;
    if (profileImage !== undefined) profile.profileImage = profileImage;

    await profile.save();

    res.status(200).json({
      username: profile.user.username,
      bio: profile.bio,
      profileImage: profile.profileImage,
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento profilo:', error);
    res.status(500).json({ message: 'Errore aggiornamento profilo' });
  }
});


export default router;
