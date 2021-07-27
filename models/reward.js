import mongoose from 'mongoose';

const rewardSchema = mongoose.Schema({
  title: String,
  streakId: mongoose.Types.ObjectId,
  date: Date
});

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;