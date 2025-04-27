import jwt from 'jsonwebtoken';
import User from '../models/users.js';


export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token mancante' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email username');

    if (!user) return res.status(401).json({ message: 'Utente non trovato' });

    req.user = {
      id: user._id,
      email: user.email,
      username: user.username 
    };

    next();
  } catch (error) {
    console.error('❌ Errore nel verifyToken:', error);
    res.status(401).json({ message: 'Token non valido' });
  }
};
