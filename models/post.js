import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }, //  post originale
  isShared: { type: Boolean, default: false } //  è una condivisione?
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
