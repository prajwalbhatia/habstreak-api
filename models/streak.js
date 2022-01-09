import mongoose from 'mongoose';

const streakSchema = mongoose.Schema({
  userId : {type :  String , require : true},
  title: String,
  days: String,
  description: String,
  rewards: [{ type: Object }],
  date: {type : Date , default : Date.now}
});

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;