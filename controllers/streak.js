import Streak from '../models/streak.js';
import Reward from '../models/reward.js';
import RecentActivity from '../models/recentActivity.js';
import StreakDetail from "../models/streakDetail.js";

import moment from 'moment';
const ObjectId = mongoose.Types.ObjectId;

import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

import { activityObj, throwError } from '../utils.js';

export const getStreaks = asyncHandler(async (req, res, next) => {
  if (!req.userId) {
    throwError(next);
  }

  const userId = req.userId;
  //Aggregating the reward with streak
  const streaks = await Streak.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $lookup: {
        from: 'rewards',
        localField: '_id',
        foreignField: 'streakId',
        as: 'rewards'
      }
    },
  ]);

  res.status(200).json(streaks);
})

export const getStreak = asyncHandler(async (req, res, next) => {
  const streakId = req.params.id;

  if (!req.userId) {
    throwError(next);
  }

  const userId = req.userId;
  //Aggregating the reward with streak
  const streaks = await Streak.aggregate([
    {
      $match: { _id: ObjectId(streakId) }
    },
    {
      $lookup: {
        from: 'rewards',
        localField: '_id',
        foreignField: 'streakId',
        as: 'rewards'
      }
    },
  ]);

  res.status(200).json(streaks);
})

export const createStreak = asyncHandler(async (req, res, next) => {
  if (!req.userId) {
    throwError(next)
  }

  const streak = req.body;
  streak.userId = req.userId;

  const newStreak = new Streak(streak);
  const activity = activityObj(req.userId, 'create-streak', streak.title, moment().format());
  const newActivity = new RecentActivity(activity);
  // try {
  await newStreak.save();
  await newActivity.save();

  res.status(201).json(newStreak);
});

export const deleteStreak = async (req, res , next) => {
  const streakId = req.params.id;
  if (!req.userId) {
    throwError(next);
  }

  const streak = await Streak.findByIdAndDelete(streakId);
  const activity = activityObj(req.userId, 'delete-streak', streak.title, new Date());
  const newActivity = new RecentActivity(activity);
  await newActivity.save();

  if (!streak) {
    throwError(404, `Streak not found with id ${streakId}`, next);
  }

  //Deleting streak detail realated to streak
  await StreakDetail.deleteMany({ streakId });
  res.status(201).json({ message: "Streak deleted successfully" });
}

export const deleteStreakAndRewardUpdate = asyncHandler(async (req, res , next) => {
  const streakId = req.params.id;
  if (!req.userId) {
    throwError(next);
  }
  //Getting the rewards assosiated with particular streak
  //and removing the streak id and date field
  let userId = '';
  const rewards = await Reward.find({ streakId }).lean();

  if (rewards.length > 0) {
    userId = rewards[0].userId;
    await Promise.all(rewards.map(async (reward) => {
      if (!reward.rewardEarned) {
        let updatedReward = { ...reward }
        delete updatedReward.streakId;
        delete updatedReward.date

        await Reward.findByIdAndUpdate(reward._id, updatedReward, { new: true, overwrite: true });
      }
    }));
  }

  //Finding the streak and deleting 
  const streak = await Streak.findByIdAndDelete(streakId);
  const activity = activityObj(req.userId, 'delete-streak', streak.title, new Date());
  const newActivity = new RecentActivity(activity);
  await newActivity.save();

  if (!streak) {
    throwError(404, `Streak not found with id ${streakId}`, next);
  }

  // //Deleting streak detail realated to streak
  await StreakDetail.deleteMany({ streakId });
  res.status(201).json({ message: "Streak deleted successfully" });
})

export const updateStreak = asyncHandler(async (req, res , next) => {
  const { id: _id } = req.params;
  if (!req.userId) {
    throwError(next);
  }

  const streak = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) throwError(404, `${_id} is invalid`, next);

  const updatedStreak = await Streak.findByIdAndUpdate(_id, streak, { new: true });
  if (!updateStreak) throwError(404, `Streak not found with id ${_id}`, next);
  const activity = activityObj(req.userId, 'update-streak', streak.title, moment().format());
  const newActivity = new RecentActivity(activity);
  await newActivity.save();

  res.json(updatedStreak);
})
