import mongoose from 'mongoose';

const rewardSchema = mongoose.Schema({
  userId: { type: String, required: [true , 'Userid is required'] },
  title: {type : String , required : [true , 'Reward can\'t be created without name']},
  streakId: mongoose.Types.ObjectId,
  date: { type: String },
  rewardEarned: { type: Boolean, default: false },
});

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;