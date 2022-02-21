import mongoose from 'mongoose';

const streakSchema = mongoose.Schema({
  userId : {type :  String , require : true},
  title: {type :  String , require : true},
  days: { type: String, require: true },
  description: String,
  rewards: [{ type: Object }],
  dateFrom: { type: Date , require : true},
  dateTo: { type: Date , require : true}
});

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;