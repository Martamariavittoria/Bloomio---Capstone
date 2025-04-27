// ! Creo il file users.js dove definisco lo schema dell'utente e un metodo per configurare la password in modo sicuro 

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//* Pre-save: hash della password
UsersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//* Metodo per confrontare la password
UsersSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UsersSchema);
export default User;
