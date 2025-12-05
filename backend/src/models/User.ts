import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: 'User', enum: ['Admin', 'User'] },
  profile_image: { type: String, default: '' }, // profile image filename
  phone: { type: String, default: '' }, // phone number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
