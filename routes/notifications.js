// routes/notifications.js
import express from 'express';
import Notification from '../models/notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// 🔔 GET /notifications/me → recupera tutte le notifiche ricevute dall'utente loggato
router.get('/me', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Errore fetch notifiche:', error);
    res.status(500).json({ message: 'Errore recupero notifiche' });
  }
});

// ✅ PATCH /notifications/:id/read → segna una notifica come letta
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notifica non trovata' });

    res.status(200).json(notification);
  } catch (error) {
    console.error('❌ Errore nel segnare come letta:', error);
    res.status(500).json({ message: 'Errore aggiornamento notifica' });
  }
});




export default router;
