import asyncHandler from 'express-async-handler';
import RecentActivity from '../models/recentActivity.js';
import { throwError } from '../utils.js';


export const getRecentActivities = asyncHandler(async (req, res , next) => {
  if (!req.userId) throwError(next);

  const userId = req.userId;
  const recentActivities = await RecentActivity.find({ userId });

  const sortedData = recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json(sortedData);
});


