import mongoose from 'mongoose';

const streakSchema = mongoose.Schema({
  title: String,
  days: String,
  description: String,
  date: {type : Date , default : Date.now}
});

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;