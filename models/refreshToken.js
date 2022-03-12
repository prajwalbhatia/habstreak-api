import mongoose from 'mongoose';

const refreshToken = mongoose.Schema({
  refreshToken: { type: String, required: [true, 'Token is required'] },
});

const RefreshToken = mongoose.model('RefreshToken', refreshToken);

export default RefreshToken;