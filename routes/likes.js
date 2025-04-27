import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Post from '../models/post.js';
import Notification from '../models/notification.js'; 

const router = express.Router();

router.post('/:postId/toggle', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });

    const userId = req.user.id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      // CREA NOTIFICA
      if (
        post.author.toString() !== userId &&
        req.user?.username &&
        post?.title
      ) {
        await Notification.create({
          recipient: post.author,
          message: `${req.user.username} ha messo like al tuo post "${post.title}"`,
        });
      }
      
      
    }

    await post.save();
    res.status(200).json({ message: hasLiked ? 'Like rimosso' : 'Like aggiunto', likes: post.likes });
  } catch (error) {
    console.error('❌ Errore toggle like:', error);
    res.status(500).json({ message: 'Errore nel mettere like' });
  }
});

//  Tutti i post a cui ho messo like
router.get('/me', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.user.id }).populate('author', 'username');
    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ Errore recupero post piaciuti:', error);
    res.status(500).json({ message: 'Errore nel recupero dei post piaciuti' });
  }
});

export default router;


