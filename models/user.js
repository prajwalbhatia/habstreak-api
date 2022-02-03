import mongoose from 'mongoose';

const UserScema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    // required: true
  },
  fromGoogle: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  id: { type: String }
});

const User = mongoose.model('User', UserScema);

export default User;