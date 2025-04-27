import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  socialLinks: {
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  notifications: [
    {
      type: { type: String, enum: ['like', 'comment'], required: true },
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      createdAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ]
  
}, { timestamps: true }); // ⏰ crea automaticamente createdAt e updatedAt

export default mongoose.model('Profile', ProfileSchema);
