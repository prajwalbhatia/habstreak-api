import RecentActivity from '../models/recentActivity.js';


export const getRecentActivities = async (req, res) => {
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  try {
    const userId = req.userId;
    const recentActivities = await RecentActivity.find({ userId });
    res.status(200).json(recentActivities);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}


