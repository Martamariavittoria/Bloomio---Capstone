import mongoose from 'mongoose';

const MoodImageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  tags: String,
  palette: [[Number]]
}, { timestamps: true });

const MoodImage = mongoose.model('MoodImage', MoodImageSchema);
export default MoodImage;
