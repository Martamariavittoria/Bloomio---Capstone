import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import MoodImage from '../models/moodImage.js';
import getColors from 'get-image-colors';

const router = express.Router();

// POST – salva un'immagine della moodboard
router.post('/', verifyToken, async (req, res) => {
  try {
    const { imageUrl, tags } = req.body;

    const colors = await getColors(imageUrl);
    const palette = colors.map(c => c.rgb());

    if (!palette || palette.length === 0) {
      return res.status(400).json({ message: 'Palette vuota, immagine non valida.' });
    }

    const newImage = new MoodImage({
      user: req.user.id,
      imageUrl,
      tags,
      palette
    });

    const saved = await newImage.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Errore salvataggio moodboard:', error);
    res.status(500).json({ message: 'Errore salvataggio moodboard' });
  }
});

// GET – recupera tutte le immagini salvate dall’utente
router.get('/me', verifyToken, async (req, res) => {
  try {
    const images = await MoodImage.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error('❌ Errore recupero moodboard:', error);
    res.status(500).json({ message: 'Errore recupero immagini moodboard' });
  }
});

// GET – palette globale dell'utente
router.get('/palette/global', verifyToken, async (req, res) => {
  try {
    const images = await MoodImage.find({ user: req.user.id });
    const allColors = images.flatMap(img => img.palette || []);

    const colorMap = {};
    allColors.forEach(rgb => {
      const key = rgb.join(',');
      colorMap[key] = (colorMap[key] || 0) + 1;
    });

    const sorted = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rgb]) => rgb.split(',').map(Number));

    res.json({ globalPalette: sorted });
  } catch (err) {
    console.error('❌ Errore generazione palette globale:', err);
    res.status(500).json({ message: 'Errore generazione palette globale' });
  }
});

// GET – palette globale di un altro utente (pubblica)
router.get('/palette/:userId', async (req, res) => {
  try {
    const images = await MoodImage.find({ user: req.params.userId });
    const allColors = images.flatMap(img => img.palette || []);

    const colorMap = {};
    allColors.forEach(rgb => {
      const key = rgb.join(',');
      colorMap[key] = (colorMap[key] || 0) + 1;
    });

    const sorted = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rgb]) => rgb.split(',').map(Number));

    res.json({ globalPalette: sorted });
  } catch (err) {
    console.error('❌ Errore palette pubblica:', err);
    res.status(500).json({ message: 'Errore generazione palette utente' });
  }
});

export default router;
