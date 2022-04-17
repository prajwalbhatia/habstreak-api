import mongoose from 'mongoose';

const recentACtivitySchema = mongoose.Schema({
  userId: { type: String, require: true },
  type : String,
  title: String,
  date: String,
});

const RecentActivity = mongoose.model('RecentActivity', recentACtivitySchema);

export default RecentActivity;