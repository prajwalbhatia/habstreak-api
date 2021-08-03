import mongoose from 'mongoose';

const streakDetailSchema = mongoose.Schema({
  date : Date,
  description : {type : String , default : ''},
  reward : {type : Boolean , default : false},
  rewards: [{ type: String }],
  streakId: mongoose.Types.ObjectId
})

const StreakDetail = mongoose.model('StreakDetail' , streakDetailSchema);

export default StreakDetail;