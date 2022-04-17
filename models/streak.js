import mongoose from 'mongoose';

const streakSchema = mongoose.Schema({
  userId: { type: String, required : [true , 'User id is required']},
  title: { type: String, required : [true , 'Streak can\'t be created without Title']},
  days: { type: String, required: [true , 'Days are required'] },
  description: String,
  tag : String,
  rewards: [{ type: Object }],
  dateFrom: { type: String, required : [true , 'Starting date of streak is required']},
  dateTo: { type: String, required : [true , 'Ending date of streak is required']}
});

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;