import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './middleware/passport.js';
import connectMongose from './config/db.js';
import http from 'http'; // ✅ Serve per creare httpServer
import { Server } from 'socket.io'; // ✅ Socket.IO
import likeRoutes from './routes/likes.js';
import notificationRoutes from './routes/notifications.js';
import moodboardRoutes from './routes/moodboard.js';
import profileRoutes from './routes/profile.js'; // ✅ ora è attiva
        // ✅ ora funziona




// Importo le rotte che ho creato

import authRoutes from './routes/auth.js';       
import postRoutes from './routes/posts.js';       
/* import likeRoutes from './routes/likes.js';       
import profileRoutes from './routes/profile.js';   */

dotenv.config();
connectMongose();  // Connessione al database

const PORT = process.env.PORT || 3317;

const server = express(); // 👈 La tua app Express si chiama "server"
const httpServer = http.createServer(server); // 👈 Server HTTP vero e proprio

// Middleware
server.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
/* server.use(express.json()); */

server.use(express.json({ limit: '100mb' }));
server.use(express.urlencoded({ extended: true, limit: '100mb' }));


// SOCKET.IO
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('✅ Nuova connessione socket:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`🧍‍♂️ Utente ${userId} registrato con socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('❌ Socket disconnesso:', socket.id);
  });
});



// Sessioni (se ti servono)
/* server.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
})); */

// Passport
server.use(passport.initialize());
/* server.use(passport.session()); */

// Rotte
server.use('/auth', authRoutes);
server.use('/posts', postRoutes);
server.use('/posts', postRoutes); // già lo stai facendo ✅
server.use('/likes', likeRoutes);
server.use('/notifications', notificationRoutes);
server.use('/moodboard', moodboardRoutes);
/* server.use('/likes', likeRoutes);
server.use('/profile', profileRoutes); */
server.use('/profile', profileRoutes);   
// Avvio server HTTP + Socket.IO
httpServer.listen(PORT, () => {
  console.log(`🚀 Server con socket attivo su http://localhost:${PORT}`);
});

// Esporta per usarlo nei controller
export { io, connectedUsers };






