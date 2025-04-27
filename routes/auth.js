import express from 'express';
import passport from 'passport';
import users from '../models/users.js';
import UserProfile from '../models/userProfile.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';
import { verifyToken } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/sendgrid.js'; 

const router = express.Router();
const upload = multer({ storage });

//* LOGIN
router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: 'Credenziali non valide' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ message: 'Login successful', token, user });
  })(req, res, next);
});

//* SIGNUP → con creazione automatica profilo
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new users({ username, email, password });
    const savedUser = await newUser.save();

    await UserProfile.create({
      user: savedUser._id,
      bio: '',
      profileImage: '',
    });

    await sendWelcomeEmail(email, username); //  QUI INVIAMO LA MAIL DI BENVENUTO

    const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ 
      message: 'Registrazione completata con successo', 
      token, 
      user: savedUser 
    });
  } catch (error) {
    console.error('❌ Errore nel signup:', error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Questa email è già registrata. Prova a fare login.' });
    }

    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({ message: 'Questo username è già in uso. Scegline un altro.' });
    }

    res.status(500).json({ error: error.message });
  }
});

//  UPLOAD IMMAGINE PROFILO
router.post('/upload/profile-picture', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const user = await users.findByIdAndUpdate(
      req.user.id,
      { profilePicture: req.file.path },
      { new: true }
    );

    res.status(200).json({ message: '✅ Immagine profilo aggiornata!', user });
  } catch (error) {
    console.error('❌ Errore upload immagine profilo:', error);
    res.status(500).json({ message: 'Errore durante il caricamento immagine' });
  }
});

export default router;
