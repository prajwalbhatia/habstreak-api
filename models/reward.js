import mongoose from 'mongoose';

const rewardSchema = mongoose.Schema({
  userId: { type: String, require: true },
  title: String,
  streakId: mongoose.Types.ObjectId,
  date: Date,
  rewardEarned: { type: Boolean, default: false },
});

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;