import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
