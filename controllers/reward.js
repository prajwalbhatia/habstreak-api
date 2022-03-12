import Reward from '../models/reward.js';
import RecentActivity from '../models/recentActivity.js';
import mongoose from 'mongoose';

import { activityObj, throwError } from '../utils.js';
import moment from 'moment';
import asyncHandler from 'express-async-handler';

export const getRewards = asyncHandler(async (req, res,next) => {
  if (!req.userId) throwError(next);

  const userId = req.userId;
  const rewards = await Reward.find({ userId });
  res.status(200).json(rewards);
});

export const createReward = asyncHandler(async (req, res,next) => {
  if (!req.userId) return throwError(next);

  const reward = req.body;

  //Getting the reward to check
  //if reward of same date and same streak exist or not
  const rewards = await Reward.find({ streakId: reward.streakId }).lean();

  const filter = rewards.filter((rewardItem) => {
    if (reward.date === moment(rewardItem.date).format('YYYY-MM-DD'))
      return reward
  })


  if (filter.length === 0) {
    reward.userId = req.userId;
    const newReward = new Reward(reward);

    const activity = activityObj(req.userId, 'create-reward', reward.title, new Date());
    const newActivity = new RecentActivity(activity);
    await newReward.save();
    await newActivity.save();

    res.status(201).json(newReward);
  }
  else {
    throwError(400, 'Reward for this streak on same date already exist', next);
  }
})

export const deleteReward = asyncHandler(async (req, res,next) => {
  const rewardId = req.params.id;
  if (!req.userId) return throwError(next);
  const reward = await Reward.findByIdAndDelete(rewardId);
  const activity = activityObj(req.userId, 'delete-reward', reward.title, new Date());
  const newActivity = new RecentActivity(activity);
  await newActivity.save();

  if (!reward) {
    throwError(404, `Reward not found with id ${rewardId}`, next);
  }

  res.status(201).json({ message: "Reward deleted successfully" });
});

export const deleteRewardsBulk = asyncHandler(async (req, res,next) => {
  const { streakId } = req.params;
  if (!req.userId) return throwError(next);
  const reward = await Reward.deleteMany({ streakId });

  if (!reward) {
    throwError(404, `Reward not found with id ${streakId}`, next);
  }

  res.status(201).json({ message: "Rewards deleted successfully" });
});

export const updateReward = asyncHandler(async (req, res,next) => {
  const { id: _id } = req.params;
  if (!req.userId) return throwError(next);
  const reward = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throwError(404, `${_id} is invalid`, next);
  }

  const updatedReward = await Reward.findByIdAndUpdate(_id, reward, { new: true });
  if (!updatedReward) {
    throwError(404, `Reward not found with id ${_id}`, next);
  }
  res.json(updatedReward);
});
