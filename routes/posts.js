import express from 'express';
import Post from '../models/post.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';
import Notification from '../models/notification.js';

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

const router = express.Router();

// 📌 Rotta per recuperare i post dell'utente loggato
router.get('/me', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ Errore fetch miei post:', error);
    res.status(500).json({ message: 'Errore nel recupero dei tuoi post' });
  }
});

// 🌍 ROTTA PUBBLICA: mostra tutti i post di tutti gli utenti
router.get('/public', async (req, res) => {
  try {
    const posts = await Post.find()
      // NON popoliamo l'autore
      .populate('author', 'username')

      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ Errore nel recupero dei post pubblici:', error);
    res.status(500).json({ message: 'Errore recupero post pubblici' });
  }
});

// 🔍 Rotta di ricerca: cerca per titolo o contenuto
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    })
      // NON popoliamo l'autore
      .populate('author', 'username')

      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ Errore ricerca post:', error);
    res.status(500).json({ message: 'Errore durante la ricerca' });
  }
});

// ✨ CREA UN NUOVO POST
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file?.path || '';

    if (!title || !content) {
      return res.status(400).json({ message: 'Titolo e contenuto obbligatori' });
    }

    const newPost = new Post({
      title,
      content,
      imageUrl,
      author: req.user.id,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ post: savedPost });
  } catch (error) {
    console.error('❌ Errore creazione post:', error);
    res.status(500).json({ message: 'Errore creazione post' });
  }
});

// 📄 Recupera un post singolo
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username') // Qui VA BENE popolare l'autore (solo quando si apre il singolo post)
      .populate('comments.user', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post non trovato' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('❌ Errore nel recupero del post:', error);
    res.status(500).json({ message: 'Errore nel recupero del post singolo' });
  }
});

// ✏️ MODIFICA UN POST
router.put('/:id', verifyToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    res.status(200).json({ post: updatedPost });
  } catch (error) {
    console.error('❌ Errore modifica post:', error);
    res.status(500).json({ message: 'Errore modifica' });
  }
});

// 🗑️ ELIMINA UN POST
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post eliminato con successo' });
  } catch (error) {
    console.error('❌ Errore eliminazione post:', error);
    res.status(500).json({ message: 'Errore eliminazione' });
  }
});

// 💬 Aggiungi un commento a un post
router.post('/:postId/comments', verifyToken, async (req, res) => {
  const { text } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });

    const comment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        message: `${req.user.username} ha commentato il tuo post "${post.title}": "${text}"`,
      });
    }

    const populatedPost = await Post.findById(req.params.postId).populate('comments.user', 'username');
    res.status(201).json(populatedPost.comments);
  } catch (error) {
    console.error('❌ Errore aggiunta commento:', error);
    res.status(500).json({ message: 'Errore aggiunta commento' });
  }
});

// 📥 Recupera i commenti di un post
router.get('/:postId/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments.user', 'username');
    if (!post) return res.status(404).json({ message: 'Post non trovato' });

    res.status(200).json(post.comments);
  } catch (error) {
    console.error('❌ Errore fetch commenti:', error);
    res.status(500).json({ message: 'Errore recupero commenti' });
  }
});

// 🗑️ Elimina un commento
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commento non trovato' });

    if (comment.user.toString() !== String(req.user.id)) {
      return res.status(403).json({ message: 'Non puoi eliminare commenti di altri utenti.' });
    }

    comment.deleteOne();
    await post.save();

    const updatedPost = await Post.findById(req.params.postId).populate('comments.user', 'username');
    res.status(200).json(updatedPost.comments);
  } catch (error) {
    console.error('❌ ERRORE BACKEND:', error.message);
    res.status(500).json({ message: 'Errore cancellazione commento' });
  }
});

// 🔄 Condividi un post
router.post('/:postId/share', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trovato' });
    }

    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${post._id}`;
    res.status(200).json({ link });
  } catch (error) {
    console.error('❌ Errore generazione link di condivisione:', error);
    res.status(500).json({ message: 'Errore nella generazione del link' });
  }
});

export default router;
